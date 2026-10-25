"""Original score + sound design, synthesised with numpy and locked to the reel's timeline.

No samples and no licensed music, so nothing gets muted or claimed on Instagram.
The score follows the beat layouts: boom on the hook, a pulse under the list, a drop-out before
the twist, a riser into the CTA. The voice is mixed on top with sidechain ducking.
"""
import os, wave

import numpy as np
from scipy.signal import butter, oaconvolve, sosfilt

SR = 48000
rng = np.random.default_rng(11)


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 2
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def saw(f, n):
    ph = (f * np.arange(n) / SR + rng.random()) % 1.0
    return 2 * ph - 1


# ---------------------------------------------------------------- instruments
def pad(notes, dur, cutoff=900, a=1.2, r=1.5):
    n = int(dur * SR)
    l = sum(saw(note(m) * (1 + d), n) for m in notes for d in (-0.004, 0.003))
    r_ = sum(saw(note(m) * (1 + d), n) for m in notes for d in (0.005, -0.002))
    e = env(n, a, r)
    return np.stack([lp(l, cutoff, 4) * e, lp(r_, cutoff, 4) * e]) / len(notes)


def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (18 if open_ else 70)) * 0.5


def boom(dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.4)
    crack = lp(rng.standard_normal(n), 2500) * np.exp(-t * 14) * 0.5
    return body + crack


def whoosh(dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    lo, hi = lp(x, 900), lp(x, 6000) - lp(x, 1500)
    k = t / dur
    sweep = lo * (1 - k) + hi * k
    return np.stack([sweep, np.roll(sweep, 240)]) * np.sin(np.pi * k) ** 2


def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 400)
    k = t / dur
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * k ** 2) / SR) * 0.3
    return (lp(x, 6000) * 0.6 + tone) * k ** 2.2


def tick():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 60) * 0.6


# ---------------------------------------------------------------- arrangement
def make_mix(tl, public_dir, out_path):
    N = int(tl["total"] * SR)
    L = np.zeros(N); R = np.zeros(N); SL = np.zeros(N); SRv = np.zeros(N)

    def put(sig, t, gain=1.0, pan=0.0, send=0.0):
        i = int(t * SR)
        if i >= N or i < 0:
            return
        if sig.ndim == 1:
            sig = np.stack([sig, sig])
        n = min(sig.shape[1], N - i)
        gl, gr = gain * np.sqrt((1 - pan) / 2), gain * np.sqrt((1 + pan) / 2)
        L[i:i + n] += sig[0, :n] * gl; R[i:i + n] += sig[1, :n] * gr
        SL[i:i + n] += sig[0, :n] * gl * send; SRv[i:i + n] += sig[1, :n] * gr * send

    beats = tl["beats"]
    by_layout = lambda name: [b for b in beats if b["layout"] == name]
    nums, cta = by_layout("number"), by_layout("cta")
    # The twist: marked in the script, else whatever lands right after the list.
    twist = next((b for b in beats if b.get("twist")), None)
    if twist is None and nums:
        after = beats.index(nums[-1]) + 1
        twist = beats[after] if after < len(beats) and beats[after]["layout"] != "cta" else None
    cta_t = cta[0]["from"] if cta else tl["total"] - 3

    # Dark minor pad under everything (Dm - Bb - F - C), one chord per bar at 112 bpm.
    bpm = 112; beat = 60 / bpm; bar = 4 * beat
    prog = [[50, 57, 62, 65], [46, 53, 58, 62], [45, 53, 57, 60], [48, 55, 60, 64]]
    k = 0; t = 0.0
    while t < tl["total"]:
        put(pad(prog[k % 4], bar + 1.2, cutoff=700 + 500 * min(1, t / tl["total"] * 1.5)), t, 0.32, send=0.6)
        t += bar; k += 1

    # Hook: hit on frame 1 (pattern interrupt), tick on the second line.
    put(boom(1.6), 0.02, 1.0, send=0.5)
    for b in beats[1:2]:
        put(tick(), b["start"], 0.5, send=0.4)

    # Body: kick + hats from the second beat until the twist (or the end card), building as it goes.
    if len(beats) > 2:
        a = beats[1]["from"] - 0.1
        z = (twist["from"] - 0.25) if twist else cta_t - 0.1
        g = np.arange(a, z, beat / 2)
        for j, tt in enumerate(g):
            lift = 0.65 + 0.35 * (tt - a) / max(z - a, 1e-3)
            if j % 2 == 0: put(kick(), tt, 0.8 * lift)
            put(hat(j % 4 == 3), tt, 0.25 * lift, pan=0.3 if j % 2 else -0.3)
        for b in beats[1:]:
            if b is not twist and b["layout"] != "cta":
                put(boom(0.9), b["start"], 0.5 if b["layout"] in ("number", "stat", "versus") else 0.3, send=0.4)

    # Chat bubbles: a soft pop as each message lands (same timing as layouts.tsx bubbleTime).
    for b in by_layout("chat"):
        msgs = b.get("msgs") or []
        for k, (who, _) in enumerate(msgs):
            at = b["start"] + (b["end"] - b["start"]) * k / len(msgs)
            put(tick(), at, 0.55 if who == "them" else 0.4, pan=-0.25 if who == "them" else 0.25, send=0.2)

    # Twist: the pulse drops out (silence = attention), then lands with a boom.
    if twist:
        put(riser(0.9), twist["from"] - 0.9, 0.35)
        put(boom(1.8), twist["start"], 1.0, send=0.7)

    # Transitions: a whoosh into every beat change.
    for b in beats[1:]:
        put(whoosh(), b["from"] - 0.32, 0.45, send=0.3)

    # CTA: riser in, warm major lift on the end card.
    put(riser(1.6), cta_t - 1.6, 0.5, send=0.3)
    put(boom(2.0), cta_t, 0.9, send=0.7)
    put(pad([50, 57, 62, 66, 69], tl["total"] - cta_t, cutoff=2000, a=0.05, r=2.0), cta_t, 0.45, send=0.8)

    # Room reverb on the send bus.
    n_ir = int(2.6 * SR); ti = np.arange(n_ir) / SR
    irl = lp(rng.standard_normal(n_ir) * np.exp(-ti * 2.4), 5000)
    irr = lp(rng.standard_normal(n_ir) * np.exp(-ti * 2.4), 5000)
    irl /= np.sqrt((irl ** 2).sum()); irr /= np.sqrt((irr ** 2).sum())
    L += oaconvolve(SL, irl)[:N] * 0.8; R += oaconvolve(SRv, irr)[:N] * 0.8

    # Voice.
    vo = np.zeros(N)
    for b in beats:
        with wave.open(os.path.join(public_dir, b["file"])) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        i = int(b["fileStart"] * SR)
        if i < 0:  # file's leading silence is longer than the gap before it: drop that silence
            x, i = x[-i:], 0
        n = min(len(x), N - i); vo[i:i + n] += x[:n]
    vo = hp(vo, 85)
    vo = vo / (np.abs(vo).max() + 1e-9) * 0.9

    # Sidechain: score dips under the voice.
    win = int(0.12 * SR)
    ev = np.convolve(np.abs(vo), np.ones(win) / win, mode="same")
    duck = 1 - 0.6 * np.clip(ev / 0.07, 0, 1)
    duck = np.convolve(duck, np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")

    peak = max(np.abs(L).max(), np.abs(R).max()) + 1e-9
    L, R = L / peak * 0.9, R / peak * 0.9
    out = np.stack([L * duck * 0.55 + vo, R * duck * 0.55 + vo])
    fade = int(1.0 * SR); out[:, -fade:] *= np.linspace(1, 0, fade)
    out = np.tanh(out * 1.4) * 0.97  # soft limiter

    with wave.open(out_path, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out.T * 32767).astype(np.int16).tobytes())
    print("mix.wav", round(N / SR, 2), "s")
