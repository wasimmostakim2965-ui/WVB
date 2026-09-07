"""System resource guardrails for safe local load-test pacing."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Awaitable, Callable

import psutil

StatusCallback = Callable[[str], Awaitable[None]]


@dataclass(frozen=True)
class ResourceSnapshot:
    cpu_percent: float
    memory_percent: float
    throttled: bool


class ResourceMonitor:
    """Pause new work above 80% CPU/RAM and resume below 60% (hysteresis)."""

    def __init__(self, status: StatusCallback | None = None, high: float = 80.0, low: float = 60.0) -> None:
        if not 0 < low < high <= 100:
            raise ValueError("Resource thresholds must satisfy 0 < low < high <= 100")
        self.status = status
        self.high = high
        self.low = low
        self._throttled = False
        self._primed = False

    def sample(self) -> ResourceSnapshot:
        # interval=None is non-blocking after the first priming sample.
        cpu = psutil.cpu_percent(interval=0.10 if not self._primed else None)
        memory = psutil.virtual_memory().percent
        self._primed = True
        load = max(cpu, memory)
        if self._throttled:
            if cpu < self.low and memory < self.low:
                self._throttled = False
        elif cpu >= self.high or memory >= self.high:
            self._throttled = True
        return ResourceSnapshot(cpu, memory, self._throttled)

    async def wait_until_ready(self, stop_event: asyncio.Event | None = None) -> ResourceSnapshot | None:
        """Wait before starting work, returning None when cancellation is requested."""
        while True:
            snapshot = self.sample()
            if not snapshot.throttled:
                return snapshot
            if self.status:
                await self.status(f"Throttled · CPU {snapshot.cpu_percent:.0f}% · RAM {snapshot.memory_percent:.0f}%")
            if stop_event is None:
                await asyncio.sleep(1.0)
            else:
                try:
                    await asyncio.wait_for(stop_event.wait(), timeout=1.0)
                except asyncio.TimeoutError:
                    pass
                if stop_event.is_set():
                    return None

    async def pace(self, speed: str | int, stop_event: asyncio.Event | None = None) -> bool:
        """Apply user-selected pacing between visits, while preserving responsiveness."""
        if str(speed).lower() == "auto":
            delay = 0.25
        elif str(speed).lower() == "max":
            delay = 0.0
        else:
            level = max(1, min(10, int(speed)))
            delay = (10 - level) * 0.22
        if not delay:
            return not stop_event.is_set() if stop_event else True
        if stop_event is None:
            await asyncio.sleep(delay)
            return True
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=delay)
        except asyncio.TimeoutError:
            return True
        return False

    @property
    def throttled(self) -> bool:
        return self._throttled
