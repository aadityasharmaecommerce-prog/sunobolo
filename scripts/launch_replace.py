import subprocess, sys, os
os.chdir(r"E:\suno bolo english 2\sunobolo-voice-fix (1)\sunobolo\sunobolo")
subprocess.Popen(
    [sys.executable, "scripts/replace_viraj_fast.py"],
    creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW,
    stdout=open("scripts/replace_output.log", "w"),
    stderr=subprocess.STDOUT,
)
print("Launched in background!")
