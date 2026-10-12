"""Voiceover generation for pitch/timeline.json.

  python3 audio/voiceover.py --engine elevenlabs   # real voice; needs ELEVENLABS_API_KEY in env
  python3 audio/voiceover.py --engine piper        # offline stand-in (timing only)

Writes audio/vo/<id>.wav (48 kHz mono) and audio/vo.json with measured durations,
then checks every line ends before the next cue starts.
"""
import argparse, json, os, sys, io, wave
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

ap = argparse.ArgumentParser()
ap.add_argument("--engine", default="elevenlabs", choices=["elevenlabs", "piper"])
ap.add_argument("--voice", default="JBFqnCBsd6RMkjVDRZzb")   # ElevenLabs "George": warm, clear narrator
ap.add_argument("--model", default="eleven_multilingual_v2")
ap.add_argument("--piper-model", default=os.environ.get("PIPER_MODEL", ""))
a = ap.parse_args()

TL = json.load(open("pitch/timeline.json"))
os.makedirs("audio/vo", exist_ok=True)
SR = 48000

def to48k(data, sr):
    if data.ndim > 1: data = data.mean(1)
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr); data = resample_poly(data, SR // g, sr // g)
    return data.astype(np.float32)

def eleven(text):
    import urllib.request
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: sys.exit("ELEVENLABS_API_KEY not set")
    body = json.dumps({"text": text, "model_id": a.model,
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{a.voice}?output_format=pcm_44100", data=body,
                                 headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "application/octet-stream"})
    with urllib.request.urlopen(req, timeout=120) as r: raw = r.read()
    data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    return to48k(data, 44100)

_piper = None
def piper(text):
    global _piper
    from piper import PiperVoice
    if _piper is None: _piper = PiperVoice.load(a.piper_model)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w: _piper.synthesize_wav(text, w)
    buf.seek(0); data, sr = sf.read(buf)
    return to48k(data, sr)

synth = eleven if a.engine == "elevenlabs" else piper
meta = {"engine": a.engine, "lines": []}
for line in TL["voice"]:
    data = synth(line["text"])
    # trim silence, normalize peak, gentle fade edges
    thr = 0.01; idx = np.where(np.abs(data) > thr)[0]
    if len(idx): data = data[max(idx[0] - 1200, 0): idx[-1] + 4800]
    data = data / (np.max(np.abs(data)) + 1e-6) * 0.9
    f = min(480, len(data) // 4); data[:f] *= np.linspace(0, 1, f); data[-f:] *= np.linspace(1, 0, f)
    sf.write(f"audio/vo/{line['id']}.wav", data, SR, subtype="PCM_16")
    dur = len(data) / SR
    meta["lines"].append({**line, "dur": round(dur, 3)})
    print(f"{line['id']}  t={line['t']:6.1f}  dur={dur:5.2f}s  ends={line['t']+dur:6.1f}")

# cue check
ok = True
for i, l in enumerate(meta["lines"]):
    nxt = meta["lines"][i + 1]["t"] if i + 1 < len(meta["lines"]) else TL["duration"]
    slack = nxt - (l["t"] + l["dur"])
    if slack < 0.5:
        ok = False; print(f"!! {l['id']} overruns next cue by {-slack:.2f}s (slack {slack:.2f})")
json.dump(meta, open("audio/vo.json", "w"), indent=1)
print("all cues fit" if ok else "SOME CUES OVERRUN — adjust timeline.json")
