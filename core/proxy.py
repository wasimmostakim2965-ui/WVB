"""Safe proxy selection for authorized synthetic tests.

This module never mutates credentials to rotate identities. Static entries are
selected round-robin; a rotating provider gateway is passed through unchanged
and any upstream rotation remains the provider's responsibility.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from urllib.parse import unquote, urlparse


@dataclass
class ProxySessionManager:
    mode: str = "none"
    gateway: str = ""
    username: str = ""
    password: str = ""
    static_entries: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        self._index = 0
        self._lock = asyncio.Lock()
        self.mode = self.mode.lower().strip()

    def validate(self) -> None:
        if self.mode not in {"none", "static", "rotating"}:
            raise ValueError("Proxy mode must be none, static, or rotating")
        if self.mode == "static" and not self.static_entries:
            raise ValueError("Static proxy mode requires at least one entry")
        if self.mode == "rotating" and not self.gateway.strip():
            raise ValueError("Rotating proxy mode requires a provider gateway")
        for entry in self.static_entries:
            self._parse_entry(entry)

    @staticmethod
    def _parse_url(value: str) -> dict[str, str]:
        raw = value.strip()
        if "://" not in raw:
            raw = f"http://{raw}"
        parsed = urlparse(raw)
        if parsed.scheme not in {"http", "https", "socks4", "socks5"} or not parsed.hostname or not parsed.port:
            raise ValueError("Proxy must use host:port or http(s)/socks URL syntax")
        result = {"server": f"{parsed.scheme}://{parsed.hostname}:{parsed.port}"}
        if parsed.username:
            result["username"] = unquote(parsed.username)
        if parsed.password:
            result["password"] = unquote(parsed.password)
        return result

    @classmethod
    def _parse_entry(cls, entry: str) -> dict[str, str]:
        parts = entry.strip().split(":", 3)
        if len(parts) == 4 and parts[0] and parts[1].isdigit():
            return {"server": f"http://{parts[0]}:{parts[1]}", "username": parts[2], "password": parts[3]}
        return cls._parse_url(entry)

    async def acquire(self) -> dict[str, str] | None:
        if self.mode == "none":
            return None
        async with self._lock:
            if self.mode == "static":
                entry = self.static_entries[self._index % len(self.static_entries)]
                self._index += 1
                return self._parse_entry(entry)
            result = self._parse_url(self.gateway)
            if self.username:
                result["username"] = self.username
            if self.password:
                result["password"] = self.password
            return result
