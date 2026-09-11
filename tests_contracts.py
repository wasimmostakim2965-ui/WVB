"""Fast, browser-free acceptance tests for WVB's core contracts."""
from __future__ import annotations

import asyncio

from core.behavior import BehaviorConfig, human_pause
from core.engine import RunConfig
from core.proxy import ProxySessionManager
from core.resources import ResourceMonitor


def make_config(**changes) -> RunConfig:
    values = dict(
        target_url="https://example.com",
        visits=1,
        min_duration=0.1,
        max_duration=0.2,
        behavior=BehaviorConfig(min_pause_ms=0, max_pause_ms=0),
    )
    values.update(changes)
    return RunConfig(**values)


def test_proxy_contracts() -> None:
    assert make_config().proxy() is None
    rotating = make_config(proxy_mode="rotating", proxy_server="gateway.example:8080").proxy()
    assert rotating == {"server": "http://gateway.example:8080"}
    static = make_config(proxy_mode="static", proxy_list=("proxy.example:3128:alice:secret",)).proxy()
    assert static == {"server": "http://proxy.example:3128", "username": "alice", "password": "secret"}
    for bad in ((), ("not-a-proxy",), ("host:port:user:pass:extra",)):
        try:
            make_config(proxy_mode="static", proxy_list=bad).validate()
        except ValueError:
            pass
        else:
            raise AssertionError(f"invalid static proxy was accepted: {bad!r}")


def test_readiness_contracts() -> None:
    make_config(readiness_policy="commit").validate()
    make_config(readiness_policy="load").validate()
    try:
        make_config(readiness_policy="selector").validate()
    except ValueError:
        pass
    else:
        raise AssertionError("selector readiness without a selector was accepted")


def test_proxy_round_robin_and_thresholds() -> None:
    async def check() -> None:
        manager = ProxySessionManager("static", static_entries=("a.example:8000:u1:p1", "b.example:8001:u2:p2"))
        first = await manager.acquire()
        second = await manager.acquire()
        third = await manager.acquire()
        assert first["server"] == "http://a.example:8000"
        assert second["server"] == "http://b.example:8001"
        assert third["server"] == first["server"]

    asyncio.run(check())
    monitor = ResourceMonitor(high=80, low=60)
    assert monitor.high == 80 and monitor.low == 60


def test_cancellation_contract() -> None:
    async def check() -> None:
        stop = asyncio.Event()
        stop.set()
        result = await human_pause(BehaviorConfig(min_pause_ms=1000, max_pause_ms=1000), stop_event=stop)
        assert result is False

    asyncio.run(check())


def main() -> None:
    test_proxy_contracts()
    test_readiness_contracts()
    test_cancellation_contract()
    print("WVB CONTRACT TESTS PASSED")


if __name__ == "__main__":
    main()
