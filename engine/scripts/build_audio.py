"""Voiceover + timeline + score for one reel.

    python scripts/build_audio.py 01_investors_dont_fund_ideas

Reads   ../reels/<slug>.json              (the script: one beat = one spoken line)
Writes  public/reels/<slug>/vo_XX.wav     (one file per beat)
        public/reels/<slug>/timeline.json (beat windows + per-word times, read by Remotion)
        public/reels/<slug>/mix.wav       (voice + original score, ducked)

Voice, in order of priority for each beat:
  1. ../reels/<slug>/voice/<beat id>.wav   a line you recorded or generated yourself
  2. Chatterbox clone of ../voice/me.wav   your cloned voice (runs in ../.venv-voice, CPU)
  3. edge-tts                              stock placeholder, only if the clone can't run
Set "engine": "edge" in the reel script to force the stock voice.
Cloned lines are cached in ../reels/<slug>/.clone/ and only regenerated when their text changes.
Word timings for non-edge beats are estimated from word length.
"""
import asyncio, hashlib, json, os, subprocess, sys, wave

import edge_tts
import numpy as np

from score import make_mix

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(ENGINE)
REELS = os.path.join(ROOT, "reels")
VOICE_REF = os.path.join(ROOT, "voice", "me.wav")
VENV_PY = os.path.join(ROOT, ".venv-voice", "Scripts", "python.exe")  # Windows
if not os.path.exists(VENV_PY):
    VENV_PY = os.path.join(ROOT, ".venv-voice", "bin", "python")  # Linux (GitHub Actions)
SR = 48000


def clone_lines(spec, slug):
    """Your cloned voice for every beat -> {beat id: wav}. Empty if the clone is off or fails."""
    if spec.get("engine") == "edge" or os.environ.get("VOICE") == "stock" or not (os.path.exists(VOICE_REF) and os.path.exists(VENV_PY)):
        return {}
    cache = os.path.join(REELS, slug, ".clone")
    os.makedirs(cache, exist_ok=True)
    ref_hash = hashlib.sha1(open(VOICE_REF, "rb").read()).hexdigest()[:12]  # content, not mtime: CI checkouts reset mtimes
    key = lambda b: f"{b['text']}|{ref_hash}"  # new sample -> regenerate everything
    done, todo = {}, []
    for b in spec["beats"]:
        wav, stamp = os.path.join(cache, f"{b['id']}.wav"), os.path.join(cache, f"{b['id']}.txt")
        if os.path.exists(wav) and os.path.exists(stamp) and open(stamp, encoding="utf-8").read() == key(b):
            done[b["id"]] = wav
        else:
            todo.append((b, wav, stamp))
    if todo:
        print(f"Cloning {len(todo)} line(s) in your voice (CPU, a few minutes)...", flush=True)
        jobs = os.path.join(cache, "jobs.json")
        with open(jobs, "w", encoding="utf-8") as f:
            json.dump({"ref": VOICE_REF, "lines": [{"text": b["text"], "out": wav} for b, wav, _ in todo]}, f)
        r = subprocess.run([VENV_PY, os.path.join(ENGINE, "scripts", "clone_voice.py"), jobs])
        for b, wav, stamp in todo:
            if r.returncode == 0 and os.path.exists(wav):
                open(stamp, "w", encoding="utf-8").write(key(b))
                done[b["id"]] = wav
        if r.returncode != 0:
            print("\nNOTE: voice clone failed (see above); those lines use the stock placeholder voice.\n")
    return done


def ffmpeg_wav(src, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ar", str(SR), "-ac", "1", dst], check=True)


def read_wav(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def loud_span(x):
    """(first, last) audible second, so the gaps between lines are exactly what the script says."""
    loud = np.where(np.abs(x) > 0.01)[0]
    if not len(loud):
        return 0.0, len(x) / SR
    return loud[0] / SR, loud[-1] / SR + 0.08


async def tts(text, voice, rate, pitch, mp3):
    """edge-tts with word boundaries -> [(offset_s, dur_s), ...] relative to the file start."""
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    marks = []
    with open(mp3, "wb") as f:
        async for c in comm.stream():
            if c["type"] == "audio":
                f.write(c["data"])
            elif c["type"] == "WordBoundary":
                marks.append((c["offset"] / 1e7, c["duration"] / 1e7))
    return marks


def word_times(words, start, end, marks, file_start):
    """Per-word (t, e). Uses TTS marks when they line up 1:1 with our words, else spreads by length."""
    if marks and len(marks) == len(words):
        return [(file_start + o, file_start + o + d) for o, d in marks]
    weight = [len(w.strip(".,?!")) + 2 + (5 if w[-1] in ".,?!" else 0) for w in words]
    tot, acc, out = sum(weight), 0, []
    for wt in weight:
        a = start + (end - start) * acc / tot
        acc += wt
        out.append((a, start + (end - start) * acc / tot))
    return out


async def main(slug):
    spec = json.load(open(os.path.join(REELS, f"{slug}.json"), encoding="utf-8"))
    out_dir = os.path.join(ENGINE, "public", "reels", slug)
    own_voice = os.path.join(REELS, slug, "voice")
    os.makedirs(out_dir, exist_ok=True)
    cloned = clone_lines(spec, slug)
    if os.environ.get("REQUIRE_CLONE") and spec.get("engine") != "edge":
        missing = [b["id"] for b in spec["beats"]
                   if b["id"] not in cloned and not os.path.exists(os.path.join(own_voice, f"{b['id']}.wav"))]
        if missing:
            sys.exit(f"Voice clone missing for {missing}; refusing to fall back to the stock voice (REQUIRE_CLONE).")

    t, beats = 0.0, []
    for i, b in enumerate(spec["beats"]):
        wav = os.path.join(out_dir, f"vo_{i:02d}.wav")
        mine = os.path.join(own_voice, f"{b['id']}.wav")
        if os.path.exists(mine):
            ffmpeg_wav(mine, wav)
            marks, src = [], "your recording"
        elif b["id"] in cloned:
            ffmpeg_wav(cloned[b["id"]], wav)
            marks, src = [], "your clone"
        else:
            mp3 = wav[:-4] + ".mp3"
            marks = await tts(b["text"], spec.get("voice", "en-US-AndrewNeural"),
                              spec.get("rate", "+0%"), spec.get("pitch", "+0Hz"), mp3)
            ffmpeg_wav(mp3, wav)
            os.remove(mp3)
            src = "edge-tts"
        lead, end = loud_span(read_wav(wav))
        t += b["gap"]
        file_start = t - lead            # place the file so its first sound lands exactly at t
        words = b["text"].split()
        times = word_times(words, t, file_start + end, marks, file_start)
        beats.append({**b, "file": f"reels/{slug}/vo_{i:02d}.wav", "fileStart": round(file_start, 3),
                      "start": round(t, 3), "end": round(file_start + end, 3),
                      "words": [{"w": w, "t": round(a, 3), "e": round(z, 3)} for w, (a, z) in zip(words, times)]})
        t = file_start + end
        print(f"{b['id']:6s} {t - (end - lead):6.2f} -> {t:6.2f}  [{src}{'' if marks or src != 'edge-tts' else ', est. words'}] {b['text']}")

    total = round(t + spec.get("tail", 2.5), 3)
    # Visual window of each beat: from just before its line until just before the next one.
    for j, b in enumerate(beats):
        b["from"] = 0 if j == 0 else round(b["start"] - 0.15, 3)
        b["to"] = round(beats[j + 1]["start"] - 0.15, 3) if j + 1 < len(beats) else total
    tl = {"slug": slug, "title": spec.get("title", slug), "total": total, "beats": beats}
    with open(os.path.join(out_dir, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(tl, f, indent=1, ensure_ascii=False)
    make_mix(tl, os.path.join(ENGINE, "public"), os.path.join(out_dir, "mix.wav"))
    print("TOTAL", total, "s")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
