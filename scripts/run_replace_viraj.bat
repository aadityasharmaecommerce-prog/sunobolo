@echo off
cd /d "E:\suno bolo english 2\sunobolo-voice-fix (1)\sunobolo\sunobolo"
echo ============================================
echo   Replacing Viraj voice with Sarvam AI
echo   ~761 files remaining
echo ============================================
echo.
python scripts/replace_all_viraj.py
echo.
echo === DONE ===
echo Remaining old files:
python -c "import os,datetime;[print(f'  {os.path.relpath(os.path.join(r,f),chr(112)+chr(117)+chr(98)+chr(108)+chr(105)+chr(99)+chr(47)+chr(97)+chr(117)+chr(100)+chr(105)+chr(111))}') for r,d,fs in os.walk('public/audio') for f in fs if f.endswith('.mp3') and '.hindi.' not in f and os.path.getmtime(os.path.join(r,f))<datetime.datetime(2026,8,21).timestamp()]"
pause
