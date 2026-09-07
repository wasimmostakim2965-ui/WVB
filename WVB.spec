# WVB single-file Windows bundle.
from pathlib import Path
from importlib.util import find_spec

from PyInstaller.building.build_main import Analysis, PYZ, EXE
from PyInstaller.building.datastruct import Tree
from PyInstaller.utils.hooks import collect_all

import browserforge
from camoufox.pkgman import INSTALL_DIR


binaries = []
datas = []
hiddenimports = []
for package in ("browserforge", "apify_fingerprint_datapoints", "camoufox", "playwright"):
    package_datas, package_binaries, package_hidden = collect_all(package)
    datas.extend(package_datas)
    binaries.extend(package_binaries)
    hiddenimports.extend(package_hidden)

# Keep the exact browser installation layout expected by camoufox.pkgman.
# Tree emits TOC triples; Analysis expects (source, destination) data pairs.
for destination, source, *_ in Tree(str(INSTALL_DIR), prefix="camoufox-cache"):
    datas.append((source, destination))

# Explicitly preserve the data files that have historically been missed by
# PyInstaller hooks, including BrowserForge's Bayesian network archive and
# fingerprint/datapoint archives. The archives are distributed by
# apify_fingerprint_datapoints, not inside the browserforge namespace itself.
browserforge_locations = find_spec("browserforge").submodule_search_locations
if not browserforge_locations:
    raise RuntimeError("Unable to locate browserforge package data")
browserforge_root = Path(next(iter(browserforge_locations))).resolve()
for data_file in browserforge_root.rglob("*.zip"):
    destination = str(Path("browserforge") / data_file.relative_to(browserforge_root).parent)
    entry = (str(data_file), destination)
    if entry not in datas:
        datas.append(entry)

fingerprint_spec = find_spec("apify_fingerprint_datapoints")
if fingerprint_spec and fingerprint_spec.submodule_search_locations:
    fingerprint_root = Path(next(iter(fingerprint_spec.submodule_search_locations))).resolve()
    for data_file in fingerprint_root.rglob("*.zip"):
        destination = str(Path("apify_fingerprint_datapoints") / data_file.relative_to(fingerprint_root).parent)
        entry = (str(data_file), destination)
        if entry not in datas:
            datas.append(entry)

analysis = Analysis(
    ["main.py"],
    pathex=[str(Path.cwd())],
    binaries=binaries,
    datas=datas,
    hiddenimports=sorted(set(hiddenimports)),
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(analysis.pure)
EXE(
    pyz,
    analysis.scripts,
    analysis.binaries,
    analysis.datas,
    [],
    name="WVB",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    onefile=True,
)
