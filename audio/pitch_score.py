"""CashWise pitch: synthesized score + UI clicks on the beat + voiceover mix.

  python3 audio/pitch_score.py
Outputs pitch/score.wav (music only), pitch/mix.wav (music + voice, -14 LUFS),
pitch/beats.json and pitch/beats.js (measured beat grid), using audio/vo.json if present.
"""
import json, math, os, sys
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
import synth as S
from synth import (kick, sub_tone, snare, clap, hat, rim, tick, bass_note, pad_chord, pluck, lead, arp_note,
                   riser, impact, whoosh, click, blip, midi, BEAT, BAR, SR, PROG_MAIN, PROG_DEEP, PENTA,
                   A_MIN, F_MAJ, C_MAJ, G_MAJ, E_MIN, D_MIN)

TL = json.load(open("pitch/timeline.json"))
SEC = {k: tuple(v) for k, v in TL["sections"].items()}
DUR = TL["duration"]
S.init(DUR, SEC)
rng = np.random.default_rng(11)
def bars(sec): s, e = SEC[sec]; return [s + k * BAR for k in range(int(round((e - s) / BAR)))]

# ---- patterns (quieter than the showreel: this bed sits under a voice) ----
def groove(sec, kick_g=0.8, hat_g=0.3, clap_g=0.5, open_hat=True, rims=False, half=False):
    for b in bars(sec):
        if half:
            kick(b, kick_g); kick(b + 2.5 * BEAT, kick_g * 0.8); snare(b + 2 * BEAT, clap_g)
            for q in range(8): hat(b + q * BEAT / 2, open_=(q == 7 and open_hat), gain=hat_g * 0.8, pan=0.3 if q % 2 else -0.3)
            continue
        for q in range(4):
            kick(b + q * BEAT, kick_g)
            if q in (1, 3) and clap_g: clap(b + q * BEAT, clap_g)
            hat(b + q * BEAT + BEAT / 2, open_=open_hat and q == 3, gain=hat_g, pan=0.25)
            hat(b + q * BEAT, gain=hat_g * 0.5, pan=-0.25)
            if rims and q in (0, 2): rim(b + q * BEAT + BEAT * 0.75, 0.4, pan=0.4)
def bassline(sec, prog, pattern, gain=0.7, cutoff=800):
    for i, b in enumerate(bars(sec)):
        chord, root = prog[i % len(prog)]
        if pattern == "eighths":
            for e in range(8): bass_note(b + e * BEAT / 2, BEAT / 2, root if e % 4 != 3 else root + 12, gain, cutoff, stacc=True)
        elif pattern == "offbeat":
            for e in range(4): bass_note(b + e * BEAT + BEAT / 2, BEAT / 2, root, gain, cutoff, stacc=True)
        elif pattern == "sustain":
            bass_note(b, BAR, root, gain, cutoff); sub_tone(b, BAR, midi(root - 12), 0.35)
        elif pattern == "gate":
            for e in range(16):
                if e % 4 in (0, 2, 3): bass_note(b + e * BEAT / 4, BEAT / 4, root + (12 if e % 8 == 6 else 0), gain * 0.9, cutoff, stacc=True)
def pads(sec, prog, gain=0.4, cutoff=1400, bright=0.0, per_bar=1):
    bs = bars(sec)
    for i in range(0, len(bs), per_bar):
        chord, root = prog[(i // per_bar) % len(prog)]
        pad_chord(bs[i], BAR * per_bar + 0.3, [n + 12 for n in chord] + [chord[0]], gain, cutoff, bright)
def arps(sec, prog, gain=0.25, rate=4, octaves=2, start_bar=0):
    for i, b in enumerate(bars(sec)[start_bar:], start_bar):
        chord, root = prog[i % len(prog)]
        notes = [n + 12 * (o + 1) for o in range(octaves) for n in chord]
        for k in range(4 * rate):
            nt = notes[k % len(notes)] if (k // len(notes)) % 2 == 0 else notes[len(notes) - 1 - k % len(notes)]
            arp_note(b + k * BEAT / rate, nt, gain, pan=math.sin(k * 0.9) * 0.6)
def melody(sec, phrases, gain=0.4):
    s0 = SEC[sec][0]; prev = None
    for off, dur, nt in phrases:
        lead(s0 + off * BEAT, dur * BEAT, nt, gain, glide_from=prev); prev = nt
def fills(sec, every=8, gain=0.5):
    for i, b in enumerate(bars(sec)):
        if (i + 1) % every == 0:
            for k in range(8): snare(b + 2 * BEAT + k * BEAT / 4, gain * (0.4 + 0.6 * k / 8))

# ---- arrangement ----
# open 0–12: heartbeat ping, FRIDAY/PAYDAY stamps, riser into the problem
for k, b in enumerate(np.arange(0, 12, BEAT)): kick(b, 0.5 + 0.4 * k / 24, tone=0.6)
sub_tone(0, 12, midi(33), 0.3)
for b in np.arange(6, 12, BEAT / 2): hat(b, gain=0.22)
riser(8.0, 4.0, 0.7); whoosh(11.4, 0.7, 0.7)

# problem 12–62: light, slightly uneasy (minor pads, offbeat bass, rims)
impact(12.0, 0.9)
groove("problem", 0.7, 0.25, 0.0, open_hat=False, rims=True)
bassline("problem", PROG_DEEP, "offbeat", 0.6, 650)
pads("problem", PROG_DEEP, 0.38, 1000, per_bar=2)
seq = rng.integers(0, len(PENTA), 64)
for i, b in enumerate(bars("problem")):
    for k in range(8):
        if (i * 8 + k) % 3 == 0 or i < 2: continue
        pluck(b + k * BEAT / 2, PENTA[seq[(i * 8 + k) % 64]], 0.22, 0.5, pan=math.sin(k) * 0.6)
# the balance drops (40–46): tense ticks
for b in np.arange(40, 46, BEAT / 4): tick(b, 2600, 0.22, pan=((int(b * 4) % 4) - 1.5) * 0.4)
riser(58.0, 4.0, 0.7); whoosh(61.4, 0.7, 0.7)

# impact 62–122: deep, sparse, half-time; builds to the "opportunity"
impact(62.0, 1.0)
groove("impact", 0.85, 0.22, 0.6, half=True)
bassline("impact", PROG_DEEP, "sustain", 0.7, 500)
pads("impact", PROG_DEEP, 0.5, 1500, bright=0.6)
arps("impact", PROG_DEEP, 0.16, 2, octaves=3, start_bar=8)
melody("impact", [(48, 4, 76), (52, 4, 74), (56, 4, 72), (60, 4, 69), (64, 4, 72), (68, 4, 74), (72, 4, 76), (76, 4, 79), (96, 4, 81), (100, 4, 79), (104, 4, 76), (108, 8, 72)], 0.32)
riser(118.0, 4.0, 0.8); whoosh(121.4, 0.7, 0.7)

# solution 122–202: brighter, confident four-on-the-floor, major-feel progression
impact(122.0, 1.1)
PROG_UP = [(C_MAJ, 48), (G_MAJ, 43), (A_MIN, 45), (F_MAJ, 41)]
groove("solution", 0.85, 0.35, 0.6, open_hat=True)
bassline("solution", PROG_UP, "eighths", 0.7, 900)
pads("solution", PROG_UP, 0.38, 1300, bright=0.5)
arps("solution", PROG_UP, 0.2, 4, octaves=2, start_bar=4)
fills("solution", 8, 0.45)
melody("solution", [(8, 2, 79), (10, 1, 81), (11, 1, 84), (12, 4, 83), (24, 2, 79), (26, 1, 81), (27, 1, 84), (28, 4, 86), (64, 2, 84), (66, 1, 83), (67, 1, 81), (68, 4, 79), (80, 2, 84), (82, 1, 86), (83, 1, 88), (84, 4, 86), (120, 2, 79), (122, 1, 81), (123, 1, 84), (124, 4, 83)], 0.34)
riser(198.0, 4.0, 0.7); whoosh(201.4, 0.7, 0.7)

# how 202–242: techy, clean ticks and blips, minimal
impact(202.0, 0.9)
groove("how", 0.75, 0.3, 0.45, open_hat=False)
bassline("how", PROG_UP, "gate", 0.6, 1000)
pads("how", PROG_UP, 0.25, 1600, bright=1.0)
bl = rng.integers(0, len(PENTA), 256)
for i, b in enumerate(bars("how")):
    for k in range(16):
        tick(b + k * BEAT / 4, 2500 + 2500 * ((k * 7) % 5) / 4, 0.16, pan=((k % 4) - 1.5) * 0.4)
        if (i * 16 + k) % 5 in (0, 2): blip(b + k * BEAT / 4, PENTA[bl[(i * 16 + k) % 256]] + 12, 0.22, pan=math.cos(k) * 0.6)
riser(238.0, 4.0, 0.7); whoosh(241.4, 0.7, 0.7)

# business 242–302: confident groove, pads, arps
impact(242.0, 1.0)
groove("business", 0.85, 0.35, 0.6, open_hat=True, rims=True)
bassline("business", PROG_UP, "eighths", 0.7, 1000)
pads("business", PROG_UP, 0.4, 1400, bright=0.6)
arps("business", PROG_UP, 0.22, 4, octaves=2, start_bar=0)
fills("business", 8, 0.45)
riser(298.0, 4.0, 0.7); whoosh(301.4, 0.7, 0.7)

# fit 302–332: warm pads, half-time
impact(302.0, 0.9)
groove("fit", 0.8, 0.25, 0.5, half=True)
bassline("fit", PROG_UP, "sustain", 0.65, 600)
pads("fit", PROG_UP, 0.5, 1700, bright=1.0)
arps("fit", PROG_UP, 0.18, 2, octaves=3)
whoosh(331.4, 0.7, 0.7)

# roadmap 332–362: building, driving
impact(332.0, 1.0)
groove("roadmap", 0.9, 0.4, 0.7, open_hat=True)
bassline("roadmap", PROG_UP, "eighths", 0.75, 1100)
pads("roadmap", PROG_UP, 0.4, 1500, bright=0.8)
arps("roadmap", PROG_UP, 0.26, 8, octaves=2)
fills("roadmap", 4, 0.5)
riser(358.0, 4.0, 0.9); whoosh(361.4, 0.7, 0.8)

# close 362–380: big chords, melody, final hit, heartbeat out
impact(362.0, 1.2)
pads("close", [(C_MAJ, 48), (G_MAJ, 43), (A_MIN, 45), (F_MAJ, 41), (C_MAJ, 48), (G_MAJ, 43), (C_MAJ, 48), (C_MAJ, 48), (C_MAJ, 48)], 0.55, 1800, bright=1.0)
for i, b in enumerate(bars("close")[:5]):
    chord, root = PROG_UP[i % 4]; sub_tone(b, BAR, midi(root - 12), 0.4); kick(b, 0.8); kick(b + 2.5 * BEAT, 0.6); snare(b + 2 * BEAT, 0.55)
melody("close", [(0, 2, 84), (2, 1, 83), (3, 1, 81), (4, 4, 79), (8, 2, 84), (10, 1, 86), (11, 1, 88), (12, 8, 91)], 0.4)
impact(372.0, 1.1); whoosh(371.3, 0.8, 0.8, down=True)
for k in range(5): kick(373 + k * BEAT * 2, 0.7 - k * 0.1, tone=0.5)
tick(379.0, 2000, 0.6)

# UI clicks on the beat grid: one per on-screen UI event (times from the scenes, quantized to 8ths)
UI_CLICKS = [1.2, 3.0, 6.6, 8.5, 10.0, 18.0, 22.0, 29.0, 30.0, 37.0, 41.0, 41.8, 42.6, 43.4, 44.2, 47.0, 48.5, 50.0, 53.0, 54.5, 56.0,
             69.0, 70.5, 78.0, 80.5, 92.0, 95.2, 98.4, 101.6, 105.0, 112.5, 113.5, 114.5, 117.0,
             126.0, 128.0, 128.25, 128.5, 128.75, 129.0, 129.25, 132.0, 138.0, 142.2, 146.4, 150.6, 157.0, 161.5, 162.0, 168.0, 171.0, 177.5, 178.0, 188.0, 192.0, 196.0, 198.0,
             206.0, 207.2, 210.0, 214.0, 215.5, 219.0, 220.5, 224.0, 229.0,
             250.0, 250.3, 250.7, 253.0, 253.3, 253.7, 254.0, 262.5, 263.0, 263.5, 264.0, 264.5, 266.0, 269.0, 269.4, 269.8, 277.0, 279.2, 281.4, 283.6, 285.8, 289.2, 289.7, 290.2,
             306.0, 311.0, 316.0, 321.0, 336.0, 340.0, 344.0, 348.0, 352.0,
             362.2, 365.0, 366.0, 366.8, 367.6, 372.0, 373.5, 375.0]
for i, c in enumerate(UI_CLICKS):
    q = round(c * 4) / 4   # quantize to 16ths of the 120 bpm grid
    click(q, 0.55, pan=(i % 3 - 1) * 0.35); tick(q, 5200 if i % 2 else 4200, 0.28, pan=(i % 3 - 1) * 0.35)

# ---- voiceover ----
vo = None
if os.path.exists("audio/vo.json"):
    meta = json.load(open("audio/vo.json"))
    vo = np.zeros((S.N, 2))
    for l in meta["lines"]:
        d, sr = sf.read(f"audio/vo/{l['id']}.wav"); assert sr == SR
        i = int(l["t"] * SR); n = min(len(d), S.N - i)
        vo[i:i + n, 0] += d[:n]; vo[i:i + n, 1] += d[:n]
    # presence: gentle high-shelf-ish via highpass blend, and -3 dB headroom on peaks
    vo = vo * 0.85 + S.highpass(vo, 1800, 1) * 0.25
    vo = vo / (np.max(np.abs(vo)) + 1e-6) * 0.8
    print("voiceover engine:", meta["engine"])

os.makedirs("pitch", exist_ok=True)
music, L0, p0 = S.master(None)
sf.write("pitch/score.wav", music, SR, subtype="PCM_24")
print(f"music bed: {L0:.2f} LUFS, peak {20*math.log10(p0):.2f} dBFS")
if vo is not None:
    mix, L1, p1 = S.master(vo, vo_gain=1.0, duck_db=-10.0)
    sf.write("pitch/mix.wav", mix, SR, subtype="PCM_24")
    print(f"full mix: {L1:.2f} LUFS, peak {20*math.log10(p1):.2f} dBFS")
tempo, nb, first = S.measure_beats("pitch/score.wav", "pitch/beats.json", "pitch/beats.js", SEC, DUR)
print(f"measured {tempo:.2f} bpm, {nb} beats, first {first}")
