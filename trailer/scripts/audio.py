#!/usr/bin/env python3
"""Звук тизера: вальс из игры на музыкальной шкатулке, дождь, гром, часы, машинка, ворон.
Использование: audio.py timeline.json out.wav"""
import json, sys, wave
import numpy as np

SR = 48000
T = json.load(open(sys.argv[1]))
N = int((T['duration'] + 0.5) * SR)
rng = np.random.default_rng(1953)
L = np.zeros(N); Rr = np.zeros(N)       # сухие каналы
REV = np.zeros(N)                         # посыл в реверберацию


def at(t): return int(t * SR)


def add(buf, sig, t, gain=1.0):
    i = at(t)
    if i >= N: return
    j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * gain


def env(n, a, d):  # атака a, экспоненциальный спад d (сек)
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def fft_filter(x, lo=None, hi=None, tilt=0.0):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if tilt: g *= (np.maximum(f, 20) / 1000) ** tilt
    return np.fft.irfft(X * g, len(x))


def mf(m): return 440 * 2 ** ((m - 69) / 12)


# ---------- дождь ----------
rain = fft_filter(rng.standard_normal(N), 700, 7000) * 0.9 + fft_filter(rng.standard_normal(N), None, 220) * 1.6
tt = np.arange(N) / SR
rlev = np.interp(tt, [0, 1.5, 8, 9, 53, 53.6, 59.6, 61, 70, 72.5], [0, .12, .12, .055, .055, .09, .09, .04, .035, 0])
rain *= rlev / np.std(rain)
L += rain; Rr += np.roll(rain, 311)

# ---------- часы ----------
for t in T['ticks']:
    n = int(.05 * SR); click = fft_filter(rng.standard_normal(n), 2000, 9000) * env(n, .001, .008)
    tone = np.sin(2 * np.pi * 1700 * np.arange(n) / SR) * env(n, .001, .01) * .3
    for buf in (L, Rr): add(buf, click + tone, t, .5)
    add(REV, click, t, .3)

# ---------- гром ----------
for t in T['thunder']:
    n = int(4.5 * SR)
    rum = fft_filter(rng.standard_normal(n), None, 140) * env(n, .25, 1.4)
    crack = fft_filter(rng.standard_normal(n), 1500, None) * env(n, .003, .12) * .5
    s = (rum / np.max(np.abs(rum)) * .9 + crack / np.max(np.abs(crack)) * .35)
    add(L, s, t, .9); add(Rr, np.roll(s, 900), t, .9); add(REV, s, t, .4)

# ---------- вспышка фотоаппарата ----------
for t in T['camera']:
    n = int(.9 * SR); k = np.arange(n) / SR
    whine = np.sin(2 * np.pi * np.cumsum(2200 + 5200 * k / .9) / SR) * env(n, .01, .3) * .07
    pop = fft_filter(rng.standard_normal(n), 1200, None) * env(n, .001, .03)
    s = whine + pop / np.max(np.abs(pop)) * .35
    add(L, s, t, .8); add(Rr, s, t, .8); add(REV, s, t, .5)

# ---------- шорох перед вороном ----------
for t in T['whoosh']:
    n = int(1.4 * SR); k = np.arange(n) / SR
    s = fft_filter(rng.standard_normal(n), 300, 2500) * np.sin(np.pi * k / 1.4) ** 2
    s /= np.max(np.abs(s)); add(L, s, t, .35); add(Rr, s, t, .35); add(REV, s, t, .5)

# ---------- карканье ----------
for t in T['caw']:
    for d in (0, .38):
        n = int(.42 * SR); k = np.arange(n) / SR
        fr = 720 * (380 / 720) ** (np.minimum(k, .28) / .28)
        ph = 2 * np.pi * np.cumsum(fr) / SR
        saw = sum(np.sin(h * ph) / h for h in range(1, 14))
        s = fft_filter(saw, 700, 2600) * (1 + .5 * np.sin(2 * np.pi * 48 * k)) * env(n, .02, .22)
        s /= np.max(np.abs(s)); add(L, s, t + d, .5); add(Rr, s, t + d + .004, .45); add(REV, s, t + d, .8)

# ---------- удар под логотип ----------
for t in T['boom']:
    n = int(5 * SR); k = np.arange(n) / SR
    s = np.sin(2 * np.pi * (48 + 20 * np.exp(-k * 6)) * k) * env(n, .005, 1.6)
    s += fft_filter(rng.standard_normal(n), None, 300) * env(n, .005, .5) * .3
    s /= np.max(np.abs(s)); add(L, s, t, .9); add(Rr, s, t, .9); add(REV, s, t, .6)

# ---------- машинка под строки текста ----------
for x in T['texts']:
    if x['style'] not in ('line', 'hand'): continue
    cps = 22 if x['style'] == 'line' else 14
    for i, ch in enumerate(x['text']):
        if ch == ' ': continue
        t = x['a'] + i / cps
        if t > x['b']: break
        n = int(.03 * SR); s = fft_filter(rng.standard_normal(n), 1800, 6000) * env(n, .0005, .006)
        g = (.12 if x['style'] == 'line' else .07) * (.7 + .3 * rng.random())
        add(L, s, t, g); add(Rr, s, t + .0007, g)

# ---------- сердцебиение на монтаже ----------
for t in np.arange(53.6, 59.6, .8):
    for d, g in ((0, 1), (.2, .7)):
        n = int(.35 * SR); k = np.arange(n) / SR
        s = np.sin(2 * np.pi * 52 * k) * env(n, .004, .09) * g
        add(L, s, t + d, .55); add(Rr, s, t + d, .55)

# ---------- вальс («Вальс для Элеоноры», как в игре) ----------
M = T['music']; bt = M['beat']; t0 = M['start']
mel = [[76, 2], [81, 1], [79, 1], [77, 1], [76, 1], [74, 2], [71, 1], [72, 3], [74, 2], [77, 1], [76, 1], [74, 1], [72, 1], [71, 2], [68, 1], [69, 3], [76, 2], [81, 1], [83, 1], [81, 1], [79, 1], [77, 2], [74, 1], [76, 3], [72, 1], [74, 1], [76, 1], [77, 2], [71, 1], [72, 1], [71, 1], [68, 1], [69, 3]]
CH = {'Am': [45, [57, 60, 64]], 'Dm': [50, [57, 62, 65]], 'E': [40, [56, 59, 64]], 'G': [43, [55, 59, 62]], 'C': [48, [55, 60, 64]]}
prog = ['Am', 'Am', 'E', 'Am', 'Dm', 'Am', 'E', 'Am', 'Am', 'G', 'Dm', 'C', 'C', 'Dm', 'E', 'Am']
loopLen = 48 * bt


def box(m, dur=1.8, v=1.0):
    f = mf(m); n = int((dur + .1) * SR); k = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * k) + .3 * np.sin(2 * np.pi * 2 * f * k) * np.exp(-k * 3) + .12 * np.sin(2 * np.pi * 4.02 * f * k) * np.exp(-k * 7))
    return s * env(n, .003, dur * .45) * v


def pad(chord, dur):
    n = int(dur * SR); k = np.arange(n) / SR; s = np.zeros(n)
    for m in chord:
        f = mf(m - 12)
        for det in (-.004, .004):
            ph = 2 * np.pi * f * (1 + det) * k
            s += sum(np.sin(h * ph) / h ** 1.3 for h in range(1, 7))
    s = fft_filter(s, None, 1400)
    a = np.minimum(1, k / .5) * np.minimum(1, (dur - k) / .4)
    return s / max(1e-9, np.max(np.abs(s))) * a


mus = np.zeros(N)
for loop in range(M['loops']):
    base = t0 + loop * loopLen
    t = base
    for m, b in mel:
        add(mus, box(m, 1.8, 1), t); t += b * bt
    for i, ch in enumerate(prog):
        bass, tri = CH[ch]; tb = base + i * 3 * bt
        add(mus, box(bass + 12, 2.4, .7), tb)
        for n_ in tri:
            add(mus, box(n_, .9, .32), tb + bt); add(mus, box(n_, .9, .28), tb + 2 * bt)
        if loop >= 1: add(mus, pad(tri, 3 * bt + .3), tb, .06 if loop == 1 else .1)
        if loop == 2:
            n = int(1.2 * SR); k = np.arange(n) / SR
            add(mus, np.sin(2 * np.pi * mf(bass) * k) * env(n, .01, .5), tb, .35)
end = t0 + M['loops'] * loopLen
for m in (45, 57, 64, 69, 72):
    add(mus, box(m, 4.0, .6), end)
duck = np.interp(tt, [0, 59.4, 59.8, 61.0, 61.4, 99], [1, 1, .22, .22, 1, 1])
mus *= duck * np.interp(tt, [0, end + 3, end + 4.5], [1, 1, 0])
mus /= np.max(np.abs(mus))
L += mus * .5; Rr += mus * .5; REV += mus * .55

# ---------- реверберация ----------
irn = int(2.6 * SR); k = np.arange(irn) / SR
for ch_i, buf in enumerate((L, Rr)):
    ir = rng.standard_normal(irn) * np.exp(-k / .55)
    ir = fft_filter(ir, 150, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(N + irn)))
    wet = np.fft.irfft(np.fft.rfft(REV, size) * np.fft.rfft(ir, size), size)[:N]
    buf += wet * .32

# ---------- мастер ----------
st = np.stack([L, Rr], 1)
st = np.tanh(st * 1.2) / np.tanh(1.2)
st *= .89 / np.max(np.abs(st))
fade = np.interp(tt, [0, .05, T['duration'] - .2, T['duration'] + .3], [0, 1, 1, 0])
st *= fade[:, None]
pcm = (st * 32767).astype('<i2')
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('звук готов:', sys.argv[2])
