"""Async Camoufox runner with strict per-visit context isolation."""
from __future__ import annotations

import asyncio
import logging
import random
from dataclasses import dataclass, field
from typing import Awaitable, Callable
from urllib.parse import urlparse

from camoufox.async_api import AsyncCamoufox

from .behavior import BehaviorConfig, exercise_page

LOGGER = logging.getLogger(__name__)
ProgressCallback = Callable[[int, int, str], Awaitable[None]]


@dataclass(frozen=True)
class RunConfig:
    target_url: str
    visits: int
    min_duration: float
    max_duration: float
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
    def __init__(self, config: RunConfig, progress: ProgressCallback) -> None:
        self.config = config
        self.progress = progress
        self._stop_requested = asyncio.Event()

    def request_stop(self) -> None:
        """Thread-safe when scheduled onto the engine's event loop."""
        self._stop_requested.set()

    async def run(self) -> None:
        self.config.validate()
        proxy = self.config.proxy()
        await self.progress(0, self.config.visits, "Starting Camoufox")
        async with AsyncCamoufox(
            headless=True,
            proxy=proxy,
            humanize=True,
            enable_cache=False,
        ) as browser:
            for visit_number in range(1, self.config.visits + 1):
                if self._stop_requested.is_set():
                    await self.progress(visit_number - 1, self.config.visits, "Stopped")
                    return
                duration = random.uniform(self.config.min_duration, self.config.max_duration)
                await self.progress(visit_number - 1, self.config.visits, f"Visit {visit_number}: launching")
                context = None
                try:
                    # Context creation is inside the loop: no cookies/storage can cross visits.
                    context = await browser.new_context()
                    page = await context.new_page()
                    page.set_default_navigation_timeout(self.config.navigation_timeout_ms)
                    await page.goto(self.config.target_url.strip(), wait_until="domcontentloaded")
                    await self.progress(
                        visit_number - 1,
                        self.config.visits,
                        f"Visit {visit_number}: active ({duration:.1f}s)",
                    )
                    await exercise_page(page, duration, self.config.behavior)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    LOGGER.exception("Visit %d failed", visit_number)
                    await self.progress(
                        visit_number - 1,
                        self.config.visits,
                        f"Visit {visit_number}: failed ({type(exc).__name__})",
                    )
                finally:
                    if context is not None:
                        try:
                            await context.close()
                        except Exception:
                            LOGGER.exception("Failed to close context for visit %d", visit_number)
                await self.progress(visit_number, self.config.visits, f"Completed visit {visit_number}")
        await self.progress(self.config.visits, self.config.visits, "Run complete")
