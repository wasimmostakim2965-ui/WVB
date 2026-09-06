"""Human-like interaction primitives for synthetic, authorized performance tests."""
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


def _cubic_bezier(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
    u = 1.0 - t
    return (u**3 * p0) + (3 * u**2 * t * p1) + (3 * u * t**2 * p2) + (t**3 * p3)


def bezier_points(start: tuple[float, float], end: tuple[float, float], steps: int) -> list[tuple[float, float]]:
    """Return a curved pointer path with randomized control-point offsets."""
    x0, y0 = start
    x3, y3 = end
    distance = math.hypot(x3 - x0, y3 - y0)
    spread = max(25.0, min(180.0, distance * 0.22))
    direction = random.choice((-1.0, 1.0))
    dx, dy = x3 - x0, y3 - y0
    length = max(distance, 1.0)
    nx, ny = -dy / length, dx / length
    p1 = (x0 + dx * random.uniform(0.25, 0.45) + nx * spread * direction,
          y0 + dy * random.uniform(0.25, 0.45) + ny * spread * direction)
    p2 = (x0 + dx * random.uniform(0.55, 0.8) - nx * spread * direction,
          y0 + dy * random.uniform(0.55, 0.8) - ny * spread * direction)
    return [(_cubic_bezier(x0, p1[0], p2[0], x3, i / steps),
             _cubic_bezier(y0, p1[1], p2[1], y3, i / steps)) for i in range(1, steps + 1)]


async def human_pause(config: BehaviorConfig) -> None:
    await asyncio.sleep(random.uniform(config.min_pause_ms, config.max_pause_ms) / 1000)


async def move_pointer(page: Any, config: BehaviorConfig) -> None:
    viewport = page.viewport_size or {"width": 1280, "height": 720}
    start = (random.uniform(0, viewport["width"]), random.uniform(0, viewport["height"]))
    end = (random.uniform(0, viewport["width"]), random.uniform(0, viewport["height"]))
    points = bezier_points(start, end, random.randint(12, 30))
    for x, y in points:
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.004, 0.018))


async def natural_scroll(page: Any, config: BehaviorConfig, deadline: float) -> None:
    """Scroll in varied increments, stopping when the session deadline is reached."""
    for _ in range(random.randint(3, config.max_scrolls)):
        if asyncio.get_running_loop().time() >= deadline:
            return
        await page.mouse.wheel(0, random.randint(config.scroll_step_min, config.scroll_step_max))
        await human_pause(config)
        if random.random() < 0.18:
            await page.mouse.wheel(0, -random.randint(80, 260))
            await human_pause(config)


async def exercise_page(page: Any, duration_seconds: float, config: BehaviorConfig) -> None:
    """Perform bounded, non-destructive interactions against the already-loaded page."""
    deadline = asyncio.get_running_loop().time() + duration_seconds
    await human_pause(config)
    while asyncio.get_running_loop().time() < deadline:
        await move_pointer(page, config)
        await natural_scroll(page, config, deadline)
        await human_pause(config)
        if random.random() < 0.3:
            # Reading pause: no input for a variable interval, bounded by deadline.
            remaining = max(0.0, deadline - asyncio.get_running_loop().time())
            await asyncio.sleep(min(random.uniform(0.8, 3.8), remaining))
        else:
            break
