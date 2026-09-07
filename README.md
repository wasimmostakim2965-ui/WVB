# WVB Desktop Performance Testing Suite

A modular Python desktop application for **authorized internal performance testing**. It launches Camoufox through Playwright, performs bounded synthetic interactions, and records visit progress in a CustomTkinter UI.

## Features

- Camoufox/Firefox engine in headless mode.
- Custom cubic Bézier pointer paths, variable scrolling, and randomized reading pauses.
- Fresh Playwright browser context for every visit; context closure removes cookies, local storage, cache, and pages before the next iteration.
- Random session duration selected uniformly between configured minimum and maximum values.
- Background worker thread with a responsive UI, progress bar, visit counter, and stop control.
- Automatic JSON persistence for URL, visit count, durations, proxy settings, and behavior parameters.
- One failed visit is isolated and reported without aborting the full run.

## Installation

Python 3.10+ is recommended.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
camoufox fetch
```

On Linux, install the system packages required by CustomTkinter/Tk if they are not already present (for example, `python3-tk`).

## Run

```bash
python main.py
```

Set an internal target URL and conservative visit count/duration values. Proxy server values should use Playwright's format, such as `http://127.0.0.1:8080` or `socks5://127.0.0.1:1080`. Credentials are stored in local `config.json`; protect that file when using authenticated proxies.

## Project layout

```text
main.py                 CustomTkinter UI and worker lifecycle
core/engine.py          Async Camoufox runner and per-visit isolation
core/behavior.py        Human-like pointer, scrolling, and pause primitives
config.json             Local persisted defaults and UI state
requirements.txt        Python dependencies
```

Use only against infrastructure you own or are explicitly authorized to test. Do not use this suite to evade access controls, create abusive traffic, or target third-party systems. Start with low visit counts and coordinate load levels with the service owner.

## Verification

The repository includes `tests_smoke.py`, which starts a temporary localhost HTTP server and runs two real headless Camoufox visits against it. It verifies navigation, bounded behavior execution, progress completion, and browser/context cleanup without contacting an external target.

```bash
camoufox fetch
python3 tests_smoke.py
```

The suite has been verified with Camoufox `0.5.6` and browser build `152.0.4-beta.30` in the development environment. Dependency installation and browser availability are prerequisites for runtime execution; syntax and validation checks do not require a live browser.

## Multi-session dashboard

The desktop UI uses a clean light theme with two panels. The left panel builds and saves a session configuration; the right panel displays queued, active, completed, and stopped sessions with individual progress bars and STOP controls. Sessions are submitted to a bounded asynchronous queue, with configurable parallelism. Each session still creates and closes a fresh browser context for every visit.

The **Random scrolling** switch controls the scrolling phase independently from pointer movement and reading pauses. **STOP ALL** requests cooperative cancellation without blocking the Tkinter event loop.

## GitHub Actions build

`.github/workflows/build.yml` runs on pushes to `main` and manual dispatch. It builds Windows, Linux, and macOS artifacts, installs the Python requirements and PyInstaller, fetches the Camoufox browser, compiles the application, bundles the executable with the fetched Camoufox browser cache and `config.json`, and uploads each platform bundle as a downloadable GitHub Actions artifact.

## Resource management and speed control

The application uses `psutil` to sample host CPU and RAM before each visit. When either metric reaches 80%, new visits pause and the dashboard reports the throttled state. Normal pacing resumes only after both metrics fall below 60%, providing hysteresis instead of rapid start/stop oscillation. Active browser contexts are not force-killed; throttling applies at safe visit boundaries.

The Speed selector supports **Auto**, fixed levels **1–10**, and **Max**. Fixed levels control the inter-visit pacing delay; Max removes the voluntary delay. Resource safety remains authoritative, so even Max pauses when host load reaches the high threshold.

The minimum/maximum stay timer is selected and started only after `page.goto(..., wait_until="domcontentloaded")` completes. Browser navigation time is therefore excluded from the configured stay duration.

## Packaging compatibility note

The GitHub workflow bundles the complete Camoufox cache beside each PyInstaller executable and the packaged application bootstraps that cache on first launch. Windows runtime DLLs are copied when available on the build runner. Current Camoufox/Firefox builds and Python 3.12 do not provide a reliable Windows 7 compatibility guarantee; Windows 10/11 are the supported Windows targets. A true Windows 7 build requires a separately pinned legacy Python/Camoufox toolchain and must be validated on an actual Windows 7 runner.

## Build artifact verification

The workflow now explicitly collects both Camoufox and Playwright package resources and runs `tools/verify_bundle.py` before upload. The verifier fails the job unless the platform executable, Camoufox launcher, `properties.json`, and browser `omni.ja` assets are present. The successful run produced three non-expired artifacts: Windows (~582 MB), Ubuntu (~787 MB), and macOS (~392 MB). The GitHub API confirmed all three uploads; a local artifact download attempt returned an `unexpected EOF` from the transfer tool, not a build or upload error.

## Windows one-file packaging

The Windows workflow now builds only `WVB.exe` from `WVB.spec` with a windowed one-file PyInstaller executable. The spec collects `browserforge`, `apify_fingerprint_datapoints`, `camoufox`, and `playwright`, embeds the Camoufox browser cache, and explicitly preserves `input-network-definition.zip`, fingerprint archives, BrowserForge data, and the Playwright driver. `config.json` is created beside `WVB.exe` automatically if it does not exist.

The current official Camoufox/Python toolchain is validated on Windows 10/11. Windows 7 cannot be honestly guaranteed with Python 3.12 and current Camoufox/Firefox binaries; supporting Windows 7 requires a separately pinned legacy toolchain and a real Windows 7 test runner.
