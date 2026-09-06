"""Bounded synthetic interaction primitives for authorized performance tests.

The functions in this module deliberately perform only non-destructive navigation
behaviors: pointer movement, scrolling, and idle/reading pauses. They never click,
submit forms, or mutate page data.
"""
from __future__ import annotations

import asyncio
import math
import random
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class BehaviorConfig:
    min_pause_ms: int = 250
    max_pause_ms: int = 1400
    scroll_step_min: int = 220
    scroll_step_max: int = 680
    max_scrolls: int = 18
    pointer_moves: int = 7

    def validate(self) -> None:
        if self.min_pause_ms < 0 or self.max_pause_ms < self.min_pause_ms:
            raise ValueError("Pause range is invalid")
        if self.scroll_step_min < 1 or self.scroll_step_max < self.scroll_step_min:
            raise ValueError("Scroll range is invalid")
        if self.max_scrolls < 1 or self.pointer_moves < 1:
            raise ValueError("Behavior counts must be at least 1")


def _cubic_bezier(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
    u = 1.0 - t
    return u**3 * p0 + 3 * u**2 * t * p1 + 3 * u * t**2 * p2 + t**3 * p3


def bezier_points(
    start: tuple[float, float], end: tuple[float, float], steps: int
) -> list[tuple[float, float]]:
    """Generate a cubic Bézier path whose final point is exactly ``end``."""
    if steps < 1:
        raise ValueError("steps must be at least 1")
    x0, y0 = start
    x3, y3 = end
    distance = math.hypot(x3 - x0, y3 - y0)
    spread = max(25.0, min(180.0, distance * 0.22))
    direction = random.choice((-1.0, 1.0))
    length = max(distance, 1.0)
    nx, ny = -(y3 - y0) / length, (x3 - x0) / length
    p1 = (
        x0 + (x3 - x0) * random.uniform(0.25, 0.45) + nx * spread * direction,
        y0 + (y3 - y0) * random.uniform(0.25, 0.45) + ny * spread * direction,
    )
    p2 = (
        x0 + (x3 - x0) * random.uniform(0.55, 0.80) - nx * spread * direction,
        y0 + (y3 - y0) * random.uniform(0.55, 0.80) - ny * spread * direction,
    )
    return [
        (
            _cubic_bezier(x0, p1[0], p2[0], x3, index / steps),
            _cubic_bezier(y0, p1[1], p2[1], y3, index / steps),
        )
        for index in range(1, steps + 1)
    ]


async def human_pause(config: BehaviorConfig, deadline: float | None = None) -> None:
    """Sleep for a random pause, capped so the session deadline is never exceeded."""
    delay = random.uniform(config.min_pause_ms, config.max_pause_ms) / 1000
    if deadline is not None:
        delay = min(delay, max(0.0, deadline - asyncio.get_running_loop().time()))
    if delay > 0:
        await asyncio.sleep(delay)


async def move_pointer(page: Any, config: BehaviorConfig, deadline: float | None = None) -> None:
    viewport = page.viewport_size or {"width": 1280, "height": 720}
    start = (
        random.uniform(0, max(1, viewport["width"])),
        random.uniform(0, max(1, viewport["height"])),
    )
    end = (
        random.uniform(0, max(1, viewport["width"])),
        random.uniform(0, max(1, viewport["height"])),
    )
    points = bezier_points(start, end, random.randint(12, 30))
    for x, y in points:
        if deadline is not None and asyncio.get_running_loop().time() >= deadline:
            return
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.004, 0.018))


async def natural_scroll(page: Any, config: BehaviorConfig, deadline: float) -> None:
    """Scroll in varied increments while respecting the absolute session deadline."""
    for _ in range(random.randint(1, config.max_scrolls)):
        if asyncio.get_running_loop().time() >= deadline:
            return
        await page.mouse.wheel(0, random.randint(config.scroll_step_min, config.scroll_step_max))
        await human_pause(config, deadline)
        if random.random() < 0.18 and asyncio.get_running_loop().time() < deadline:
            await page.mouse.wheel(0, -random.randint(80, 260))
            await human_pause(config, deadline)


async def exercise_page(page: Any, duration_seconds: float, config: BehaviorConfig) -> None:
    """Perform bounded, non-destructive activity for at most ``duration_seconds``."""
    config.validate()
    if duration_seconds <= 0:
        return
    deadline = asyncio.get_running_loop().time() + duration_seconds
    await human_pause(config, deadline)
    while asyncio.get_running_loop().time() < deadline:
        await move_pointer(page, config, deadline)
        await natural_scroll(page, config, deadline)
        await human_pause(config, deadline)
        if random.random() >= 0.30:
            return
        remaining = max(0.0, deadline - asyncio.get_running_loop().time())
        if remaining <= 0:
            return
        await asyncio.sleep(min(random.uniform(0.8, 3.8), remaining))
