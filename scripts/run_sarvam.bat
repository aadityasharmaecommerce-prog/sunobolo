@echo off
cd /d "E:\suno bolo english 2\sunobolo-voice-fix (1)\sunobolo\sunobolo"
echo Starting Sarvam AI audio generation...
python scripts/sarvam_replace_all.py > scripts\sarvam_output.log 2>&1
echo DONE! Check scripts\sarvam_output.log for results.
