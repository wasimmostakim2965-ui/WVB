from __future__ import annotations

import asyncio
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from core.behavior import BehaviorConfig
from core.engine import RunConfig, SessionManager


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

    async def progress(session_id: str, done: int, total: int, text: str) -> None:
        events.append(f"{session_id}:{done}/{total}:{text}")

    try:
        config = RunConfig(
            target_url=f"http://127.0.0.1:{server.server_port}/",
            visits=1,
            min_duration=0.2,
            max_duration=0.2,
            behavior=BehaviorConfig(min_pause_ms=1, max_pause_ms=2, max_scrolls=2, pointer_moves=1),
        )
        # A queue with one worker proves multiple isolated sessions without
        # depending on two large Camoufox browser processes starting at once.
        manager = SessionManager(progress, max_parallel=1)
        manager.add(config)
        manager.add(config)
        await asyncio.sleep(0.2)
        await manager.wait()
        manager.shutdown()
    finally:
        server.shutdown()
        server.server_close()

    assert len({event.split(":", 1)[0] for event in events}) == 2, events
    assert sum(event.endswith(":Complete") for event in events) == 2, events
    print("REAL CAMOUFOX MULTI-SESSION SMOKE TEST PASSED")
    print("events:", len(events))


if __name__ == "__main__":
    asyncio.run(main())
