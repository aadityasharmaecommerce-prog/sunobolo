"""Launch sarvam_replace_all.py as a detached background process."""
import subprocess, sys, os

env = os.environ.copy()
env["PYTHONUNBUFFERED"] = "1"

proc = subprocess.Popen(
    [sys.executable, "-u", "scripts/sarvam_replace_all.py"],
    stdout=open("scripts/sarvam_output.log", "w", encoding="utf-8"),
    stderr=subprocess.STDOUT,
    env=env,
    creationflags=subprocess.DETACHED_PROCESS if sys.platform == "win32" else 0,
    close_fds=True,
)

# Write PID file so we can check later
with open("scripts/gen.pid", "w") as f:
    f.write(str(proc.pid))

print(f"Sarvam AI generation started!")
print(f"PID: {proc.pid}")
print(f"Log: scripts/sarvam_output.log")
print(f"PID file: scripts/gen.pid")
print(f"\nMonitor with: tail -f scripts/sarvam_output.log")
