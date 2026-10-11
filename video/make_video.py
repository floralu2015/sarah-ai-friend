"""Render "How Sarah Uses Devices in a Healthy Way" as a gentle animated video.

The camera glides across the poster panel by panel, with friendly captions and
soft, original music-box style background music generated here.

Usage:  python3 make_video.py <poster image> <output.mp4>
Needs:  Pillow, numpy, ffmpeg on PATH.
"""
import math
import random
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 60
CRF = 19
CARD_W, CARD_H = 1600, 800
CARD_X, CARD_Y = (W - CARD_W) // 2, 36
ASPECT = CARD_W / CARD_H
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
FONT_BIG = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"

# ---------------------------------------------------------------------------
# Story: (seconds, section, camera (cx, cy, width) in poster pixels, caption, flags)
# Inside a section the camera glides slowly between shots; when the section
# changes, the picture softly dissolves instead of panning across the poster.
# ---------------------------------------------------------------------------
SHOTS = [
    (6.5, "intro", (836, 470, 1672), "Hi Sarah!", {"big": True}),
    (6.0, "intro", (836, 380, 1400), "Let's go on a little adventure about screens.", {}),
    (6.0, "s1", (290, 300, 700), "Devices can be really helpful...", {}),
    (6.0, "s1", (320, 300, 600), "...when we use them wisely! Mr. Brain agrees.", {}),
    (6.0, "s2", (840, 300, 720), "Here are some healthy ways to use devices:", {}),
    (6.5, "s2", (840, 255, 580), "Learning languages, drawing, and listening to music.", {}),
    (6.5, "s2", (840, 400, 580), "Fun videos, calling family, and cozy audiobooks.", {}),
    (6.0, "s3", (1395, 300, 720), "Some habits make our eyes tired or our brain feel stuck.", {}),
    (6.5, "s3", (1395, 255, 580), "Like screens in the dark, or holding them too close.", {}),
    (6.5, "s3", (1395, 405, 580), "Or scrolling and watching \"just one more\" for too long.", {}),
    (6.0, "s3", (1395, 380, 640), "That's okay! Everyone learns. You can always reset.", {}),
    (6.0, "s4", (315, 680, 780), "Here's how Sarah protects her eyes:", {}),
    (6.5, "s4", (315, 610, 640), "Bright room, healthy distance, and lots of blinks!", {}),
    (6.5, "s4", (315, 780, 640), "Sit comfy, take breaks, and rest outside.", {}),
    (7.0, "s4", (270, 785, 560), "The 20-20-20 trick: every 20 minutes, look 20 feet away for 20 seconds.", {}),
    (9.0, "s4", (270, 785, 560), "Let's practice a slow breath together...", {"breathe": True}),
    (6.0, "s5", (862, 680, 700), "A balanced day helps you feel your best.", {}),
    (6.5, "s5", (862, 610, 580), "Screen time, homework, and reading real books...", {}),
    (6.5, "s5", (862, 780, 580), "...plus art, ping pong, playing outside, and good sleep.", {}),
    (6.5, "s6", (1230, 680, 800), "Mommy and Daddy love you so much, Sarah.", {}),
    (6.0, "s6", (1230, 710, 640), "You can always talk to them about how you feel.", {}),
    (6.0, "s7", (1515, 670, 640), "Sarah's Smart Screen Rules:", {}),
    (6.5, "s7", (1515, 620, 560), "Learn and create, bright rooms, no screens in bed.", {}),
    (6.5, "s7", (1515, 760, 560), "Healthy distance, breaks, other fun, and asking for help.", {}),
    (6.5, "end", (1080, 850, 800), "Healthy choices help your eyes, your brain, and your happiness.", {}),
    (6.0, "end", (1500, 850, 640), "And Mr. Monster's worries? We handle them together.", {}),
    (8.0, "final", (836, 470, 1672), "Sarah, you got this!", {"big": True, "end": True}),
]

GLIDE = 3.2      # seconds for a slow camera glide inside a section
DISSOLVE = 2.2   # seconds for a soft cross-dissolve between sections
UPSCALE = 2      # pre-upscale the poster once for crisper zooms


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


def soft(t):
    """Gentler than smoothstep: cosine ease with very slow start and stop."""
    t = min(max(t, 0.0), 1.0)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def clamp_rect(cx, cy, w, iw, ih):
    w = min(w, iw)
    h = w / ASPECT
    if h > ih:
        h = ih
        w = h * ASPECT
    x0 = min(max(cx - w / 2, 0), iw - w)
    y0 = min(max(cy - h / 2, 0), ih - h)
    return x0, y0, x0 + w, y0 + h


def rounded_mask(size, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], r, fill=255)
    return m


def heart(draw, x, y, s, fill):
    pts = []
    for i in range(40):
        t = i / 40 * 2 * math.pi
        hx = 16 * math.sin(t) ** 3
        hy = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x + hx * s / 16, y - hy * s / 16))
    draw.polygon(pts, fill=fill)


def star(draw, x, y, s, fill):
    pts = []
    for i in range(10):
        r = s if i % 2 == 0 else s * 0.45
        a = -math.pi / 2 + i * math.pi / 5
        pts.append((x + r * math.cos(a), y + r * math.sin(a)))
    draw.polygon(pts, fill=fill)


def make_background():
    y = np.linspace(0, 1, H)[:, None]
    x = np.linspace(0, 1, W)[None, :]
    top = np.array([255, 228, 240])
    bot = np.array([226, 214, 255])
    mix = (y * 0.75 + x * 0.25)[..., None]
    arr = top * (1 - mix) + bot * mix
    return Image.fromarray(arr.astype(np.uint8), "RGB")


class Particles:
    def __init__(self, n=20, seed=7):
        rnd = random.Random(seed)
        self.items = [
            dict(
                kind=rnd.choice(["heart", "heart", "star", "dot"]),
                x=rnd.uniform(0, W),
                y=rnd.uniform(0, H),
                s=rnd.uniform(10, 26),
                speed=rnd.uniform(8, 20),
                sway=rnd.uniform(10, 30),
                phase=rnd.uniform(0, 6.28),
                color=rnd.choice([(255, 120, 170), (190, 140, 255), (255, 200, 90), (140, 200, 255)]),
            )
            for _ in range(n)
        ]

    def draw(self, img, t):
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        for p in self.items:
            y = (p["y"] - p["speed"] * t) % (H + 80) - 40
            x = p["x"] + p["sway"] * math.sin(t * 0.35 + p["phase"])
            a = int(90 + 35 * math.sin(t * 0.5 + p["phase"]))
            c = p["color"] + (a,)
            if p["kind"] == "heart":
                heart(d, x, y, p["s"], c)
            elif p["kind"] == "star":
                star(d, x, y, p["s"], c)
            else:
                d.ellipse([x - p["s"] / 2, y - p["s"] / 2, x + p["s"] / 2, y + p["s"] / 2], fill=c)
        img.alpha_composite(layer)


def wrap(text, font, maxw, draw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= maxw:
            cur = test
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def caption_layer(text, alpha, rise, big):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    font = ImageFont.truetype(FONT_BIG if big else FONT, 64 if big else 48)
    lines = wrap(text, font, 1500, d)
    lh = font.size * 1.22
    tw = max(d.textlength(l, font=font) for l in lines)
    bw, bh = tw + 160, lh * len(lines) + 44
    cx, cy = W / 2, CARD_Y + CARD_H + (H - CARD_Y - CARD_H) / 2 + rise
    box = [cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2]
    d.rounded_rectangle([box[0] + 4, box[1] + 8, box[2] + 4, box[3] + 8], 40, fill=(120, 60, 140, 60))
    d.rounded_rectangle(box, 40, fill=(255, 255, 255, 240), outline=(255, 120, 175, 255), width=5)
    heart(d, box[0] + 42, cy + 2, 13, (255, 105, 160, 255))
    heart(d, box[2] - 42, cy + 2, 13, (175, 120, 255, 255))
    for i, l in enumerate(lines):
        y = cy - lh * len(lines) / 2 + i * lh + (lh - font.size) / 2 - 4
        d.text((cx, y), l, font=font, fill=(90, 40, 130, 255), anchor="mt")
    if alpha < 1:
        a = layer.getchannel("A").point(lambda v: int(v * alpha))
        layer.putalpha(a)
    return layer


def breathe_layer(t_local, dur):
    """A soft circle that grows (breathe in) and shrinks (breathe out)."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cycle = 4.0
    ph = (t_local % cycle) / cycle
    grow = 0.5 - 0.5 * math.cos(ph * 2 * math.pi)
    fade = min(1.0, t_local / 0.8, (dur - t_local) / 0.8)
    d.rectangle([CARD_X, CARD_Y, CARD_X + CARD_W, CARD_Y + CARD_H], fill=(255, 255, 255, int(110 * fade)))
    r = 170 + 120 * grow
    cx, cy = CARD_X + CARD_W - 400, CARD_Y + CARD_H / 2
    for k, al in ((1.3, 60), (1.15, 100), (1.0, 230)):
        rr = r * k
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(160, 110, 240, int(al * fade)))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255, int(255 * fade)), width=6)
    font = ImageFont.truetype(FONT_BIG, 50)
    word = "breathe in" if ph < 0.5 else "breathe out"
    d.text((cx, cy), word, font=font, fill=(255, 255, 255, int(255 * fade)), anchor="mm")
    return layer


def timeline():
    starts, t = [], 0.0
    for s in SHOTS:
        starts.append(t)
        t += s[0]
    return starts, t


def drift(t):
    """A tiny, continuous floating motion so the picture never feels frozen."""
    return (6 * math.sin(2 * math.pi * t / 31), 4 * math.sin(2 * math.pi * t / 37),
            1 - 0.02 * (0.5 - 0.5 * math.cos(2 * math.pi * t / 23)))


class Renderer:
    def __init__(self, src_path):
        poster = Image.open(src_path).convert("RGB")
        self.iw, self.ih = poster.size
        big = poster.resize((self.iw * UPSCALE, self.ih * UPSCALE), Image.LANCZOS)
        self.poster = big.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
        self.bg = make_background()
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle(
            [CARD_X + 6, CARD_Y + 14, CARD_X + CARD_W + 6, CARD_Y + CARD_H + 14], 44, fill=(110, 50, 140, 90)
        )
        self.shadow = shadow.filter(ImageFilter.GaussianBlur(16))
        self.frame_mask = rounded_mask((CARD_W + 20, CARD_H + 20), 44)
        self.card_mask = rounded_mask((CARD_W, CARD_H), 36)
        self.particles = Particles()
        self.starts, self.total = timeline()
        self.cap_cache = {}

    def view(self, cam, t):
        dx, dy, dz = drift(t)
        cx, cy, cw = cam
        x0, y0, x1, y1 = clamp_rect(cx + dx, cy + dy, cw * dz, self.iw, self.ih)
        rect = tuple(v * UPSCALE for v in (x0, y0, x1, y1))
        return self.poster.transform((CARD_W, CARD_H), Image.EXTENT, rect, Image.BICUBIC)

    def card(self, i, tl, t):
        dur, sec, cam, text, flags = SHOTS[i]
        if i == 0:
            return self.view(cam, t)
        prev = SHOTS[i - 1]
        if prev[1] != sec:
            new = self.view(cam, t)
            k = soft(tl / DISSOLVE)
            if k >= 1:
                return new
            return Image.blend(self.view(prev[2], t), new, k)
        k = soft(tl / GLIDE)
        return self.view(tuple(p + (c - p) * k for p, c in zip(prev[2], cam)), t)

    def frame(self, f):
        t = f / FPS
        i = max(k for k in range(len(SHOTS)) if self.starts[k] <= t)
        dur, sec, cam, text, flags = SHOTS[i]
        tl = t - self.starts[i]

        img = self.bg.convert("RGBA")
        self.particles.draw(img, t)
        img.alpha_composite(self.shadow)
        img.paste((255, 255, 255), (CARD_X - 10, CARD_Y - 10), self.frame_mask)
        img.paste(self.card(i, tl, t), (CARD_X, CARD_Y), self.card_mask)

        if flags.get("breathe"):
            img.alpha_composite(breathe_layer(tl, dur))

        a_in = soft((tl - 0.4) / 0.9)
        a_out = 1 - soft((tl - (dur - 0.7)) / 0.65)
        alpha = max(0.0, min(a_in, a_out))
        if alpha > 0.01:
            q = round(alpha, 2)
            rise = round((1 - a_in) * 18)
            key = (i, q, rise)
            if key not in self.cap_cache:
                if len(self.cap_cache) > 200:
                    self.cap_cache.clear()
                self.cap_cache[key] = caption_layer(text, q, rise, flags.get("big", False))
            img.alpha_composite(self.cap_cache[key])

        # soft fade from/to white at the very start and end
        edge = soft(min(1.0, t / 1.5, (self.total - t) / 2.5))
        if edge < 1:
            img = Image.blend(Image.new("RGBA", (W, H), (255, 245, 250, 255)), img, edge)
        return img.convert("RGB")


def render_chunk(job):
    src_path, f0, f1, path = job
    r = Renderer(src_path)
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", "-pix_fmt", "yuv420p", path],
        stdin=subprocess.PIPE,
    )
    for f in range(f0, f1):
        ff.stdin.write(r.frame(f).tobytes())
        if f % 600 == 0:
            print(f"frame {f}", flush=True)
    ff.stdin.close()
    ff.wait()
    return path


def render(src_path, out_path, audio_path, workers=4):
    import multiprocessing as mp
    import os
    import tempfile

    _, total = timeline()
    nframes = int(total * FPS)
    tmp = tempfile.mkdtemp(prefix="sarah_")
    step = math.ceil(nframes / workers)
    jobs = [(src_path, a, min(a + step, nframes), os.path.join(tmp, f"part{n}.mp4"))
            for n, a in enumerate(range(0, nframes, step))]
    with mp.Pool(workers) as pool:
        parts = pool.map(render_chunk, jobs)
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as fh:
        fh.writelines(f"file '{p}'\n" for p in parts)
    # final encode: high quality, tuned for flat cartoon art
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", audio_path,
         "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", str(CRF),
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-shortest",
         "-movflags", "+faststart", out_path],
        check=True,
    )
    return total


# ---------------------------------------------------------------------------
# Music: a slow, warm music-box lullaby (original, generated from scratch).
# ---------------------------------------------------------------------------
SR = 44100


def note_freq(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def make_music(seconds, path, shot_starts):
    rnd = random.Random(3)
    n = int(seconds * SR) + SR
    out = np.zeros(n)
    bpm = 72
    beat = 60 / bpm
    # I - vi - IV - V in C major, two bars each... gentle and familiar
    chords = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]]
    scale = [60, 62, 64, 67, 69, 72, 74, 76, 79]  # pentatonic, can't sound wrong
    bar = beat * 4
    t = 0.0
    ci = 0
    while t < seconds:
        chord = chords[ci % 4]
        # pad
        L = int(bar * 2 * SR)
        tt = np.arange(L) / SR
        env = np.minimum(1, tt / 1.2) * np.minimum(1, (bar * 2 - tt) / 1.0).clip(0)
        pad = sum(np.sin(2 * np.pi * note_freq(m) * tt + 0.3 * np.sin(2 * np.pi * 0.2 * tt)) for m in chord)
        s = int(t * SR)
        seg = out[s:s + L]
        seg += 0.035 * (pad * env)[: len(seg)]
        # music box: arpeggio of chord tones + pentatonic sparkles on 8th notes
        for b in range(16):
            if rnd.random() < 0.72:
                if b % 4 == 0:
                    m = chord[2] + 12
                else:
                    m = rnd.choice(scale) + (12 if rnd.random() < 0.3 else 0)
                st = int((t + b * beat / 2) * SR)
                ln = int(2.2 * SR)
                tn = np.arange(ln) / SR
                f0 = note_freq(m)
                tone = (np.sin(2 * np.pi * f0 * tn) + 0.3 * np.sin(2 * np.pi * 2 * f0 * tn)
                        + 0.08 * np.sin(2 * np.pi * 3.01 * f0 * tn)) * np.exp(-tn * 2.6)
                tone *= np.minimum(1, tn / 0.004)
                vel = 0.10 if b % 4 == 0 else 0.065
                seg2 = out[st:st + ln]
                seg2 += vel * tone[: len(seg2)]
        t += bar * 2
        ci += 1
    # soft chime when each new section starts
    for st_t in shot_starts[1:]:
        st = int(st_t * SR)
        ln = int(2.5 * SR)
        tn = np.arange(ln) / SR
        chime = sum(np.sin(2 * np.pi * note_freq(m) * tn) for m in (84, 88, 91)) * np.exp(-tn * 2.0)
        seg = out[st:st + ln]
        seg += 0.015 * chime[: len(seg)]
    # simple reverb (feedback delays) for a dreamy, relaxing feel
    wet = out.copy()
    for d, g in ((0.037, 0.5), (0.053, 0.45), (0.071, 0.4), (0.113, 0.35)):
        ds = int(d * SR)
        buf = np.zeros_like(out)
        for rep in range(1, 8):
            off = ds * rep
            if off >= n:
                break
            buf[off:] += out[:-off] * (g ** rep)
        wet += buf * 0.35
    out = wet
    fade_in, fade_out = int(1.5 * SR), int(4 * SR)
    total = int(seconds * SR)
    out = out[:total]
    out[:fade_in] *= np.linspace(0, 1, fade_in)
    out[-fade_out:] *= np.linspace(1, 0, fade_out)
    out = out / (np.abs(out).max() + 1e-9) * 0.6
    pcm = (out * 32767).astype(np.int16)
    stereo = np.stack([pcm, pcm], axis=1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    starts, acc = timeline()
    audio = out.rsplit(".", 1)[0] + "_music.wav"
    section_starts = [st for k, st in enumerate(starts) if k and SHOTS[k][1] != SHOTS[k - 1][1]]
    make_music(acc, audio, [0.0] + section_starts)
    print(f"music ready ({acc:.1f}s)")
    render(src, out, audio)
    print("done:", out)
