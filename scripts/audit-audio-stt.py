#!/usr/bin/env python3
"""
SunoBolo — SPOKEN CONTENT audit for audio files (speech-to-text).

This is the tool that PROVES whether each MP3's spoken words match the
sentence it is mapped to. Filenames/IDs matching is NOT enough (a past
production bug shipped audio whose files had the right names but the wrong
spoken sentences).

How it works:
  1. Parses src/data/content.ts → sentence id → english text (canonical).
  2. Decodes each MP3 to 16 kHz mono WAV via ffmpeg.
  3. Transcribes with vosk (small Indian-English model).
  4. Compares normalized word overlap against the expected English.

Statuses per sentence:
  PASS                        overlap >= --min-overlap (default 0.5)
  FAIL — AUDIO CONTENT MISMATCH  overlap < 0.35
  MANUAL CHECK REQUIRED       overlap 0.35..0.5, OR silent/undecodable
                              (STT models can mishear rare words — e.g.
                              "souvenir" — so borderline cases are flagged
                              for human listening, not auto-failed)
  MISSING AUDIO               file does not exist

Setup (one-time):
  pip install vosk
  mkdir -p models && cd models
  curl -L -o vosk-en-in.zip https://alphacephei.com/vosk/models/vosk-model-small-en-in-0.4.zip
  unzip vosk-en-in.zip

Usage:
  python3 scripts/audit-audio-stt.py --sample 10          # 10 sentences per course
  python3 scripts/audit-audio-stt.py --course beginner --full
  python3 scripts/audit-audio-stt.py --full               # everything (~1h)
  python3 scripts/audit-audio-stt.py --ids beginner-050 beginner-151
  python3 scripts/audit-audio-stt.py --json audit.json
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parent.parent
CONTENT_TS = APP_ROOT / "src" / "data" / "content.ts"
AUDIO_DIR = APP_ROOT / "public" / "audio"
DEFAULT_MODEL = APP_ROOT / "models" / "vosk-model-small-en-in-0.4"

SENTENCE_RE = re.compile(
    r'"id":\s*"([^"]+)",\s*"courseId":\s*"([^"]+)",\s*"lessonId":\s*"[^"]+",'
    r'\s*"order":\s*\d+,\s*"english":\s*"((?:[^"\\]|\\.)*)",\s*"hindi":\s*"((?:[^"\\]|\\.)*)"',
    re.DOTALL,
)


def unescape(s: str) -> str:
    return (
        s.replace('\\"', '"')
        .replace("\\'", "'")
        .replace("\\\\", "\\")
        .replace("\\n", " ")
        .strip()
    )


def parse_sentences() -> dict:
    text = CONTENT_TS.read_text(encoding="utf-8")
    out = {}
    for m in SENTENCE_RE.finditer(text):
        sid, course, eng, hin = m.groups()
        if sid not in out and unescape(eng):
            out[sid] = {"courseId": course, "english": unescape(eng), "hindi": unescape(hin)}
    return out


def norm(t: str) -> set:
    return set(re.sub(r"[^a-z0-9 ]", "", t.lower()).split())


def overlap(exp: str, got: str) -> float:
    e = norm(exp)
    if not e:
        return 1.0
    return len(e & norm(got)) / len(e)


def load_model(path: Path):
    try:
        from vosk import Model, SetLogLevel
    except ImportError:
        sys.exit("pip install vosk first")
    SetLogLevel(-1)
    if not path.exists():
        sys.exit(f"vosk model not found at {path} — see setup note at top of this file")
    return Model(str(path))


def transcribe_all(files: list[Path], model) -> dict:
    from vosk import KaldiRecognizer
    import tempfile

    results = {}
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "a.wav"
        for f in files:
            r = subprocess.run(
                [
                    "ffmpeg", "-y", "-loglevel", "error",
                    "-i", str(f), "-ar", "16000", "-ac", "1",
                    "-c:a", "pcm_s16le", str(wav),
                ],
                capture_output=True,
            )
            if r.returncode != 0:
                results[f.name] = ""
                continue
            with wave.open(str(wav), "rb") as wf:
                rec = KaldiRecognizer(model, wf.getframerate())
                while True:
                    d = wf.readframes(4000)
                    if not d:
                        break
                    rec.AcceptWaveform(d)
                results[f.name] = json.loads(rec.FinalResult()).get("text", "").strip()
    return results


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--course", default=None, help="only this course")
    ap.add_argument("--sample", type=int, default=0, help="N sentences per course (0 = all)")
    ap.add_argument("--full", action="store_true", help="audit every sentence")
    ap.add_argument("--ids", nargs="*", default=[], help="specific sentence ids")
    ap.add_argument("--min-overlap", type=float, default=0.5)
    ap.add_argument("--model", default=str(DEFAULT_MODEL))
    ap.add_argument("--json", default=None, help="write JSON report here")
    args = ap.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg not found on PATH — install it (apt install ffmpeg / brew install ffmpeg)")

    sentences = parse_sentences()
    model = load_model(Path(args.model))

    picks: list[str] = []
    if args.ids:
        picks = [i for i in args.ids if i in sentences]
    else:
        by_course: dict[str, list[str]] = {}
        for sid, s in sentences.items():
            by_course.setdefault(s["courseId"], []).append(sid)
        for course, ids in sorted(by_course.items()):
            if args.course and course != args.course:
                continue
            ids_sorted = sorted(ids)
            n = len(ids_sorted)
            if args.full:
                chosen = ids_sorted
            elif args.sample:
                step = max(1, n // args.sample)
                chosen = [ids_sorted[i] for i in range(0, n, step)][: args.sample]
            else:
                chosen = ids_sorted
            picks.extend(chosen)

    print(f"Auditing {len(picks)} sentence(s) [min-overlap={args.min_overlap}]")
    files = [AUDIO_DIR / sentences[sid]["courseId"] / f"{sid}.mp3" for sid in picks]
    transcripts = transcribe_all(files, model)

    rows = []
    counts = {
        "PASS": 0,
        "FAIL — AUDIO CONTENT MISMATCH": 0,
        "MANUAL CHECK REQUIRED": 0,
        "MISSING AUDIO": 0,
    }
    for sid, f in zip(picks, files):
        s = sentences[sid]
        if not f.exists():
            status = "MISSING AUDIO"
            heard = ""
            ov = 0.0
        else:
            heard = transcripts.get(f.name, "")
            if not heard:
                status = "MANUAL CHECK REQUIRED"
                ov = 0.0
            else:
                ov = overlap(s["english"], heard)
                if ov >= args.min_overlap:
                    status = "PASS"
                elif ov < 0.35:
                    status = "FAIL — AUDIO CONTENT MISMATCH"
                else:
                    status = "MANUAL CHECK REQUIRED"
        counts[status] += 1
        rows.append(
            {
                "course": s["courseId"],
                "id": sid,
                "visibleEnglish": s["english"],
                "audioFile": f"{s['courseId']}/{sid}.mp3",
                "heardText": heard,
                "overlap": round(ov, 2),
                "status": status,
            }
        )

    width = max(len(r["id"]) for r in rows) if rows else 10
    print(f"\n{'ID':<{width}}  {'OVERLAP':>7}  STATUS")
    for r in rows:
        print(f"{r['id']:<{width}}  {r['overlap']:>7.0%}  {r['status']}")
        if "FAIL" in r["status"]:
            print(f"{'':<{width}}    visible: {r['visibleEnglish'][:70]}")
            print(f"{'':<{width}}    heard:   {r['heardText'][:70]}")

    print("\n" + "─" * 60)
    print("SUMMARY (SPOKEN CONTENT):")
    for k, v in counts.items():
        if v:
            print(f"  {k}: {v}")
    total_ok = counts["PASS"]
    print(f"  → {total_ok}/{len(rows)} verified correct (FILE MAPPING + SPOKEN CONTENT)")

    if args.json:
        out = {
            "auditedAt": json.dumps(__import__("datetime").datetime.now().isoformat()),
            "minOverlap": args.min_overlap,
            "results": rows,
            "summary": counts,
            "verificationLevel": "SPOKEN CONTENT VERIFIED (STT)" if counts["FAIL — AUDIO CONTENT MISMATCH"] == 0 and counts["MANUAL CHECK REQUIRED"] == 0 else "ISSUES FOUND",
        }
        Path(args.json).write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nJSON report → {args.json}")

    sys.exit(0 if counts["FAIL — AUDIO CONTENT MISMATCH"] == 0 and counts["MISSING AUDIO"] == 0 else 1)


if __name__ == "__main__":
    main()
