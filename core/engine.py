"""Camoufox execution engine and bounded multi-session orchestration."""
from __future__ import annotations

import asyncio
import gc
import logging
import random
import time
import uuid
from dataclasses import dataclass, field
from typing import Awaitable, Callable
from urllib.parse import urlparse

from camoufox.async_api import AsyncCamoufox

from .behavior import BehaviorConfig, exercise_page
from .resources import ResourceMonitor

LOGGER = logging.getLogger(__name__)
ProgressCallback = Callable[[str, int, int, str], Awaitable[None]]


class AsyncRateLimiter:
    """Minimum interval limiter; zero means unlimited."""

    def __init__(self, visits_per_minute: float = 0.0) -> None:
        if visits_per_minute < 0:
            raise ValueError("Visits rate limit cannot be negative")
        self.interval = 60.0 / visits_per_minute if visits_per_minute else 0.0
        self._next_allowed = 0.0
        self._lock = asyncio.Lock()

    async def wait(self) -> None:
        if not self.interval:
            return
        async with self._lock:
            now = time.monotonic()
            delay = max(0.0, self._next_allowed - now)
            self._next_allowed = max(now, self._next_allowed) + self.interval
        if delay:
            await asyncio.sleep(delay)


@dataclass(frozen=True)
class ClientProfile:
    """Non-identity QA dimensions for responsive-layout testing."""

    name: str
    width: int
    height: int
    locale: str = "en-US"

    def validate(self) -> None:
        if self.width < 320 or self.height < 240:
            raise ValueError("Client profile viewport is too small")
        if not self.locale or len(self.locale) > 32:
            raise ValueError("Client profile locale is invalid")


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
    navigation_timeout_ms: int = 45_000
    max_concurrent_visits: int = 2
    visits_per_minute: float = 0.0
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
        server = self.proxy_server.strip()
        if not server:
            return None
        parsed = urlparse(server)
        if parsed.scheme not in {"http", "https", "socks4", "socks5"} or not parsed.netloc:
            raise ValueError("Proxy must use http, https, socks4, or socks5 URL syntax")
        result = {"server": server}
        if self.proxy_username.strip():
            result["username"] = self.proxy_username.strip()
        if self.proxy_password:
            result["password"] = self.proxy_password
        return result


class PerformanceEngine:
    """Reuse one browser process and isolate every visit in a new context."""

    def __init__(self, session_id: str, config: RunConfig, progress: ProgressCallback, rate_limiter: AsyncRateLimiter | None = None) -> None:
        self.session_id = session_id
        self.config = config
        self.progress = progress
        self._stop_requested = asyncio.Event()
        self._resources = ResourceMonitor(status=lambda text: self.progress(self.session_id, 0, self.config.visits, text))
        self._rate_limiter = rate_limiter or AsyncRateLimiter(config.visits_per_minute)

    def request_stop(self) -> None:
        self._stop_requested.set()

    async def run(self) -> None:
        self.config.validate()
        behavior = BehaviorConfig(
            scrolling_enabled=self.config.scrolling_enabled,
            min_pause_ms=self.config.behavior.min_pause_ms,
            max_pause_ms=self.config.behavior.max_pause_ms,
            scroll_step_min=self.config.behavior.scroll_step_min,
            scroll_step_max=self.config.behavior.scroll_step_max,
            max_scrolls=self.config.behavior.max_scrolls,
            pointer_moves=self.config.behavior.pointer_moves,
        )
        await self.progress(self.session_id, 0, self.config.visits, "Starting persistent browser")
        async with AsyncCamoufox(headless=True, proxy=self.config.proxy(), humanize=True, enable_cache=False) as browser:
            for visit in range(1, self.config.visits + 1):
                if self._stop_requested.is_set():
                    await self.progress(self.session_id, visit - 1, self.config.visits, "Stopped")
                    return
                snapshot = await self._resources.wait_until_ready()
                await self._rate_limiter.wait()
                await self._resources.pace(self.config.speed)
                duration = random.uniform(self.config.min_duration, self.config.max_duration)
                context = None
                try:
                    profile = random.choice(self.config.client_profiles) if self.config.client_profiles else None
                    context_options = {}
                    if profile:
                        context_options = {"viewport": {"width": profile.width, "height": profile.height}, "locale": profile.locale}
                    await self.progress(self.session_id, visit - 1, self.config.visits, f"Launching isolated context {visit} · CPU {snapshot.cpu_percent:.0f}% RAM {snapshot.memory_percent:.0f}%")
                    context = await browser.new_context(**context_options)
                    page = await context.new_page()
                    page.set_default_navigation_timeout(self.config.navigation_timeout_ms)
                    await page.goto(self.config.target_url.strip(), wait_until="networkidle")
                    await self.progress(self.session_id, visit - 1, self.config.visits, f"Network idle · Active {duration:.1f}s")
                    await exercise_page(page, duration, behavior)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    LOGGER.exception("Session %s visit %d failed", self.session_id, visit)
                    await self.progress(self.session_id, visit - 1, self.config.visits, f"Failed · {type(exc).__name__}")
                finally:
                    if context is not None:
                        try:
                            await context.close()
                        except Exception:
                            LOGGER.exception("Session %s context cleanup failed", self.session_id)
                    gc.collect()
                await self.progress(self.session_id, visit, self.config.visits, f"Completed visit {visit}")
        await self.progress(self.session_id, self.config.visits, self.config.visits, "Complete")


class SessionManager:
    """Bounded session queue with per-session cancellation."""

    def __init__(self, progress: ProgressCallback, max_parallel: int = 2, visits_per_minute: float = 0.0) -> None:
        if max_parallel < 1:
            raise ValueError("max_parallel must be at least 1")
        self.progress = progress
        self.max_parallel = max_parallel
        self._rate_limiter = AsyncRateLimiter(visits_per_minute)
        self._engines: dict[str, PerformanceEngine] = {}
        self._tasks: dict[str, asyncio.Task[None]] = {}
        self._semaphore = asyncio.Semaphore(max_parallel)
        self._stop_all_requested = False
        self._shutdown = asyncio.Event()

    def add(self, config: RunConfig) -> str:
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
                if not self._stop_all_requested:
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

    def stop_all(self) -> None:
        self._stop_all_requested = True
        for engine in self._engines.values():
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
