"""Fail the CI build when required runtime inputs are absent."""
from __future__ import annotations

import platform
import sys
from pathlib import Path


def main() -> int:
    release = Path(sys.argv[1] if len(sys.argv) > 1 else "release")
    cache = release / "camoufox-cache"
    system = platform.system()
    executable = release / ("WVB-windows-latest.exe" if system == "Windows" else f"WVB-{'macos-latest' if system == 'Darwin' else 'ubuntu-latest'}")
    if not executable.is_file() or executable.stat().st_size < 1_000_000:
        raise SystemExit(f"compiled executable missing or unexpectedly small: {executable}")
    launchers = {"Windows": ["camoufox.exe"], "Darwin": ["camoufox", "camoufox-bin"], "Linux": ["camoufox-bin", "camoufox"]}[system]
    if not any(path.is_file() for name in launchers for path in cache.rglob(name)):
        raise SystemExit(f"Camoufox launcher missing from {cache}")
    required_assets = [cache / "properties.json", cache / "browser" / "omni.ja"]
    missing = [str(path) for path in required_assets if not path.is_file()]
    if missing:
        raise SystemExit(f"Camoufox assets missing: {missing}")
    print(f"Bundle verified: {executable.name}, Camoufox launcher, browser assets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
