"""
Applica-Smart all-in-one local launcher.

Starts:
  1. Ollama serve (skipped if already listening on 11434)
  2. FastAPI backend  -> http://localhost:8000
  3. Vite frontend    -> http://localhost:5173

Usage:
    python run.py

Press Ctrl+C to stop everything.
"""

from __future__ import annotations

import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "Applica_Smart_server"
VENV_PY = BACKEND_DIR / "venv" / "Scripts" / "python.exe"  # Windows venv

OLLAMA_HOST = "127.0.0.1"
OLLAMA_PORT = 11434
BACKEND_PORT = 8000
FRONTEND_PORT = 5173
OLLAMA_MODEL = "mistral"

ANSI = {
    "reset": "\033[0m",
    "dim": "\033[2m",
    "bold": "\033[1m",
    "ollama": "\033[35m",   # magenta
    "backend": "\033[36m",  # cyan
    "vite": "\033[32m",     # green
    "ok": "\033[32m",
    "warn": "\033[33m",
    "err": "\033[31m",
}


def cprint(tag: str, msg: str) -> None:
    color = ANSI.get(tag, "")
    sys.stdout.write(f"{color}[{tag}]{ANSI['reset']} {msg}\n")
    sys.stdout.flush()


def port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        try:
            s.connect((host, port))
            return True
        except OSError:
            return False


def find_ollama_exe() -> Optional[str]:
    on_path = shutil.which("ollama")
    if on_path:
        return on_path
    candidates = [
        Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "Ollama" / "ollama.exe",
        Path("C:/Program Files/Ollama/ollama.exe"),
        Path.home() / "AppData/Local/Programs/Ollama/ollama.exe",
    ]
    for c in candidates:
        if c.is_file():
            return str(c)
    return None


def find_npm_cmd() -> Optional[str]:
    for name in ("npm.cmd", "npm"):
        p = shutil.which(name)
        if p:
            return p
    return None


def stream_output(proc: subprocess.Popen, tag: str) -> None:
    color = ANSI.get(tag, "")
    assert proc.stdout is not None
    for raw in proc.stdout:
        line = raw.rstrip()
        if not line:
            continue
        sys.stdout.write(f"{color}[{tag}]{ANSI['reset']} {line}\n")
        sys.stdout.flush()


def spawn(cmd: List[str], cwd: Path, tag: str, env: Optional[dict] = None) -> subprocess.Popen:
    cprint(tag, f"$ {' '.join(cmd)}  (cwd={cwd})")
    proc = subprocess.Popen(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        env=env,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
    )
    threading.Thread(target=stream_output, args=(proc, tag), daemon=True).start()
    return proc


def wait_until_listening(host: str, port: int, label: str, timeout: float = 60.0) -> bool:
    start = time.monotonic()
    while time.monotonic() - start < timeout:
        if port_in_use(host, port):
            cprint("ok", f"{label} listening on {host}:{port}")
            return True
        time.sleep(0.5)
    cprint("err", f"{label} did not start listening on {host}:{port} within {timeout:.0f}s")
    return False


def ensure_mistral_pulled(ollama_exe: str) -> None:
    try:
        result = subprocess.run(
            [ollama_exe, "list"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if OLLAMA_MODEL in (result.stdout or ""):
            cprint("ollama", f"model '{OLLAMA_MODEL}' already pulled")
            return
    except Exception as e:
        cprint("warn", f"could not list ollama models: {e}")
        return

    cprint("ollama", f"pulling '{OLLAMA_MODEL}' (one-time, ~4 GB)")
    pull = subprocess.Popen(
        [ollama_exe, "pull", OLLAMA_MODEL],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    threading.Thread(target=stream_output, args=(pull, "ollama"), daemon=True).start()
    pull.wait()
    if pull.returncode == 0:
        cprint("ok", f"'{OLLAMA_MODEL}' ready")
    else:
        cprint("err", f"ollama pull exited with code {pull.returncode}")


def main() -> int:
    if not BACKEND_DIR.is_dir():
        cprint("err", f"backend dir missing: {BACKEND_DIR}")
        return 1
    if not VENV_PY.is_file():
        cprint("err", f"backend venv python missing: {VENV_PY}\n"
                      f"      Run: python -m venv {BACKEND_DIR}/venv && "
                      f"{BACKEND_DIR}/venv/Scripts/pip install -r {BACKEND_DIR}/requirements.txt")
        return 1

    npm_cmd = find_npm_cmd()
    if not npm_cmd:
        cprint("err", "npm not found on PATH. Install Node.js first.")
        return 1

    ollama_exe = find_ollama_exe()
    procs: List[subprocess.Popen] = []

    # 1. Ollama
    if port_in_use(OLLAMA_HOST, OLLAMA_PORT):
        cprint("ollama", f"already running on {OLLAMA_HOST}:{OLLAMA_PORT} - reusing")
    elif ollama_exe:
        env = os.environ.copy()
        env.setdefault("OLLAMA_HOST", f"{OLLAMA_HOST}:{OLLAMA_PORT}")
        procs.append(spawn([ollama_exe, "serve"], cwd=ROOT, tag="ollama", env=env))
        if not wait_until_listening(OLLAMA_HOST, OLLAMA_PORT, "ollama", timeout=30):
            cprint("err", "ollama failed to start")
            shutdown(procs)
            return 1
    else:
        cprint("warn", "ollama not found - LLM features will run in degraded fallback mode")

    # ensure mistral pulled (only if ollama available)
    if ollama_exe and port_in_use(OLLAMA_HOST, OLLAMA_PORT):
        ensure_mistral_pulled(ollama_exe)

    # 2. Backend
    procs.append(
        spawn(
            [str(VENV_PY), "-m", "uvicorn", "api.server:app",
             "--host", "0.0.0.0", "--port", str(BACKEND_PORT)],
            cwd=BACKEND_DIR,
            tag="backend",
        )
    )
    if not wait_until_listening("127.0.0.1", BACKEND_PORT, "backend", timeout=60):
        shutdown(procs)
        return 1

    # 3. Frontend
    procs.append(
        spawn(
            [npm_cmd, "run", "dev"],
            cwd=ROOT,
            tag="vite",
        )
    )
    if not wait_until_listening("127.0.0.1", FRONTEND_PORT, "vite", timeout=60):
        cprint("warn", f"vite may have used a different port - check logs above")

    cprint("ok", f"stack up:")
    cprint("ok", f"  frontend  http://localhost:{FRONTEND_PORT}")
    cprint("ok", f"  backend   http://localhost:{BACKEND_PORT}/docs")
    cprint("ok", f"  ollama    http://localhost:{OLLAMA_PORT}")
    cprint("dim", "press Ctrl+C to stop")

    try:
        while True:
            for p in procs:
                rc = p.poll()
                if rc is not None:
                    cprint("err", f"child process exited with code {rc} - shutting down")
                    shutdown(procs)
                    return rc or 1
            time.sleep(1)
    except KeyboardInterrupt:
        cprint("dim", "received Ctrl+C - shutting down")
        shutdown(procs)
        return 0


def shutdown(procs: List[subprocess.Popen]) -> None:
    for p in procs:
        if p.poll() is not None:
            continue
        try:
            if os.name == "nt":
                p.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                p.terminate()
        except Exception:
            pass
    deadline = time.monotonic() + 8
    for p in procs:
        remaining = max(0.1, deadline - time.monotonic())
        try:
            p.wait(timeout=remaining)
        except subprocess.TimeoutExpired:
            try:
                p.kill()
            except Exception:
                pass


if __name__ == "__main__":
    sys.exit(main())
