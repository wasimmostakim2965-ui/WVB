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

Python 3.12 is the supported build/runtime version for the pinned release toolchain.

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

Set an internal target URL and conservative visit count/duration values. Proxy Settings supports **None**, **Static Proxy**, and **Rotating Proxy**. Static Proxy accepts one `host:port:user:pass` entry per line and selects one entry for each test session. Rotating Proxy accepts a provider gateway host/IP, port, username, and password; the provider is responsible for any upstream rotation. WVB does not rotate Tor circuits or identities. Credentials are stored in local `config.json`; protect that file when using authenticated proxies.

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

`.github/workflows/build.yml` runs on pushes to `main` and manual dispatch. It installs the exact versions in `requirements.txt`, verifies dependency consistency with `pip check`, fetches the Camoufox browser, builds a single-file Windows executable, computes a SHA-256 checksum, and uploads `WVB.exe` plus its checksum as a GitHub Actions artifact.

## Resource management and speed control

The application uses `psutil` to sample host CPU and RAM before each visit. When either metric reaches 80%, new visits pause and the dashboard reports the throttled state. Normal pacing resumes only after both metrics fall below 60%, providing hysteresis instead of rapid start/stop oscillation. Active browser contexts are not force-killed; throttling applies at safe visit boundaries.

The Speed selector supports **Auto**, fixed levels **1–10**, and **Max**. Fixed levels control the inter-visit pacing delay; Max removes the voluntary delay. Resource safety remains authoritative, so even Max pauses when host load reaches the high threshold.

The minimum/maximum stay timer is selected and started only after `page.goto(..., wait_until="domcontentloaded")` completes. Browser navigation time is therefore excluded from the configured stay duration.

## Packaging compatibility note

The GitHub workflow bundles the complete Camoufox cache beside each PyInstaller executable and the packaged application bootstraps that cache on first launch. Windows runtime DLLs are copied when available on the build runner. Current Camoufox/Firefox builds and Python 3.12 do not provide a reliable Windows 7 compatibility guarantee; Windows 10/11 are the supported Windows targets. A true Windows 7 build requires a separately pinned legacy Python/Camoufox toolchain and must be validated on an actual Windows 7 runner.

## Build artifact verification

The PyInstaller specification explicitly collects Camoufox, `language_tags` locale JSON registries, Playwright, BrowserForge, fingerprint data, and the fetched browser cache. The locale registry is required by `camoufox.geolocation` at startup; omitting it causes the `_MEI...` `FileNotFoundError` shown by older builds. CI verifies that `dist/WVB.exe` exists, rejects an accidental one-folder build, and publishes a SHA-256 checksum beside the executable.

## Windows one-file packaging

The Windows workflow builds only `WVB.exe` from `WVB.spec` with a windowed one-file PyInstaller executable. `config.json` is created beside `WVB.exe` automatically if it does not exist. The exact package pins are intentionally kept in `requirements.txt`; the Camoufox browser cache is fetched during the CI build and embedded by the spec.

## Release acceptance gates

The build is not considered releasable merely because PyInstaller exits successfully. Before artifact upload, CI runs browser-free contract tests, a real localhost Camoufox smoke test using the fetched browser, the frozen executable with `--startup-check` to exercise the extracted `_MEI...` import graph, the frozen executable with `--ui-smoke-test` to construct and destroy the actual CustomTkinter UI, and an independent SHA-256 verification. Any failed gate prevents artifact upload.

The current official Camoufox/Python toolchain is validated on Windows 10/11. Windows 7 cannot be honestly guaranteed with Python 3.12 and current Camoufox/Firefox binaries; supporting Windows 7 requires a separately pinned legacy toolchain and a real Windows 7 test runner.

## Timing and process isolation

Each visit now launches a fresh headless Camoufox process and closes its context before the next visit. Navigation uses `wait_until="networkidle"`, so the configured stay-duration timer starts only after the network-idle event. This is intended for authorized responsiveness/load testing; the application does not implement per-visit identity spoofing, analytics attribution manipulation, or proxy-pool/IP-evasion logic.

## Pooled browser and traffic controls

The engine now keeps one headless Camoufox process per test session and creates/closes an ephemeral context for each visit. The UI exposes a maximum concurrent-visit limit and a global visits-per-minute limiter; the latter is shared across queued sessions. Configurable QA profiles vary viewport and locale for responsive-layout coverage only. User-agent/fingerprint spoofing and proxy-pool rotation are intentionally not part of this performance-testing implementation.

## Safe bounded execution model

Each session uses one pooled headless Camoufox process and creates a fresh ephemeral browser context for every visit. Contexts are closed in a `finally` block before the next visit. The suite does not implement Tor, circuit rotation, identity masking, proxy-pool evasion, or unlimited dispatch.

The optional proxy field accepts Playwright-compatible HTTP(S), SOCKS4, or SOCKS5 URLs. Proxy credentials may be supplied in the URL or in the dedicated local configuration fields. Authenticated proxy credentials are stored locally in `config.json`; protect that file using normal operating-system file permissions.

The target rate is a global visits-per-minute limiter. It is combined with the maximum concurrent-context limit and CPU/RAM guardrails. A zero rate means no voluntary rate delay, not unlimited machine resources: the concurrency and resource limits still apply.

Readiness is configurable as `commit`, `domcontentloaded`, `load`, or `selector`. Every request receives an explicit `X-WVB-Test-Marker` and `X-WVB-Session` header so first-party analytics can identify synthetic test traffic without pretending it is ordinary production traffic.

The dashboard reports successful, failed, timed-out, cancelled, and average-latency metrics. Failed visits are not counted as successful. STOP ALL reports queued work as cancelled and waits for active browser contexts to close before the desktop process exits.

The Windows workflow publishes a single `WVB.exe` artifact together with a SHA-256 checksum. Release publication is intentionally separate from ordinary pushes and should be performed only through a protected, reviewed release workflow.
