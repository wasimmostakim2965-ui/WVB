"""Camoufox execution engine with bounded, observable internal test sessions."""
from __future__ import annotations

import asyncio
import logging
import random
import time
import uuid
from dataclasses import dataclass, field
from typing import Awaitable, Callable
from urllib.parse import unquote, urlparse

from camoufox.async_api import AsyncCamoufox

from .behavior import BehaviorConfig, exercise_page
from .proxy import ProxySessionManager
from .resources import ResourceMonitor

LOGGER = logging.getLogger(__name__)
ProgressCallback = Callable[[str, int, int, str], Awaitable[None]]


class AsyncRateLimiter:
    """Global minimum-interval limiter with interruptible cancellation."""

    def __init__(self, visits_per_minute: float = 0.0) -> None:
        if visits_per_minute < 0:
            raise ValueError("Visits rate limit cannot be negative")
        self.interval = 60.0 / visits_per_minute if visits_per_minute else 0.0
        self._next_allowed = 0.0
        self._lock = asyncio.Lock()

    async def wait(self, stop_event: asyncio.Event | None = None) -> bool:
        if not self.interval:
            return not stop_event.is_set() if stop_event else True
        async with self._lock:
            now = time.monotonic()
            delay = max(0.0, self._next_allowed - now)
            self._next_allowed = max(now, self._next_allowed) + self.interval
        if delay <= 0:
            return not stop_event.is_set() if stop_event else True
        if stop_event is None:
            await asyncio.sleep(delay)
            return True
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=delay)
        except asyncio.TimeoutError:
            return True
        return False


@dataclass(frozen=True)
class ClientProfile:
    """Declared QA dimensions, not stealth or identity-evasion settings."""

    name: str
    width: int
    height: int
    locale: str = "en-US"
    user_agent: str = ""

    def validate(self) -> None:
        if self.width < 320 or self.height < 240:
            raise ValueError("Client profile viewport is too small")
        if not self.locale or len(self.locale) > 32:
            raise ValueError("Client profile locale is invalid")
        if len(self.user_agent) > 512:
            raise ValueError("Client profile user-agent is too long")


@dataclass(frozen=True)
class RunConfig:
    target_url: str
    visits: int
    min_duration: float
    max_duration: float
    scrolling_enabled: bool = True
    speed: str = "auto"
    proxy_server: str = ""
    proxy_username: str = ""
    proxy_password: str = ""
    proxy_mode: str = "none"
    proxy_list: tuple[str, ...] = ()
    navigation_timeout_ms: int = 45_000
    max_concurrent_visits: int = 2
    visits_per_minute: float = 0.0
    readiness_policy: str = "domcontentloaded"
    readiness_selector: str = ""
    test_marker: str = "WVB-internal-test"
    request_headers: tuple[tuple[str, str], ...] = ()
    client_profiles: tuple[ClientProfile, ...] = ()
    behavior: BehaviorConfig = field(default_factory=BehaviorConfig)

    def validate(self) -> None:
        parsed = urlparse(self.target_url.strip())
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Target URL must be an http:// or https:// URL")
        if self.visits < 1:
            raise ValueError("Visits must be at least 1")
        if self.min_duration <= 0 or self.max_duration < self.min_duration:
            raise ValueError("Duration range is invalid")
        if self.navigation_timeout_ms < 1_000:
            raise ValueError("Navigation timeout must be at least 1000 ms")
        if self.max_concurrent_visits < 1:
            raise ValueError("Max concurrent visits must be at least 1")
        if self.visits_per_minute < 0:
            raise ValueError("Visits rate limit cannot be negative")
        if self.readiness_policy not in {"domcontentloaded", "load", "commit", "selector"}:
            raise ValueError("Readiness policy must be domcontentloaded, load, commit, or selector")
        if self.readiness_policy == "selector" and not self.readiness_selector.strip():
            raise ValueError("A readiness selector is required when selector policy is selected")
        if not self.test_marker.strip() or len(self.test_marker) > 128:
            raise ValueError("Test marker is required and must be at most 128 characters")
        for name, value in self.request_headers:
            if not name.strip() or "\n" in name or "\r" in name or "\n" in value or "\r" in value:
                raise ValueError("Request header names and values must be non-empty and newline-free")
        if self.proxy_mode not in {"none", "static", "rotating"}:
            raise ValueError("Proxy mode must be none, static, or rotating")
        if self.proxy_mode == "static" and not self.proxy_list:
            raise ValueError("Static proxy mode requires at least one proxy entry")
        self.proxy_provider().validate()
        self.behavior.validate()
        for profile in self.client_profiles:
            profile.validate()
        normalized_speed = str(self.speed).lower()
        if normalized_speed not in {"auto", "max"}:
            try:
                if not 1 <= int(normalized_speed) <= 10:
                    raise ValueError
            except ValueError as exc:
                raise ValueError("Speed must be Auto, Max, or an integer from 1 to 10") from exc

    def proxy(self) -> dict[str, str] | None:
        provider = self.proxy_provider()
        if provider.mode == "static":
            return provider._parse_entry(provider.static_entries[0])
        if provider.mode == "none":
            return None
        return provider._parse_url(provider.gateway)

    def proxy_provider(self) -> ProxySessionManager:
        return ProxySessionManager(self.proxy_mode, self.proxy_server, self.proxy_username, self.proxy_password, self.proxy_list)


@dataclass
class VisitMetrics:
    success: int = 0
    failure: int = 0
    timeout: int = 0
    cancelled: int = 0
    latency_total: float = 0.0
    navigation_total: float = 0.0
    dwell_total: float = 0.0

    @property
    def latency_avg(self) -> float:
        completed = self.success + self.failure + self.timeout
        return self.latency_total / completed if completed else 0.0


class PerformanceEngine:
    """One pooled browser process with a fresh ephemeral context per visit."""

    def __init__(self, session_id: str, config: RunConfig, progress: ProgressCallback, rate_limiter: AsyncRateLimiter | None = None) -> None:
        self.session_id = session_id
        self.config = config
        self.progress = progress
        self._stop_requested = asyncio.Event()
        self._pause_requested = asyncio.Event()
        self._resources = ResourceMonitor(status=lambda text: self.progress(self.session_id, 0, self.config.visits, text))
        self._rate_limiter = rate_limiter or AsyncRateLimiter(config.visits_per_minute)
        self.metrics = VisitMetrics()

    def request_stop(self) -> None:
        self._stop_requested.set()

    def pause(self) -> None:
        self._pause_requested.set()

    def resume(self) -> None:
        self._pause_requested.clear()

    async def _wait_if_paused(self) -> bool:
        while self._pause_requested.is_set() and not self._stop_requested.is_set():
            await asyncio.sleep(0.1)
        return not self._stop_requested.is_set()

    async def _navigate(self, page) -> None:
        if self.config.readiness_policy == "selector":
            await page.goto(self.config.target_url.strip(), wait_until="domcontentloaded")
            await page.wait_for_selector(self.config.readiness_selector.strip(), state="visible")
        else:
            await page.goto(self.config.target_url.strip(), wait_until=self.config.readiness_policy)

    async def run(self) -> None:
        self.config.validate()
        behavior = self.config.behavior
        await self.progress(self.session_id, 0, self.config.visits, "Starting ephemeral browser worker")
        proxy_provider = self.config.proxy_provider()
        for visit in range(1, self.config.visits + 1):
            if not await self._wait_if_paused():
                self.metrics.cancelled += self.config.visits - visit + 1
                return
            if self._stop_requested.is_set():
                self.metrics.cancelled += self.config.visits - visit + 1
                await self.progress(self.session_id, visit - 1, self.config.visits, self._summary("Stopped"))
                return
            snapshot = await self._resources.wait_until_ready(self._stop_requested)
            if snapshot is None:
                self.metrics.cancelled += self.config.visits - visit + 1
                await self.progress(self.session_id, visit - 1, self.config.visits, self._summary("Stopped"))
                return
            if not await self._rate_limiter.wait(self._stop_requested):
                self.metrics.cancelled += self.config.visits - visit + 1
                await self.progress(self.session_id, visit - 1, self.config.visits, self._summary("Stopped"))
                return
            if not await self._resources.pace(self.config.speed, self._stop_requested):
                self.metrics.cancelled += self.config.visits - visit + 1
                await self.progress(self.session_id, visit - 1, self.config.visits, self._summary("Stopped"))
                return
            duration = random.uniform(self.config.min_duration, self.config.max_duration)
            context = None
            started = time.monotonic()
            outcome = "failure"
            try:
                profile = random.choice(self.config.client_profiles) if self.config.client_profiles else None
                headers = dict(self.config.request_headers)
                headers.update({"X-WVB-Test-Marker": self.config.test_marker, "X-WVB-Session": self.session_id})
                context_options = {"extra_http_headers": headers}
                if profile:
                    context_options.update({"viewport": {"width": profile.width, "height": profile.height}, "locale": profile.locale})
                    if profile.user_agent:
                        context_options["user_agent"] = profile.user_agent
                await self.progress(self.session_id, visit - 1, self.config.visits, f"Launching isolated context {visit} · CPU {snapshot.cpu_percent:.0f}% RAM {snapshot.memory_percent:.0f}%")
                async with AsyncCamoufox(headless=True, proxy=await proxy_provider.acquire(), humanize=True, enable_cache=False) as browser:
                    context = await browser.new_context(**context_options)
                    try:
                        page = await context.new_page()
                        page.set_default_navigation_timeout(self.config.navigation_timeout_ms)
                        navigation_started = time.monotonic()
                        await self._navigate(page)
                        self.metrics.navigation_total += time.monotonic() - navigation_started
                        await self.progress(self.session_id, visit - 1, self.config.visits, f"Ready ({self.config.readiness_policy}) · Active {duration:.1f}s")
                        dwell_started = time.monotonic()
                        if await exercise_page(page, duration, behavior, self._stop_requested):
                            self.metrics.dwell_total += time.monotonic() - dwell_started
                            outcome = "success"
                        else:
                            self.metrics.dwell_total += time.monotonic() - dwell_started
                            self.metrics.cancelled += 1
                            await self.progress(self.session_id, visit - 1, self.config.visits, self._summary("Stopped"))
                            return
                    finally:
                        await context.close()
            except asyncio.CancelledError:
                self.metrics.cancelled += 1
                raise
            except Exception as exc:
                LOGGER.exception("Session %s visit %d failed", self.session_id, visit)
                if "Timeout" in type(exc).__name__:
                    self.metrics.timeout += 1
                    outcome = "timeout"
                await self.progress(self.session_id, visit - 1, self.config.visits, f"Failed · {type(exc).__name__}")
            finally:
                self.metrics.latency_total += time.monotonic() - started
                if outcome == "success":
                    self.metrics.success += 1
                elif outcome == "failure":
                    self.metrics.failure += 1
            await self.progress(self.session_id, visit, self.config.visits, f"Visit {visit} {outcome}")
        await self.progress(self.session_id, self.config.visits, self.config.visits, self._summary("Complete"))

    def _summary(self, state: str) -> str:
        return f"{state} · success={self.metrics.success} failure={self.metrics.failure} timeout={self.metrics.timeout} nav={self.metrics.navigation_total:.2f}s dwell={self.metrics.dwell_total:.2f}s avg={self.metrics.latency_avg:.2f}s"


class SessionManager:
    """Bounded session queue with explicit cancellation states."""

    def __init__(self, progress: ProgressCallback, max_parallel: int = 2, visits_per_minute: float = 0.0, max_queue: int = 100) -> None:
        if max_parallel < 1:
            raise ValueError("max_parallel must be at least 1")
        self.progress = progress
        self.max_parallel = max_parallel
        if max_queue < max_parallel:
            raise ValueError("max_queue must be at least max_parallel")
        self.max_queue = max_queue
        self._rate_limiter = AsyncRateLimiter(visits_per_minute)
        self._engines: dict[str, PerformanceEngine] = {}
        self._tasks: dict[str, asyncio.Task[None]] = {}
        self._semaphore = asyncio.Semaphore(max_parallel)
        self._stop_all_requested = False
        self._shutdown = asyncio.Event()

    def add(self, config: RunConfig) -> str:
        if self._stop_all_requested:
            raise RuntimeError("Session manager is stopping; start a new worker before adding work")
        if len(self._tasks) >= self.max_queue:
            raise RuntimeError("Session queue is full; reduce the target rate or wait for work to finish")
        config.validate()
        session_id = uuid.uuid4().hex[:8]
        engine = PerformanceEngine(session_id, config, self.progress, self._rate_limiter)
        self._engines[session_id] = engine
        self._tasks[session_id] = asyncio.create_task(self._run_queued(session_id, engine), name=f"session-{session_id}")
        return session_id

    async def _run_queued(self, session_id: str, engine: PerformanceEngine) -> None:
        try:
            await self.progress(session_id, 0, engine.config.visits, "Queued")
            async with self._semaphore:
                if self._stop_all_requested:
                    await self.progress(session_id, 0, engine.config.visits, "Cancelled · queued work discarded")
                else:
                    await engine.run()
        except asyncio.CancelledError:
            await self.progress(session_id, 0, engine.config.visits, "Cancelled")
        except Exception as exc:
            LOGGER.exception("Session %s failed", session_id)
            await self.progress(session_id, 0, engine.config.visits, f"Error · {type(exc).__name__}")
        finally:
            self._engines.pop(session_id, None)
            self._tasks.pop(session_id, None)

    def stop(self, session_id: str) -> None:
        if engine := self._engines.get(session_id):
            engine.request_stop()

    def pause(self, session_id: str) -> None:
        if engine := self._engines.get(session_id):
            engine.pause()

    def resume(self, session_id: str) -> None:
        if engine := self._engines.get(session_id):
            engine.resume()

    def stop_all(self) -> None:
        self._stop_all_requested = True
        for engine in tuple(self._engines.values()):
            engine.request_stop()
        self._shutdown.set()

    def shutdown(self) -> None:
        self._shutdown.set()

    async def run_until_shutdown(self) -> None:
        await self._shutdown.wait()
        await self.wait()

    async def wait(self) -> None:
        if self._tasks:
            await asyncio.gather(*list(self._tasks.values()), return_exceptions=True)

    @property
    def active_ids(self) -> tuple[str, ...]:
        return tuple(self._tasks)
