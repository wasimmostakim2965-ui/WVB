"""Bounded, non-destructive synthetic interaction primitives."""
from __future__ import annotations

import asyncio
import math
import random
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class BehaviorConfig:
    scrolling_enabled: bool = True
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


def _cubic(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
    u = 1.0 - t
    return u**3 * p0 + 3 * u**2 * t * p1 + 3 * u * t**2 * p2 + t**3 * p3


def bezier_points(start: tuple[float, float], end: tuple[float, float], steps: int) -> list[tuple[float, float]]:
    if steps < 1:
        raise ValueError("steps must be at least 1")
    x0, y0 = start
    x3, y3 = end
    distance = math.hypot(x3 - x0, y3 - y0)
    spread = max(25.0, min(180.0, distance * 0.22))
    direction = random.choice((-1.0, 1.0))
    length = max(distance, 1.0)
    nx, ny = -(y3 - y0) / length, (x3 - x0) / length
    p1 = (x0 + (x3 - x0) * random.uniform(.25, .45) + nx * spread * direction, y0 + (y3 - y0) * random.uniform(.25, .45) + ny * spread * direction)
    p2 = (x0 + (x3 - x0) * random.uniform(.55, .80) - nx * spread * direction, y0 + (y3 - y0) * random.uniform(.55, .80) - ny * spread * direction)
    return [(_cubic(x0, p1[0], p2[0], x3, i / steps), _cubic(y0, p1[1], p2[1], y3, i / steps)) for i in range(1, steps + 1)]


async def human_pause(config: BehaviorConfig, deadline: float | None = None) -> None:
    delay = random.uniform(config.min_pause_ms, config.max_pause_ms) / 1000
    if deadline is not None:
        delay = min(delay, max(0.0, deadline - asyncio.get_running_loop().time()))
    if delay > 0:
        await asyncio.sleep(delay)


async def move_pointer(page: Any, config: BehaviorConfig, deadline: float | None = None) -> None:
    viewport = page.viewport_size or {"width": 1280, "height": 720}
    for _ in range(config.pointer_moves):
        start = (random.uniform(0, max(1, viewport["width"])), random.uniform(0, max(1, viewport["height"])))
        end = (random.uniform(0, max(1, viewport["width"])), random.uniform(0, max(1, viewport["height"])))
        for x, y in bezier_points(start, end, random.randint(12, 30)):
            if deadline is not None and asyncio.get_running_loop().time() >= deadline:
                return
            await page.mouse.move(x, y)
            await asyncio.sleep(random.uniform(.004, .018))


async def natural_scroll(page: Any, config: BehaviorConfig, deadline: float) -> None:
    if not config.scrolling_enabled:
        return
    for _ in range(random.randint(1, config.max_scrolls)):
        if asyncio.get_running_loop().time() >= deadline:
            return
        await page.mouse.wheel(0, random.randint(config.scroll_step_min, config.scroll_step_max))
        await human_pause(config, deadline)
        if random.random() < .18 and asyncio.get_running_loop().time() < deadline:
            await page.mouse.wheel(0, -random.randint(80, 260))
            await human_pause(config, deadline)


async def exercise_page(page: Any, duration_seconds: float, config: BehaviorConfig) -> None:
    config.validate()
    deadline = asyncio.get_running_loop().time() + max(0.0, duration_seconds)
    await human_pause(config, deadline)
    while asyncio.get_running_loop().time() < deadline:
        await move_pointer(page, config, deadline)
        await natural_scroll(page, config, deadline)
        await human_pause(config, deadline)
        if random.random() >= .30:
            return
        remaining = max(0.0, deadline - asyncio.get_running_loop().time())
        if remaining <= 0:
            return
        await asyncio.sleep(min(random.uniform(.8, 3.8), remaining))
