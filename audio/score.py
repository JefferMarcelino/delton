"""Synthesized score + SFX for the showreel. Pure code, no samples.

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
DUR = 420.0                # 7:00
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

# ---------------- arrangement ----------------
# intro: heartbeat
for k, b in enumerate(np.arange(0, 16, BEAT)):
    kick(b, gain=0.55 + 0.45 * (k / 32), tone=0.6 + 0.4 * k / 32)
sub_tone(0, 16, midi(33), 0.35)
for b in np.arange(8, 16, BEAT):
    tick(b + BEAT / 2, 3000, 0.35)
for b in np.arange(12, 16, BEAT / 2):
    hat(b, gain=0.25)
riser(11.0, 5.0, 0.8)
whoosh(15.4, 0.7, 0.8)

def four_floor(sec, kick_g=1.0, hat_g=0.45, clap_g=0.8, open_hat=True, rims=False):
    for b in bars_in(sec):
        for q in range(4):
            kick(b + q * BEAT, kick_g)
            if q in (1, 3): clap(b + q * BEAT, clap_g)
            hat(b + q * BEAT + BEAT / 2, open_=open_hat and q == 3, gain=hat_g, pan=0.25)
            hat(b + q * BEAT, gain=hat_g * 0.5, pan=-0.25)
            if rims and q in (0, 2):
                rim(b + q * BEAT + BEAT * 0.75, 0.5, pan=0.4)

def bass_line(sec, prog, pattern="eighths", gain=0.9, cutoff=900):
    bars = bars_in(sec)
    for i, b in enumerate(bars):
        chord, root = prog[i % len(prog)]
        if pattern == "eighths":
            for e in range(8):
                nt = root if e % 4 != 3 else root + 12
                bass_note(b + e * BEAT / 2, BEAT / 2, nt, gain, cutoff, stacc=True)
        elif pattern == "sixteenth_gate":
            for e in range(16):
                if e % 4 in (0, 2, 3):
                    bass_note(b + e * BEAT / 4, BEAT / 4, root + (12 if e % 8 == 6 else 0), gain * 0.9, cutoff, stacc=True)
        elif pattern == "sustain":
            bass_note(b, BAR, root, gain, cutoff)
            sub_tone(b, BAR, midi(root - 12), 0.4)
        elif pattern == "offbeat":
            for e in range(4):
                bass_note(b + e * BEAT + BEAT / 2, BEAT / 2, root, gain, cutoff, stacc=True)

def pads(sec, prog, gain=0.5, cutoff=1400, bright=0.0, per_bar=1):
    bars = bars_in(sec)
    for i in range(0, len(bars), per_bar):
        chord, root = prog[(i // per_bar) % len(prog)]
        pad_chord(bars[i], BAR * per_bar + 0.3, [n + 12 for n in chord] + [chord[0]], gain, cutoff, bright)

def arps(sec, prog, gain=0.35, rate=4, start_bar=0, octaves=2):
    bars = bars_in(sec)
    for i, b in enumerate(bars[start_bar:], start_bar):
        chord, root = prog[i % len(prog)]
        notes = []
        for o in range(octaves):
            notes += [n + 12 * (o + 1) for n in chord]
        for k in range(4 * rate):
            nt = notes[k % len(notes)] if (k // len(notes)) % 2 == 0 else notes[len(notes) - 1 - k % len(notes)]
            arp_note(b + k * BEAT / rate, nt, gain, pan=math.sin(k * 0.9) * 0.6)

def melody(sec, phrases, gain=0.5):
    """phrases: list of (beat_offset_from_section_start, dur_beats, midi)"""
    s, _ = SECTIONS[sec]
    prev = None
    for off, dur, nt in phrases:
        lead(s + off * BEAT, dur * BEAT, nt, gain, glide_from=prev)
        prev = nt

def fills(sec, every_bars=4, gain=0.7):
    bars = bars_in(sec)
    for i, b in enumerate(bars):
        if (i + 1) % every_bars == 0:
            for k in range(8):
                snare(b + 2 * BEAT + k * BEAT / 4, gain * (0.4 + 0.6 * k / 8))

# ---- 01 timing: driving house
four_floor("timing", 1.0, 0.45, 0.8)
bass_line("timing", PROG_MAIN, "eighths", 0.85, 900)
pads("timing", PROG_MAIN, 0.42, 1200)
arps("timing", PROG_MAIN, 0.3, 4, start_bar=8)
fills("timing", 8, 0.6)
melody("timing", [(32, 2, 76), (34, 1, 74), (35, 1, 72), (36, 3, 69), (40, 2, 72), (42, 1, 74), (43, 1, 76), (44, 4, 79),
                  (48, 2, 76), (50, 1, 74), (51, 1, 72), (52, 3, 67), (56, 2, 69), (58, 1, 72), (59, 1, 74), (60, 4, 72)], 0.45)
impact(16.0, 1.0)

# ---- 02 type: punchy, staccato, stutter
four_floor("type", 1.0, 0.5, 0.9, open_hat=False)
bass_line("type", PROG_MAIN, "sixteenth_gate", 0.9, 1400)
pads("type", PROG_MAIN, 0.25, 900)
fills("type", 4, 0.8)
melody("type", [(0, 1, 81), (1, 1, 79), (2, 2, 76), (8, 1, 81), (9, 1, 79), (10, 2, 72), (16, 0.5, 76), (16.5, 0.5, 79), (17, 0.5, 81), (17.5, 2.5, 84),
                (24, 1, 81), (25, 1, 79), (26, 2, 76), (32, 1, 81), (33, 1, 79), (34, 2, 76), (40, 1, 81), (41, 1, 79), (42, 2, 72),
                (48, 0.5, 76), (48.5, 0.5, 79), (49, 0.5, 81), (49.5, 2.5, 84), (56, 1, 81), (57, 1, 79), (58, 2, 76)], 0.5)
impact(76.0, 1.0); whoosh(75.4, 0.7, 0.8)
for b in bars_in("type"):          # stutter at bar ends
    for k in range(4):
        click(b + 3.5 * BEAT + k * BEAT / 8, 0.5, pan=(k % 2) * 0.8 - 0.4)

# ---- 03 shape: minimal, plucky
four_floor("shape", 0.9, 0.35, 0.0, open_hat=True, rims=True)
bass_line("shape", PROG_MAIN, "offbeat", 0.8, 700)
pads("shape", PROG_MAIN, 0.35, 1000, per_bar=2)
seq = rng.integers(0, len(PENTA), 64)
for i, b in enumerate(bars_in("shape")):
    chord, root = PROG_MAIN[i % 4]
    for k in range(8):
        if (i * 8 + k) % 3 == 0: continue
        nt = PENTA[seq[(i * 8 + k) % 64]]
        pluck(b + k * BEAT / 2, nt, 0.4, 0.5, pan=math.sin(k) * 0.7)
impact(136.0, 1.0); whoosh(135.4, 0.7, 0.8)
fills("shape", 8, 0.5)

# ---- 04 data: ticks, blips, gated bass
four_floor("data", 1.0, 0.4, 0.8, open_hat=False)
bass_line("data", PROG_MAIN, "sixteenth_gate", 0.8, 1100)
pads("data", PROG_MAIN, 0.3, 1600, bright=1.0)
bl = rng.integers(0, len(PENTA), 256)
for i, b in enumerate(bars_in("data")):
    for k in range(16):
        tick(b + k * BEAT / 4, 2500 + 2500 * ((k * 7) % 5) / 4, 0.25, pan=((k % 4) - 1.5) * 0.4)
        if (i * 16 + k) % 5 in (0, 2):
            blip(b + k * BEAT / 4, PENTA[bl[(i * 16 + k) % 256]] + 12, 0.35, pan=math.cos(k) * 0.6)
fills("data", 4, 0.7)
arps("data", PROG_MAIN, 0.25, 4, start_bar=16)
impact(196.0, 1.0); whoosh(195.4, 0.7, 0.8)

# ---- 05 depth: half-time, wide
for i, b in enumerate(bars_in("depth")):
    kick(b, 1.0); kick(b + 2.5 * BEAT, 0.9)
    snare(b + 2 * BEAT, 0.9)
    for q in range(8):
        hat(b + q * BEAT / 2, open_=(q == 7), gain=0.3, pan=0.3 if q % 2 else -0.3)
bass_line("depth", PROG_DEEP, "sustain", 0.8, 500)
pads("depth", PROG_DEEP, 0.6, 1800, bright=1.0)
melody("depth", [(8, 4, 76), (12, 4, 74), (16, 4, 72), (20, 4, 69), (24, 4, 76), (28, 4, 79), (32, 8, 81),
                 (48, 4, 76), (52, 4, 74), (56, 4, 72), (60, 4, 71), (64, 4, 76), (68, 4, 79), (72, 8, 84)], 0.45)
arps("depth", PROG_DEEP, 0.2, 2, start_bar=0, octaves=3)
impact(256.0, 1.1); whoosh(255.3, 0.8, 0.9, down=True)

# ---- 06 systems: everything, fastest arps
four_floor("systems", 1.05, 0.5, 0.9, open_hat=True, rims=True)
bass_line("systems", PROG_MAIN, "eighths", 0.9, 1200)
pads("systems", PROG_MAIN, 0.45, 1600, bright=1.0)
arps("systems", PROG_MAIN, 0.32, 8, start_bar=0, octaves=2)
fills("systems", 4, 0.8)
melody("systems", [(16, 2, 76), (18, 1, 79), (19, 1, 81), (20, 4, 84), (24, 2, 81), (26, 1, 79), (27, 1, 76), (28, 4, 79),
                   (32, 2, 76), (34, 1, 79), (35, 1, 81), (36, 4, 84), (40, 2, 86), (42, 1, 84), (43, 1, 81), (44, 4, 84),
                   (48, 2, 76), (50, 1, 79), (51, 1, 81), (52, 4, 84), (56, 2, 81), (58, 1, 79), (59, 1, 76), (60, 4, 81)], 0.5)
impact(316.0, 1.2); riser(312.0, 4.0, 0.9); whoosh(315.4, 0.7, 0.8)

# ---- outro: breakdown and final hit
riser(372.0, 4.0, 0.8)
impact(376.0, 1.2)
pads("outro", [(A_MIN, 45), (F_MAJ, 41), (C_MAJ, 48), (G_MAJ, 43), (A_MIN, 45), (F_MAJ, 41), (C_MAJ, 48), (C_MAJ, 48),
               (A_MIN, 45), (F_MAJ, 41), (C_MAJ, 48), (G_MAJ, 43), (A_MIN, 45), (F_MAJ, 41), (C_MAJ, 48), (A_MIN, 45)], 0.6, 1800, bright=1.0)
for i, b in enumerate(bars_in("outro")[:12]):
    chord, root = PROG_MAIN[i % 4]
    sub_tone(b, BAR, midi(root - 12), 0.4)
    kick(b, 0.8); kick(b + 2.5 * BEAT, 0.6)
    snare(b + 2 * BEAT, 0.6)
melody("outro", [(4, 4, 76), (8, 2, 74), (10, 2, 72), (12, 4, 69), (20, 4, 72), (24, 2, 74), (26, 2, 76), (28, 8, 81),
                 (40, 4, 79), (44, 4, 76), (48, 8, 81)], 0.5)
impact(400.0, 1.1); whoosh(399.3, 0.8, 0.9, down=True)
# ending: single heartbeat kicks and a last tick, back to a point
for k in range(6):
    kick(404 + k * BEAT * 2, 0.7 - k * 0.08, tone=0.5)
tick(416.0, 2000, 0.7)

# chapter title clicks (one per section start)
for name, (s, e) in SECTIONS.items():
    if name != "intro":
        click(s + 0.0, 0.6); click(s + BEAT / 2, 0.4, pan=0.5)

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

music = delay(buses["music"], BEAT * 0.75, 0.35, 0.22)
music = reverb(music, 0.22)
sfx = reverb(buses["sfx"], 0.15)
drums = buses["drums"] * 1.0
bass = buses["bass"]
mix = drums * 0.95 + bass * 0.75 + music * 0.8 + sfx * 0.8

# sidechain-ish ducking of music/bass on kicks for pump
duck = np.ones(N)
for b in np.arange(0, DUR, BEAT):
    i = int(b * SR); n = int(0.25 * SR)
    seg = np.exp(-np.arange(min(n, N - i)) / SR * 14)
    duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], 1 - 0.45 * seg)
mix = drums * 0.95 + (bass * 0.75 + music * 0.8) * duck[:, None] + sfx * 0.8

mix = highpass(mix, 28, 2)
mix = np.tanh(mix * 0.9) / np.tanh(0.9)

# loudness normalize to -14 LUFS (two passes around soft limiter)
meter = pyln.Meter(SR)
for _ in range(2):
    L = meter.integrated_loudness(mix)
    mix = mix * 10 ** ((-14.0 - L) / 20)
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
L = meter.integrated_loudness(mix)
peak = float(np.max(np.abs(mix)))
# fade in/out edges
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
os.makedirs("audio", exist_ok=True)
sf.write("audio/score.wav", mix.astype(np.float32), SR, subtype="PCM_24")
print(f"loudness {L:.2f} LUFS, peak {20*math.log10(peak):.2f} dBFS")

# ---------------- measured beat grid ----------------
y, sr = librosa.load("audio/score.wav", sr=22050, mono=True)
tempo, frames = librosa.beat.beat_track(y=y, sr=sr, start_bpm=BPM, tightness=400, units="frames")
beats = librosa.frames_to_time(frames, sr=sr).round(4).tolist()
tempo = float(np.atleast_1d(tempo)[0])
# onset strength to find the strongest accents (used for impact pulses)
onset = librosa.onset.onset_strength(y=y, sr=sr)
otimes = librosa.times_like(onset, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=20, post_max=20, pre_avg=50, post_avg=50, delta=np.percentile(onset, 97), wait=40)
accents = otimes[peaks].round(4).tolist()
data = {"bpm": tempo, "nominal_bpm": BPM, "beats": beats, "accents": accents,
        "sections": {k: list(v) for k, v in SECTIONS.items()}, "duration": DUR}
json.dump(data, open("beats.json", "w"))
open("beats.js", "w").write("window.BEATS=" + json.dumps(data) + ";\n")
print(f"measured tempo {tempo:.2f} bpm, {len(beats)} beats, {len(accents)} accents; first beats {beats[:6]}")
