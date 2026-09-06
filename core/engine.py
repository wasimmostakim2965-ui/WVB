"""Async Camoufox runner with strict per-visit context isolation."""
from __future__ import annotations

import asyncio
import logging
import random
from dataclasses import dataclass
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
    behavior: BehaviorConfig = BehaviorConfig()

    def validate(self) -> None:
        parsed = urlparse(self.target_url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Target URL must be an http:// or https:// URL")
        if self.visits < 1:
            raise ValueError("Visits must be at least 1")
        if self.min_duration <= 0 or self.max_duration < self.min_duration:
            raise ValueError("Duration range is invalid")

    def proxy(self) -> dict[str, str] | None:
        if not self.proxy_server.strip():
            return None
        result = {"server": self.proxy_server.strip()}
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
        self._stop_requested.set()

    async def run(self) -> None:
        self.config.validate()
        await self.progress(0, self.config.visits, "Starting Camoufox")
        async with AsyncCamoufox(
            headless=True,
            proxy=self.config.proxy(),
            humanize=True,
            enable_cache=False,
        ) as browser:
            for visit_number in range(1, self.config.visits + 1):
                if self._stop_requested.is_set():
                    await self.progress(visit_number - 1, self.config.visits, "Stopped")
                    return
                duration = random.uniform(self.config.min_duration, self.config.max_duration)
                await self.progress(visit_number - 1, self.config.visits, f"Visit {visit_number}: launching")
                # A fresh browser context is created and destroyed for every visit.
                context = await browser.new_context()
                page = None
                try:
                    page = await context.new_page()
                    page.set_default_navigation_timeout(self.config.navigation_timeout_ms)
                    await page.goto(self.config.target_url, wait_until="domcontentloaded")
                    await self.progress(visit_number - 1, self.config.visits, f"Visit {visit_number}: active ({duration:.1f}s)")
                    await exercise_page(page, duration, self.config.behavior)
                except Exception as exc:  # One failed visit must not corrupt the run.
                    LOGGER.exception("Visit %d failed", visit_number)
                    await self.progress(visit_number - 1, self.config.visits, f"Visit {visit_number}: failed ({exc})")
                finally:
                    await context.close()  # Purges cookies, storage, cache, and pages.
                await self.progress(visit_number, self.config.visits, f"Completed visit {visit_number}")
        await self.progress(self.config.visits, self.config.visits, "Run complete")
