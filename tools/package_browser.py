"""Copy the active Camoufox installation into a distributable bundle."""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from camoufox.pkgman import camoufox_path


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: package_browser.py DESTINATION", file=sys.stderr)
        return 2
    source = Path(camoufox_path())
    destination = Path(sys.argv[1])
    if not source.is_dir():
        raise FileNotFoundError(f"Camoufox install directory not found: {source}")
    destination.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, dirs_exist_ok=True)
    print(f"Bundled Camoufox from {source} to {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
