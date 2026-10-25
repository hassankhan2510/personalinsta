r"""Speak lines in Hassan's cloned voice (Chatterbox, MIT, CPU). Runs inside ../.venv-voice.

    .venv-voice/Scripts/python engine/scripts/clone_voice.py jobs.json

jobs.json = {"ref": "path/to/me.wav", "lines": [{"text": "...", "out": "path/to/out.wav"}, ...]}
The model loads once (slow on CPU), then each line takes well under a minute.
No account, token or access request: the weights are public and download once to D:\hassaninsta\.cache.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("HF_HUB_CACHE", os.path.join(HERE, "..", "..", ".cache", "hf", "hub"))

import torch
import torchaudio as ta

# Weights are saved CUDA-mapped; force CPU deserialisation.
_load = torch.load
torch.load = lambda *a, **k: _load(*a, **{"map_location": "cpu", **k})

# Resemble's watermarker ships broken on some CPU setups; we don't need it on our own voice.
try:
    import perth

    if getattr(perth, "PerthImplicitWatermarker", None) is None:
        class _NoWatermark:
            def apply_watermark(self, wav, sample_rate=None, **_):
                return wav

        perth.PerthImplicitWatermarker = _NoWatermark
except Exception:
    pass

from chatterbox.tts import ChatterboxTTS

# Reel delivery: a bit more energy than default, slightly quicker pacing.
EXAGGERATION, CFG = 0.6, 0.4

jobs = json.load(open(sys.argv[1], encoding="utf-8"))
model = ChatterboxTTS.from_pretrained(device="cpu")
for i, job in enumerate(jobs["lines"]):
    wav = model.generate(job["text"], audio_prompt_path=jobs["ref"], exaggeration=EXAGGERATION, cfg_weight=CFG)
    ta.save(job["out"], wav, model.sr)
    print(f"  [{i + 1}/{len(jobs['lines'])}] {job['text']}", flush=True)
