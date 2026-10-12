"""Shared synthesizer: instruments, effects, mixing, loudness and beat measurement.

Outputs:
  audio/score.wav      48 kHz stereo, -14 LUFS
  beats.json           measured beat grid (librosa) + section markers
  beats.js             same data as window.BEATS for the renderer
"""
import json, math, os, sys
import numpy as np
from scipy import signal
import soundfile as sf
import librosa
import pyloudnorm as pyln

SR = 48000
BPM = 120.0
BEAT = 60.0 / BPM          # 0.5 s
BAR = 4 * BEAT             # 2.0 s
DUR = 420.0
N = int(DUR * SR)
rng = np.random.default_rng(7)

SECTIONS = {
    "intro":  (0.0,   16.0),
    "timing": (16.0,  76.0),
    "type":   (76.0,  136.0),
    "shape":  (136.0, 196.0),
    "data":   (196.0, 256.0),
    "depth":  (256.0, 316.0),
    "systems":(316.0, 376.0),
    "outro":  (376.0, 420.0),
}

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def t_axis(sec): return np.arange(int(sec * SR)) / SR
def env_ad(n, a, d, curve=4.0):
    """attack (s), exponential decay (s)."""
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1.0)
    e *= np.exp(-np.maximum(t - a, 0) * curve / max(d, 1e-4))
    return e
def env_adsr(n, a, d, s, r, hold):
    t = np.arange(n) / SR
    e = np.ones(n)
    att = t < a
    e[att] = t[att] / max(a, 1e-4)
    dec = (t >= a) & (t < a + d)
    e[dec] = 1 + (s - 1) * (t[dec] - a) / max(d, 1e-4)
    sus = (t >= a + d) & (t < hold)
    e[sus] = s
    rel = t >= hold
    e[rel] = s * np.exp(-(t[rel] - hold) * 5 / max(r, 1e-4))
    return e
def lowpass(x, fc, order=2):
    fc = float(np.clip(fc, 20, SR / 2 - 100))
    b, a = signal.butter(order, fc / (SR / 2), "low")
    return signal.lfilter(b, a, x)
def highpass(x, fc, order=2):
    fc = float(np.clip(fc, 20, SR / 2 - 100))
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)
def bandpass(x, lo, hi, order=2):
    lo = float(np.clip(lo, 20, SR / 2 - 200)); hi = float(np.clip(hi, lo + 50, SR / 2 - 100))
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)
def saw(f, n, detune=0.0):
    t = np.arange(n) / SR
    ph = (t * f * (1 + detune)) % 1.0
    return 2 * ph - 1
def sqr(f, n):
    t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * f * t))
def sine(f, n, phase=0.0):
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t + phase)
def noise(n): return rng.standard_normal(n)

# ---------------- buses ----------------
buses = {}
def init(duration, sections):
    """Set the timeline before arranging."""
    global DUR, N, SECTIONS, buses
    DUR = float(duration); N = int(DUR * SR); SECTIONS = dict(sections)
    buses = {k: np.zeros((N, 2)) for k in ("drums", "bass", "music", "sfx")}
def put(bus, t0, mono_or_stereo, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = np.asarray(mono_or_stereo)
    if x.ndim == 1:
        l = x * (1 - max(pan, 0)); r = x * (1 + min(pan, 0))
        x = np.stack([l, r], 1)
    n = min(len(x), N - i)
    buses[bus][i:i + n] += x[:n] * gain

# ---------------- instruments ----------------
def kick(t0, gain=1.0, tone=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 42 + 120 * np.exp(-t * 28) * tone
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7)
    click = highpass(noise(n), 2500) * np.exp(-t * 300) * 0.5
    put("drums", t0, np.tanh((body + click) * 1.8), gain)
def sub_tone(t0, dur, f, gain=1.0):
    n = int(dur * SR)
    put("bass", t0, sine(f, n) * env_adsr(n, 0.01, 0.1, 0.9, 0.2, dur - 0.2), gain)
def snare(t0, gain=1.0):
    n = int(0.28 * SR); t = np.arange(n) / SR
    body = sine(185, n) * np.exp(-t * 35)
    nz = bandpass(noise(n), 900, 8000) * np.exp(-t * 18)
    put("drums", t0, np.tanh((body * 0.6 + nz) * 1.5), gain)
def clap(t0, gain=1.0):
    n = int(0.3 * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for k, dt in enumerate((0, 0.012, 0.024, 0.036)):
        i = int(dt * SR); m = n - i
        x[i:] += bandpass(noise(m), 1200, 6000) * np.exp(-np.arange(m) / SR * (60 if k < 3 else 14))
    put("drums", t0, np.tanh(x * 1.2), gain)
def hat(t0, open_=False, gain=1.0, pan=0.0):
    n = int((0.35 if open_ else 0.07) * SR); t = np.arange(n) / SR
    x = highpass(noise(n), 7000, 4) * np.exp(-t * (9 if open_ else 70))
    put("drums", t0, x, gain, pan)
def rim(t0, gain=1.0, pan=0.0):
    n = int(0.05 * SR); t = np.arange(n) / SR
    x = bandpass(noise(n), 2500, 5000) * np.exp(-t * 180) + sine(1800, n) * np.exp(-t * 250) * 0.3
    put("drums", t0, x, gain, pan)
def tick(t0, f=4000, gain=1.0, pan=0.0):
    n = int(0.04 * SR); t = np.arange(n) / SR
    put("sfx", t0, sine(f, n) * np.exp(-t * 220), gain, pan)
def bass_note(t0, dur, note, gain=1.0, cutoff=900, stacc=False):
    n = int(dur * SR); f = midi(note)
    x = saw(f, n) + saw(f, n, 0.004) * 0.5 + sine(f / 2, n) * 0.6
    e = env_ad(n, 0.004, 0.18 if stacc else dur * 0.8, 3.0)
    t = np.arange(n) / SR
    fc = cutoff * (0.3 + 0.7 * np.exp(-t * 10)) + 80
    # cheap filter sweep: three stages blended
    x = lowpass(x, cutoff) * 0.6 + lowpass(x, cutoff * 0.35) * 0.4
    put("bass", t0, np.tanh(x * e * 1.4), gain)
def pad_chord(t0, dur, notes, gain=1.0, cutoff=1400, bright=0.0):
    n = int(dur * SR)
    x = np.zeros(n)
    for k, nt in enumerate(notes):
        f = midi(nt)
        v = saw(f, n, 0.0) + saw(f, n, 0.006) + saw(f, n, -0.005) + sine(f * 2, n) * 0.15 * bright
        x += v / len(notes)
    e = env_adsr(n, min(0.9, dur * 0.25), 0.4, 0.8, 0.9, dur - 0.9)
    x = lowpass(x, cutoff)
    # slow stereo movement
    t = np.arange(n) / SR
    l = x * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t))
    r = x * (0.75 + 0.25 * np.cos(2 * np.pi * 0.09 * t))
    put("music", t0, np.stack([l, r], 1) * e[:, None], gain)
def pluck(t0, note, gain=1.0, dur=0.6, pan=0.0, bright=4000):
    n = int(dur * SR); f = midi(note)
    x = sqr(f, n) * 0.5 + saw(f, n) * 0.5
    t = np.arange(n) / SR
    # filter sweep via blend of two lowpasses
    sweep = np.exp(-t * 14)
    x = lowpass(x, bright) * sweep + lowpass(x, bright * 0.2) * (1 - sweep) * 0.8
    put("music", t0, x * env_ad(n, 0.002, dur, 4.5), gain, pan)
def lead(t0, dur, note, gain=1.0, vib=5.0, glide_from=None):
    n = int(dur * SR); t = np.arange(n) / SR
    f = midi(note) * np.ones(n)
    if glide_from is not None:
        f = midi(glide_from) + (midi(note) - midi(glide_from)) * np.minimum(t / 0.08, 1)
    f = f * (1 + 0.004 * np.sin(2 * np.pi * vib * t) * np.minimum(t / 0.3, 1))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * 0.6 + np.sin(2 * ph) * 0.25 + np.sin(3 * ph) * 0.1 + (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.25
    x = lowpass(x, 3500)
    put("music", t0, x * env_adsr(n, 0.02, 0.1, 0.8, 0.25, dur - 0.25), gain)
def arp_note(t0, note, gain=1.0, pan=0.0):
    n = int(0.22 * SR); f = midi(note)
    x = sine(f, n) * 0.6 + sine(2 * f, n) * 0.3 + saw(f, n) * 0.25
    x = lowpass(x, 5000)
    put("music", t0, x * env_ad(n, 0.002, 0.2, 5.0), gain, pan)
def riser(t0, dur, gain=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = noise(n)
    out = np.zeros(n)
    steps = 24
    for k in range(steps):
        a = int(k * n / steps); b = int((k + 1) * n / steps)
        lo = 150 * (1 + 12 * k / steps); hi = lo * 3
        out[a:b] = bandpass(x[a:b], lo, hi)
    e = (t / dur) ** 2.2
    put("sfx", t0, out * e, gain)
def impact(t0, gain=1.0):
    n = int(1.6 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 80 * np.exp(-t * 12)) / SR) * np.exp(-t * 3.2)
    crack = highpass(noise(n), 1500) * np.exp(-t * 40) * 0.6
    tail = bandpass(noise(n), 300, 3000) * np.exp(-t * 3) * 0.25
    put("sfx", t0, np.tanh((boom + crack + tail) * 1.6), gain)
def whoosh(t0, dur=0.6, gain=1.0, down=False, pan=0.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = noise(n); out = np.zeros(n); steps = 16
    for k in range(steps):
        a = int(k * n / steps); b = int((k + 1) * n / steps)
        p = (steps - 1 - k) / steps if down else k / steps
        lo = 300 + 5000 * p ** 2; out[a:b] = bandpass(x[a:b], lo, lo * 2.2)
    e = np.sin(np.pi * np.minimum(t / dur, 1)) ** 1.5
    put("sfx", t0, out * e, gain, pan)
def click(t0, gain=1.0, pan=0.0):
    n = int(0.03 * SR); t = np.arange(n) / SR
    put("sfx", t0, highpass(noise(n), 3000) * np.exp(-t * 400), gain, pan)
def blip(t0, note, gain=1.0, pan=0.0):
    n = int(0.12 * SR); t = np.arange(n) / SR
    put("sfx", t0, sine(midi(note), n) * np.exp(-t * 45), gain, pan)

# ---------------- harmony ----------------
# A minor. chords as midi note lists (close voicing around C4)
A_MIN = [57, 60, 64]; F_MAJ = [53, 57, 60]; C_MAJ = [55, 60, 64]; G_MAJ = [55, 59, 62]
E_MIN = [52, 55, 59]; D_MIN = [50, 53, 57]
PROG_MAIN = [(A_MIN, 45), (F_MAJ, 41), (C_MAJ, 48), (G_MAJ, 43)]   # (chord, bass midi)
PROG_DEEP = [(A_MIN, 45), (E_MIN, 40), (F_MAJ, 41), (D_MIN, 38)]
PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79]

def bars_in(sec):
    s, e = SECTIONS[sec]
    return [s + k * BAR for k in range(int(round((e - s) / BAR)))]

# ---------------- effects & mix ----------------
def delay(x, time, fb, mix):
    d = int(time * SR); y = x.copy()
    buf = np.zeros_like(x)
    # feedback delay via iterative shifts (bounded taps)
    tap = x.copy(); g = mix
    for _ in range(6):
        shifted = np.zeros_like(tap); shifted[d:] = tap[:-d]
        tap = shifted * fb if _ else shifted
        buf += tap * g
        if not _: g = mix
    return y + buf
def comb(x, d, g):
    """y[n] = x[n] + g*y[n-d], processed in chunks of d samples (vectorized)."""
    y = x.copy()
    for k in range(d, len(x), d):
        e = min(k + d, len(x)); y[k:e] += g * y[k - d:e - d]
    return y
def allpass(x, d, g):
    """y[n] = -g*x[n] + x[n-d] + g*y[n-d]"""
    y = -g * x
    xd = np.zeros_like(x); xd[d:] = x[:-d]
    y += xd
    for k in range(d, len(x), d):
        e = min(k + d, len(x)); y[k:e] += g * y[k - d:e - d]
    return y
def reverb(x, mix=0.25):
    combs = [(1557, 0.84), (1617, 0.82), (1491, 0.83), (1422, 0.81)]
    out = np.zeros_like(x)
    for d, g in combs:
        out += comb(x, d, g) / len(combs)
    for d in (225, 556):
        out = allpass(out, d, 0.5)
    return x + lowpass(out, 5000) * mix


def master(vo=None, vo_gain=1.0, duck_db=-9.0, target_lufs=-14.0):
    """Mix buses (+ optional voiceover array, stereo N×2) and normalize to target LUFS after limiting."""
    music = delay(buses["music"], BEAT * 0.75, 0.35, 0.22)
    music = reverb(music, 0.22)
    sfx = reverb(buses["sfx"], 0.15)
    drums = buses["drums"]; bass = buses["bass"]
    duck = np.ones(N)
    for b in np.arange(0, DUR, BEAT):
        i = int(b * SR); n = int(0.25 * SR)
        seg = np.exp(-np.arange(min(n, N - i)) / SR * 14)
        duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], 1 - 0.45 * seg)
    bed = drums * 0.95 + (bass * 0.75 + music * 0.8) * duck[:, None] + sfx * 0.8
    bed = highpass(bed, 28, 2)
    if vo is not None:
        # sidechain: smooth envelope of the voice, music ducks under it
        # envelope at 1 kHz: block peak, fast attack, slow release; then interpolate back
        hop = SR // 1000; nblk = N // hop
        env = np.abs(vo[:nblk * hop]).max(1).reshape(nblk, hop).max(1)
        rel = np.exp(-1 / 350.0); e = np.zeros_like(env); v = 0.0
        for i in range(nblk):
            v = env[i] if env[i] > v else v * rel
            e[i] = v
        e = np.interp(np.arange(N) / hop, np.arange(nblk), e)
        g = 1 - (1 - 10 ** (duck_db / 20)) * np.clip(e / 0.1, 0, 1)
        bed = bed * g[:, None] + vo * vo_gain
    mix = np.tanh(bed * 0.9) / np.tanh(0.9)
    meter = pyln.Meter(SR)
    for _ in range(4):
        L = meter.integrated_loudness(mix)
        mix = mix * 10 ** ((target_lufs - L) / 20)
        mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    L = meter.integrated_loudness(mix); peak = float(np.max(np.abs(mix)))
    fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return mix.astype(np.float32), L, peak

def measure_beats(path, out_json, out_js, sections, duration):
    y, sr = librosa.load(path, sr=22050, mono=True)
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr, start_bpm=BPM, tightness=400, units="frames")
    beats = librosa.frames_to_time(frames, sr=sr).round(4).tolist()
    tempo = float(np.atleast_1d(tempo)[0])
    onset = librosa.onset.onset_strength(y=y, sr=sr); otimes = librosa.times_like(onset, sr=sr)
    peaks = librosa.util.peak_pick(onset, pre_max=20, post_max=20, pre_avg=50, post_avg=50, delta=np.percentile(onset, 97), wait=40)
    accents = otimes[peaks].round(4).tolist()
    data = {"bpm": tempo, "nominal_bpm": BPM, "beats": beats, "accents": accents, "sections": {k: list(v) for k, v in sections.items()}, "duration": duration}
    json.dump(data, open(out_json, "w")); open(out_js, "w").write("window.BEATS=" + json.dumps(data) + ";\n")
    return tempo, len(beats), beats[:4]
