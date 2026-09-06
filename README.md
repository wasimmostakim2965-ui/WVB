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
