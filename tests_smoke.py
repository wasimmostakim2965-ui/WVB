from __future__ import annotations

import asyncio
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from core.behavior import BehaviorConfig
from core.engine import PerformanceEngine, RunConfig


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"<html><body><h1>Local WVB smoke test</h1><p>scrollable content</p>" + b"x" * 10000 + b"</body></html>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args):
        return


async def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    events: list[str] = []

    async def progress(done: int, total: int, text: str) -> None:
        events.append(f"{done}/{total}:{text}")

    try:
        config = RunConfig(
            target_url=f"http://127.0.0.1:{server.server_port}/",
            visits=2,
            min_duration=0.2,
            max_duration=0.2,
            behavior=BehaviorConfig(
                min_pause_ms=1,
                max_pause_ms=2,
                max_scrolls=2,
                pointer_moves=1,
            ),
        )
        await PerformanceEngine(config, progress).run()
    finally:
        server.shutdown()

    assert any("Completed visit 1" in event for event in events), events
    assert any("Completed visit 2" in event for event in events), events
    assert events[-1].endswith("Run complete"), events
    print("REAL CAMOUFOX SMOKE TEST PASSED")
    print("events:", len(events))


if __name__ == "__main__":
    asyncio.run(main())
