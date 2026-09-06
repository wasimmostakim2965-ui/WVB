"""Desktop entry point for the WVB performance testing suite."""
from __future__ import annotations

import asyncio
import json
import os
import tempfile
import threading
from pathlib import Path
import tkinter as tk
from tkinter import messagebox

import customtkinter as ctk

from core.behavior import BehaviorConfig
from core.engine import PerformanceEngine, RunConfig

ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"


class App(ctk.CTk):
    def __init__(self) -> None:
        super().__init__()
        self.title("WVB · Desktop Performance Testing Suite")
        self.geometry("760x650")
        self.minsize(700, 590)
        ctk.set_appearance_mode("system")
        ctk.set_default_color_theme("blue")
        self._worker: threading.Thread | None = None
        self._loop: asyncio.AbstractEventLoop | None = None
        self._engine: PerformanceEngine | None = None
        self._vars: dict[str, tk.StringVar] = {}
        self._loading_config = True
        self._closing = False
        self._build_ui()
        self._load_config()
        self._loading_config = False
        self._save_config_safely()
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_ui(self) -> None:
        self.grid_columnconfigure(1, weight=1)
        ctk.CTkLabel(self, text="WVB Performance Suite", font=ctk.CTkFont(size=24, weight="bold")).grid(row=0, column=0, columnspan=2, padx=24, pady=(22, 4), sticky="w")
        ctk.CTkLabel(self, text="Authorized synthetic traffic only · each visit uses a fresh ephemeral browser context", text_color="gray").grid(row=1, column=0, columnspan=2, padx=24, pady=(0, 18), sticky="w")
        form = ctk.CTkFrame(self)
        form.grid(row=2, column=0, columnspan=2, padx=24, sticky="ew")
        form.grid_columnconfigure(1, weight=1)
        fields = [("Target URL", "target_url"), ("Visit target", "visits"), ("Minimum duration (s)", "min_duration"), ("Maximum duration (s)", "max_duration"), ("Proxy server (optional)", "proxy_server"), ("Proxy username", "proxy_username"), ("Proxy password", "proxy_password")]
        for row, (label, key) in enumerate(fields):
            ctk.CTkLabel(form, text=label).grid(row=row, column=0, padx=16, pady=8, sticky="w")
            var = tk.StringVar()
            var.trace_add("write", lambda *_: self._save_config_safely())
            self._vars[key] = var
            ctk.CTkEntry(form, textvariable=var, show="•" if "password" in key else "").grid(row=row, column=1, padx=16, pady=8, sticky="ew")
        behavior = ctk.CTkFrame(self)
        behavior.grid(row=3, column=0, columnspan=2, padx=24, pady=16, sticky="ew")
        behavior.grid_columnconfigure(1, weight=1)
        ctk.CTkLabel(behavior, text="Behavior tuning", font=ctk.CTkFont(size=15, weight="bold")).grid(row=0, column=0, columnspan=2, padx=16, pady=(12, 6), sticky="w")
        for row, (label, key, default) in enumerate([("Pause minimum (ms)", "min_pause_ms", "250"), ("Pause maximum (ms)", "max_pause_ms", "1400"), ("Scrolls per burst", "max_scrolls", "18")], start=1):
            ctk.CTkLabel(behavior, text=label).grid(row=row, column=0, padx=16, pady=6, sticky="w")
            var = tk.StringVar(value=default)
            var.trace_add("write", lambda *_: self._save_config_safely())
            self._vars[key] = var
            ctk.CTkEntry(behavior, textvariable=var).grid(row=row, column=1, padx=16, pady=6, sticky="ew")
        self.progress = ctk.CTkProgressBar(self)
        self.progress.grid(row=4, column=0, columnspan=2, padx=24, pady=(4, 6), sticky="ew")
        self.progress.set(0)
        self.status = ctk.CTkLabel(self, text="Ready", anchor="w")
        self.status.grid(row=5, column=0, columnspan=2, padx=24, sticky="ew")
        buttons = ctk.CTkFrame(self, fg_color="transparent")
        buttons.grid(row=6, column=0, columnspan=2, padx=24, pady=18, sticky="e")
        self.start_button = ctk.CTkButton(buttons, text="Start test", command=self._start)
        self.start_button.pack(side="left", padx=6)
        self.stop_button = ctk.CTkButton(buttons, text="Stop", command=self._stop, state="disabled", fg_color="#9b2c2c", hover_color="#7f1d1d")
        self.stop_button.pack(side="left", padx=6)

    def _load_config(self) -> None:
        try:
            data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError, OSError):
            data = {}
        for key, var in self._vars.items():
            if key in data and not isinstance(data[key], dict):
                var.set(str(data[key]))
        behavior = data.get("behavior", {})
        for key in ("min_pause_ms", "max_pause_ms", "max_scrolls"):
            if key in behavior:
                self._vars[key].set(str(behavior[key]))

    def _number(self, key: str, cast):
        try:
            return cast(self._vars[key].get().strip())
        except (ValueError, AttributeError):
            return 0

    def _config_dict(self) -> dict:
        return {
            "target_url": self._vars["target_url"].get(),
            "visits": self._number("visits", int),
            "min_duration": self._number("min_duration", float),
            "max_duration": self._number("max_duration", float),
            "proxy_server": self._vars["proxy_server"].get(),
            "proxy_username": self._vars["proxy_username"].get(),
            "proxy_password": self._vars["proxy_password"].get(),
            "behavior": {
                "min_pause_ms": self._number("min_pause_ms", int),
                "max_pause_ms": self._number("max_pause_ms", int),
                "max_scrolls": self._number("max_scrolls", int),
            },
        }

    def _save_config_safely(self) -> None:
        if self._loading_config:
            return
        try:
            payload = json.dumps(self._config_dict(), indent=2) + "\n"
            fd, temp_name = tempfile.mkstemp(prefix="config.", suffix=".tmp", dir=ROOT)
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                handle.write(payload)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_name, CONFIG_PATH)
        except (OSError, ValueError):
            try:
                Path(temp_name).unlink(missing_ok=True)
            except (OSError, UnboundLocalError):
                pass

    def _start(self) -> None:
        if self._worker and self._worker.is_alive():
            return
        try:
            config = RunConfig(
                target_url=self._vars["target_url"].get(),
                visits=self._number("visits", int),
                min_duration=self._number("min_duration", float),
                max_duration=self._number("max_duration", float),
                proxy_server=self._vars["proxy_server"].get(),
                proxy_username=self._vars["proxy_username"].get(),
                proxy_password=self._vars["proxy_password"].get(),
                behavior=BehaviorConfig(
                    min_pause_ms=self._number("min_pause_ms", int),
                    max_pause_ms=self._number("max_pause_ms", int),
                    max_scrolls=self._number("max_scrolls", int),
                ),
            )
            config.validate()
        except ValueError as exc:
            messagebox.showerror("Invalid configuration", str(exc))
            return
        self._save_config_safely()
        self.start_button.configure(state="disabled")
        self.stop_button.configure(state="normal")
        self._worker = threading.Thread(target=self._run_worker, args=(config,), daemon=True)
        self._worker.start()

    def _run_worker(self, config: RunConfig) -> None:
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)

        async def progress(done: int, total: int, text: str) -> None:
            if not self._closing:
                self.after(0, self._update_progress, done, total, text)

        self._engine = PerformanceEngine(config, progress)
        try:
            self._loop.run_until_complete(self._engine.run())
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            if not self._closing:
                self.after(0, self._run_error, str(exc))
        finally:
            self._loop.close()
            self._loop = None
            self._engine = None
            if not self._closing:
                self.after(0, self._run_finished)

    def _update_progress(self, done: int, total: int, text: str) -> None:
        self.progress.set(done / total if total else 0)
        self.status.configure(text=f"Visits: {done} / {total}   ·   {text}")

    def _run_error(self, text: str) -> None:
        self.status.configure(text=f"Error: {text}")
        messagebox.showerror("Run failed", text)

    def _run_finished(self) -> None:
        self.start_button.configure(state="normal")
        self.stop_button.configure(state="disabled")

    def _stop(self) -> None:
        if self._engine and self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._engine.request_stop)
            self.status.configure(text="Stopping after the current visit…")
            self.stop_button.configure(state="disabled")

    def _on_close(self) -> None:
        if self._closing:
            return
        self._closing = True
        if self._engine and self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._engine.request_stop)
        self.destroy()


if __name__ == "__main__":
    App().mainloop()
