"""Camoufox execution engine and multi-session orchestration."""
from __future__ import annotations

import asyncio
import logging
import random
import uuid
from dataclasses import dataclass, field
from typing import Awaitable, Callable
from urllib.parse import urlparse

from camoufox.async_api import AsyncCamoufox

from .behavior import BehaviorConfig, exercise_page

LOGGER = logging.getLogger(__name__)
ProgressCallback = Callable[[str, int, int, str], Awaitable[None]]


@dataclass(frozen=True)
class RunConfig:
    target_url: str
    visits: int
    min_duration: float
    max_duration: float
    scrolling_enabled: bool = True
    proxy_server: str = ""
    proxy_username: str = ""
    proxy_password: str = ""
    navigation_timeout_ms: int = 45_000
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
        self.behavior.validate()

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
    """Run one configuration. Each visit receives a new context and closed context."""

    def __init__(self, session_id: str, config: RunConfig, progress: ProgressCallback) -> None:
        self.session_id = session_id
        self.config = config
        self.progress = progress
        self._stop_requested = asyncio.Event()

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
        await self.progress(self.session_id, 0, self.config.visits, "Starting")
        async with AsyncCamoufox(headless=True, proxy=self.config.proxy(), humanize=True, enable_cache=False) as browser:
            for visit in range(1, self.config.visits + 1):
                if self._stop_requested.is_set():
                    await self.progress(self.session_id, visit - 1, self.config.visits, "Stopped")
                    return
                duration = random.uniform(self.config.min_duration, self.config.max_duration)
                context = None
                try:
                    await self.progress(self.session_id, visit - 1, self.config.visits, f"Launching visit {visit}")
                    context = await browser.new_context()
                    page = await context.new_page()
                    page.set_default_navigation_timeout(self.config.navigation_timeout_ms)
                    await page.goto(self.config.target_url.strip(), wait_until="domcontentloaded")
                    await self.progress(self.session_id, visit - 1, self.config.visits, f"Active · {duration:.1f}s")
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
                await self.progress(self.session_id, visit, self.config.visits, f"Completed visit {visit}")
        await self.progress(self.session_id, self.config.visits, self.config.visits, "Complete")


class SessionManager:
    """Bounded session queue with per-session and global cancellation."""

    def __init__(self, progress: ProgressCallback, max_parallel: int = 2) -> None:
        if max_parallel < 1:
            raise ValueError("max_parallel must be at least 1")
        self.progress = progress
        self.max_parallel = max_parallel
        self._engines: dict[str, PerformanceEngine] = {}
        self._tasks: dict[str, asyncio.Task[None]] = {}
        self._semaphore = asyncio.Semaphore(max_parallel)
        self._stop_all_requested = False
        self._shutdown = asyncio.Event()

    def add(self, config: RunConfig) -> str:
        config.validate()
        session_id = uuid.uuid4().hex[:8]
        engine = PerformanceEngine(session_id, config, self.progress)
        self._engines[session_id] = engine
        task = asyncio.create_task(self._run_queued(session_id, engine), name=f"session-{session_id}")
        self._tasks[session_id] = task
        return session_id

    async def _run_queued(self, session_id: str, engine: PerformanceEngine) -> None:
        try:
            if self._stop_all_requested:
                await self.progress(session_id, 0, engine.config.visits, "Stopped before start")
                return
            await self.progress(session_id, 0, engine.config.visits, "Queued")
            async with self._semaphore:
                if self._stop_all_requested:
                    await self.progress(session_id, 0, engine.config.visits, "Stopped before start")
                    return
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
        engine = self._engines.get(session_id)
        if engine:
            engine.request_stop()

    def stop_all(self) -> None:
        self._stop_all_requested = True
        for engine in list(self._engines.values()):
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
