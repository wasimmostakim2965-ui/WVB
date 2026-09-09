"""WVB desktop UI: bounded internal test session builder and dashboard."""
from __future__ import annotations

import asyncio
import json
import os
import shutil
import sys
import tempfile
import threading
from pathlib import Path
import tkinter as tk
from tkinter import messagebox

import customtkinter as ctk


def _bootstrap_bundled_camoufox() -> None:
    bundle_root = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent))
    bundled_cache = bundle_root / "camoufox-cache"
    if not bundled_cache.is_dir():
        return
    try:
        from camoufox.pkgman import INSTALL_DIR
        shutil.copytree(bundled_cache, INSTALL_DIR, dirs_exist_ok=True)
    except (ImportError, OSError):
        return


_bootstrap_bundled_camoufox()

from core.behavior import BehaviorConfig
from core.engine import ClientProfile, RunConfig, SessionManager

ROOT = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "config.json"


class App(ctk.CTk):
    def __init__(self) -> None:
        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")
        super().__init__(fg_color="#FFFFFF")
        self.title("WVB · Performance Session Manager")
        self.geometry("1220x850")
        self.minsize(1020, 720)
        self._vars: dict[str, tk.StringVar] = {}
        self._loading = True
        self._closing = False
        self._loop: asyncio.AbstractEventLoop | None = None
        self._manager: SessionManager | None = None
        self._worker: threading.Thread | None = None
        self._save_after_id: str | None = None
        self._cards: dict[str, tuple[ctk.CTkProgressBar, ctk.CTkLabel, ctk.CTkButton]] = {}
        self._profiles: list[dict[str, object]] = []
        self._build_ui()
        self._load_config()
        self._loading = False
        self._save_config()
        self.protocol("WM_DELETE_WINDOW", self._close)

    def _label(self, parent, text: str, row: int, column: int = 0, **kwargs):
        ctk.CTkLabel(parent, text=text, text_color="#263238", **kwargs).grid(row=row, column=column, padx=18, pady=6, sticky="w")

    def _entry(self, parent, key: str, row: int, default: str = ""):
        var = tk.StringVar(value=default)
        var.trace_add("write", lambda *_: self._schedule_save())
        self._vars[key] = var
        entry = ctk.CTkEntry(parent, textvariable=var, height=32, border_width=1, border_color="#D6DEE8", fg_color="#FFFFFF", text_color="#1F2933")
        entry.grid(row=row, column=1, padx=18, pady=6, sticky="ew")
        return entry

    def _build_ui(self) -> None:
        self.grid_columnconfigure(0, weight=0, minsize=470)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)
        header = ctk.CTkFrame(self, fg_color="#FFFFFF")
        header.grid(row=0, column=0, columnspan=2, padx=28, pady=(20, 10), sticky="ew")
        ctk.CTkLabel(header, text="WVB Performance Session Manager", font=ctk.CTkFont(size=24, weight="bold"), text_color="#14213D").pack(anchor="w")
        ctk.CTkLabel(header, text="Bounded Camoufox contexts · explicit internal test marker · resource-aware execution", text_color="#637083").pack(anchor="w", pady=(4, 0))

        builder = ctk.CTkScrollableFrame(self, fg_color="#F7F9FC", border_width=1, border_color="#E1E7EF", corner_radius=12)
        builder.grid(row=1, column=0, padx=(28, 12), pady=8, sticky="nsew")
        builder.grid_columnconfigure(1, weight=1)
        ctk.CTkLabel(builder, text="Session Builder", font=ctk.CTkFont(size=18, weight="bold"), text_color="#14213D").grid(row=0, column=0, columnspan=2, padx=18, pady=(16, 12), sticky="w")
        fields = [
            ("Target URL", "target_url", "https://example.com"),
            ("Target visits", "visits", "10"),
            ("Min stay (seconds)", "min_duration", "8"),
            ("Max stay (seconds)", "max_duration", "15"),
        ]
        for row, (label, key, default) in enumerate(fields, start=1):
            self._label(builder, label, row)
            entry = self._entry(builder, key, row, default)
            if key == "proxy_password":
                entry.configure(show="•")
        self._label(builder, "Proxy mode", 5)
        self._proxy_mode = tk.StringVar(value="none")
        self._proxy_mode.trace_add("write", lambda *_: (self._schedule_save(), self._update_proxy_mode()))
        ctk.CTkComboBox(builder, values=["None", "Static Proxy", "Rotating Proxy"], variable=self._proxy_mode, height=32).grid(row=5, column=1, padx=18, pady=6, sticky="ew")
        self._label(builder, "Proxy host / gateway", 6)
        self._entry(builder, "proxy_server", 6, "")
        self._label(builder, "Proxy username", 7)
        self._entry(builder, "proxy_username", 7, "")
        self._label(builder, "Proxy password", 8)
        proxy_password_entry = self._entry(builder, "proxy_password", 8, "")
        proxy_password_entry.configure(show="•")
        self._label(builder, "Static proxy list (host:port:user:pass)", 9)
        self._proxy_list = ctk.CTkTextbox(builder, height=90, border_width=1, border_color="#D6DEE8", fg_color="#FFFFFF", text_color="#1F2933")
        self._proxy_list.grid(row=9, column=1, padx=18, pady=6, sticky="ew")
        self._label(builder, "Target rate / minute", 10)
        self._entry(builder, "visits_per_minute", 10, "0")
        self._label(builder, "Test marker", 11)
        self._entry(builder, "test_marker", 11, "WVB-internal-test")
        self._label(builder, "Readiness selector", 12)
        self._entry(builder, "readiness_selector", 12, "")
        self._label(builder, "Readiness policy", 13)
        self._readiness = tk.StringVar(value="domcontentloaded")
        self._readiness.trace_add("write", lambda *_: self._schedule_save())
        ctk.CTkComboBox(builder, values=["commit", "domcontentloaded", "load", "selector"], variable=self._readiness, height=32).grid(row=13, column=1, padx=18, pady=6, sticky="ew")
        self._label(builder, "Random scrolling", 14)
        self._scrolling = tk.BooleanVar(value=True)
        self._scrolling.trace_add("write", lambda *_: self._schedule_save())
        ctk.CTkSwitch(builder, text="Enabled", variable=self._scrolling, onvalue=True, offvalue=False, progress_color="#2563EB").grid(row=14, column=1, padx=18, pady=6, sticky="w")
        self._label(builder, "Speed", 15)
        self._speed = tk.StringVar(value="Auto")
        self._speed.trace_add("write", lambda *_: self._schedule_save())
        ctk.CTkComboBox(builder, values=["Auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Max"], variable=self._speed, height=32).grid(row=15, column=1, padx=18, pady=6, sticky="ew")
        self._label(builder, "Max concurrent contexts", 16)
        self._parallel = tk.StringVar(value="2")
        self._parallel.trace_add("write", lambda *_: self._schedule_save())
        ctk.CTkComboBox(builder, values=[str(value) for value in range(1, 17)], variable=self._parallel, height=32).grid(row=16, column=1, padx=18, pady=6, sticky="ew")
        ctk.CTkLabel(builder, text="Static selects one configured entry per session. Rotating uses the provider gateway; WVB does not rotate circuits or identities.", text_color="#637083", wraplength=410, justify="left").grid(row=17, column=0, columnspan=2, padx=18, pady=(2, 8), sticky="w")
        ctk.CTkButton(builder, text="Save Config", command=self._save_config, height=36, fg_color="#FFFFFF", hover_color="#EAF1FF", border_width=1, border_color="#2563EB", text_color="#1D4ED8").grid(row=18, column=0, columnspan=2, padx=18, pady=(8, 6), sticky="ew")
        ctk.CTkButton(builder, text="Start Session", command=self._start_session, height=42, fg_color="#2563EB", hover_color="#1D4ED8").grid(row=19, column=0, columnspan=2, padx=18, pady=(4, 18), sticky="ew")
        self._update_proxy_mode()

        dashboard = ctk.CTkFrame(self, fg_color="#FFFFFF", border_width=1, border_color="#E1E7EF", corner_radius=12)
        dashboard.grid(row=1, column=1, padx=(12, 28), pady=8, sticky="nsew")
        dashboard.grid_rowconfigure(1, weight=1)
        dashboard.grid_columnconfigure(0, weight=1)
        top = ctk.CTkFrame(dashboard, fg_color="#FFFFFF")
        top.grid(row=0, column=0, padx=18, pady=(18, 8), sticky="ew")
        top.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(top, text="Live Progress Dashboard", font=ctk.CTkFont(size=18, weight="bold"), text_color="#14213D").grid(row=0, column=0, sticky="w")
        ctk.CTkButton(top, text="STOP ALL", command=self._stop_all, height=34, fg_color="#DC2626", hover_color="#B91C1C", width=112).grid(row=0, column=1, sticky="e")
        self._status = ctk.CTkLabel(top, text="Ready · add a session to begin", text_color="#637083", anchor="w")
        self._status.grid(row=1, column=0, columnspan=2, pady=(7, 0), sticky="ew")
        self._list = ctk.CTkScrollableFrame(dashboard, fg_color="#F7F9FC", border_width=1, border_color="#E1E7EF")
        self._list.grid(row=1, column=0, padx=18, pady=(8, 18), sticky="nsew")

    def _load_config(self) -> None:
        try:
            data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            data = {}
        for key in self._vars:
            if key in data:
                self._vars[key].set(str(data[key]))
        self._scrolling.set(bool(data.get("scrolling_enabled", True)))
        self._speed.set(str(data.get("speed", "Auto")))
        self._parallel.set(str(data.get("max_parallel", 2)))
        self._readiness.set(str(data.get("readiness_policy", "domcontentloaded")))
        self._proxy_mode.set(str(data.get("proxy_mode", "none")))
        proxy_lines = data.get("proxy_list", [])
        if isinstance(proxy_lines, list):
            self._proxy_list.insert("1.0", "\n".join(str(line) for line in proxy_lines))
        self._update_proxy_mode()
        profiles = data.get("client_profiles", [])
        if isinstance(profiles, list):
            self._profiles = [profile for profile in profiles if isinstance(profile, dict)]

    def _save_config(self, *_args) -> None:
        if self._loading:
            return
        try:
            data = {key: self._vars[key].get() for key in self._vars}
            data.update({"scrolling_enabled": bool(self._scrolling.get()), "speed": self._speed.get(), "max_parallel": int(self._parallel.get() or 2), "readiness_policy": self._readiness.get(), "proxy_mode": self._proxy_mode.get().lower().replace(" proxy", ""), "proxy_list": self._proxy_list.get("1.0", "end-1c").splitlines(), "client_profiles": self._profiles})
            fd, temp_name = tempfile.mkstemp(prefix="config.", suffix=".tmp", dir=ROOT)
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(data, handle, indent=2)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_name, CONFIG_PATH)
        except (OSError, ValueError):
            try:
                Path(temp_name).unlink(missing_ok=True)
            except (UnboundLocalError, OSError):
                pass

    def _schedule_save(self) -> None:
        if self._loading or self._closing:
            return
        if self._save_after_id:
            self.after_cancel(self._save_after_id)
        self._save_after_id = self.after(500, self._save_config)

    def _update_proxy_mode(self) -> None:
        mode = self._proxy_mode.get().lower()
        static = mode.startswith("static")
        self._proxy_list.configure(state="normal" if static else "disabled")

    def _proxy_values(self) -> tuple[str, tuple[str, ...]]:
        mode = self._proxy_mode.get().lower().replace(" proxy", "")
        entries = tuple(line.strip() for line in self._proxy_list.get("1.0", "end-1c").splitlines() if line.strip())
        return mode, entries

    def _config_from_form(self) -> RunConfig:
        proxy_mode, proxy_list = self._proxy_values()
        config = RunConfig(
            target_url=self._vars["target_url"].get(), visits=int(self._vars["visits"].get()), min_duration=float(self._vars["min_duration"].get()), max_duration=float(self._vars["max_duration"].get()),
            scrolling_enabled=bool(self._scrolling.get()), speed=self._speed.get().lower(), proxy_server=self._vars["proxy_server"].get(), proxy_username=self._vars["proxy_username"].get(), proxy_password=self._vars["proxy_password"].get(),
            proxy_mode=proxy_mode, proxy_list=proxy_list,
            max_concurrent_visits=max(1, min(32, int(self._parallel.get() or 2))), visits_per_minute=float(self._vars["visits_per_minute"].get() or 0), readiness_policy=self._readiness.get(), readiness_selector=self._vars["readiness_selector"].get(), test_marker=self._vars["test_marker"].get(),
            client_profiles=tuple(ClientProfile(str(p["name"]), int(p["width"]), int(p["height"]), str(p.get("locale", "en-US")), str(p.get("user_agent", ""))) for p in self._profiles), behavior=BehaviorConfig(scrolling_enabled=bool(self._scrolling.get())),
        )
        config.validate()
        return config

    def _start_session(self) -> None:
        try:
            config = self._config_from_form()
        except (ValueError, TypeError, KeyError) as exc:
            messagebox.showerror("Invalid session", str(exc))
            return
        self._save_config()
        parallel = max(1, min(32, int(self._parallel.get() or 2)))
        if self._worker is None or not self._worker.is_alive():
            self._worker = threading.Thread(target=self._worker_main, args=(config, parallel), daemon=False)
            self._worker.start()
        elif self._loop and self._manager:
            asyncio.run_coroutine_threadsafe(self._add_to_manager(config), self._loop)

    async def _add_to_manager(self, config: RunConfig) -> None:
        try:
            session_id = self._manager.add(config)
        except RuntimeError as exc:
            if not self._closing:
                self.after(0, lambda: messagebox.showwarning("Session not queued", str(exc)))
            return
        await self._progress(session_id, 0, config.visits, "Queued")

    def _worker_main(self, initial: RunConfig, max_parallel: int) -> None:
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        self._manager = SessionManager(self._progress, max_parallel=max_parallel, visits_per_minute=initial.visits_per_minute)
        try:
            self._manager.add(initial)
            self._loop.run_until_complete(self._manager.run_until_shutdown())
        except Exception as exc:
            if not self._closing:
                self.after(0, lambda: self._status.configure(text=f"Worker error · {exc}"))
        finally:
            self._loop.close()
            self._loop = None
            self._manager = None

    async def _progress(self, session_id: str, done: int, total: int, message: str) -> None:
        if not self._closing:
            self.after(0, self._update_card, session_id, done, total, message)

    def _update_card(self, session_id: str, done: int, total: int, message: str) -> None:
        if session_id not in self._cards:
            card = ctk.CTkFrame(self._list, fg_color="#FFFFFF", border_width=1, border_color="#DCE3EC", corner_radius=9)
            card.pack(fill="x", padx=6, pady=6)
            card.grid_columnconfigure(0, weight=1)
            ctk.CTkLabel(card, text=session_id, text_color="#14213D", anchor="w", font=ctk.CTkFont(weight="bold")).grid(row=0, column=0, padx=12, pady=(10, 2), sticky="ew")
            stop = ctk.CTkButton(card, text="STOP", width=72, height=28, fg_color="#DC2626", hover_color="#B91C1C", command=lambda sid=session_id: self._stop_session(sid))
            stop.grid(row=0, column=1, padx=10, pady=8)
            label = ctk.CTkLabel(card, text="Queued", text_color="#637083", anchor="w")
            label.grid(row=1, column=0, columnspan=2, padx=12, pady=2, sticky="ew")
            bar = ctk.CTkProgressBar(card, height=10, progress_color="#2563EB")
            bar.grid(row=2, column=0, columnspan=2, padx=12, pady=(6, 12), sticky="ew")
            self._cards[session_id] = (bar, label, stop)
        bar, label, stop = self._cards[session_id]
        bar.set(done / total if total else 0)
        label.configure(text=f"Visits: {done} / {total} · {message}")
        if message.startswith(("Complete", "Stopped", "Cancelled", "Error")):
            stop.configure(state="disabled")
        self._status.configure(text=f"Active URL session: {session_id} · {message}")

    def _stop_session(self, session_id: str) -> None:
        if self._loop and self._manager:
            self._loop.call_soon_threadsafe(self._manager.stop, session_id)

    def _stop_all(self) -> None:
        if self._loop and self._manager:
            self._loop.call_soon_threadsafe(self._manager.stop_all)
            self._status.configure(text="Stopping all sessions safely…")

    def _close(self) -> None:
        self._closing = True
        if self._save_after_id:
            self.after_cancel(self._save_after_id)
        self._save_config()
        if self._loop and self._manager:
            self._loop.call_soon_threadsafe(self._manager.stop_all)
        if self._worker and self._worker.is_alive() and threading.current_thread() is not self._worker:
            self._worker.join(timeout=15)
        self.destroy()


if __name__ == "__main__":
    App().mainloop()
