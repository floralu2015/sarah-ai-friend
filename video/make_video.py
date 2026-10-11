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

W, H, FPS = 1920, 1080, 30
CARD_W, CARD_H = 1600, 800
CARD_X, CARD_Y = (W - CARD_W) // 2, 36
ASPECT = CARD_W / CARD_H
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"
FONT_BIG = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"

# ---------------------------------------------------------------------------
# Story: (seconds, camera (cx, cy, width) in poster pixels, caption, flags)
# The camera eases from one shot to the next during the first 1.4s of a shot.
# ---------------------------------------------------------------------------
SHOTS = [
    (5.5, (836, 470, 1672), "Hi Sarah!", {"big": True}),
    (5.0, (836, 300, 1350), "Let's go on a little adventure about screens.", {}),
    (5.0, (300, 300, 700), "Devices can be really helpful...", {}),
    (5.0, (330, 300, 540), "...when we use them wisely! Mr. Brain agrees.", {}),
    (5.0, (840, 300, 700), "Here are some healthy ways to use devices:", {}),
    (5.5, (840, 255, 560), "Learning languages, drawing, and listening to music.", {}),
    (5.5, (840, 405, 560), "Fun videos, calling family, and cozy audiobooks.", {}),
    (5.0, (1395, 300, 700), "Some habits make our eyes tired or our brain feel stuck.", {}),
    (5.5, (1395, 255, 560), "Like screens in the dark, or holding them too close.", {}),
    (5.5, (1395, 410, 560), "Or scrolling and watching \"just one more\" for too long.", {}),
    (5.0, (1395, 410, 560), "That's okay! Everyone learns. You can always reset.", {}),
    (5.0, (315, 680, 780), "Here's how Sarah protects her eyes:", {}),
    (5.5, (315, 600, 620), "Bright room, healthy distance, and lots of blinks!", {}),
    (5.5, (315, 790, 620), "Sit comfy, take breaks, and rest outside.", {}),
    (6.0, (250, 790, 460), "The 20-20-20 trick: every 20 minutes, look 20 feet away for 20 seconds.", {}),
    (8.0, (250, 790, 460), "Let's practice a slow breath together...", {"breathe": True}),
    (5.0, (862, 680, 640), "A balanced day helps you feel your best.", {}),
    (5.5, (862, 600, 520), "Screen time, homework, and reading real books...", {}),
    (5.5, (862, 790, 520), "...plus art, ping pong, playing outside, and good sleep.", {}),
    (6.0, (1230, 680, 800), "Mommy and Daddy love you so much, Sarah.", {}),
    (5.5, (1230, 720, 600), "You can always talk to them about how you feel.", {}),
    (5.0, (1515, 650, 560), "Sarah's Smart Screen Rules:", {}),
    (5.5, (1515, 600, 460), "Learn and create, bright rooms, no screens in bed.", {}),
    (5.5, (1515, 770, 460), "Healthy distance, breaks, other fun, and asking for help.", {}),
    (5.5, (1080, 860, 760), "Healthy choices help your eyes, your brain, and your happiness.", {}),
    (5.0, (1560, 860, 520), "And Mr. Monster's worries? We handle them together.", {}),
    (6.5, (836, 470, 1672), "Sarah, you got this!", {"big": True, "end": True}),
]


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


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
    def __init__(self, n=26, seed=7):
        rnd = random.Random(seed)
        self.items = [
            dict(
                kind=rnd.choice(["heart", "heart", "star", "dot"]),
                x=rnd.uniform(0, W),
                y=rnd.uniform(0, H),
                s=rnd.uniform(10, 26),
                speed=rnd.uniform(12, 34),
                sway=rnd.uniform(10, 40),
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
            x = p["x"] + p["sway"] * math.sin(t * 0.6 + p["phase"])
            a = int(110 + 60 * math.sin(t * 1.3 + p["phase"]))
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


def render(src_path, out_path, audio_path):
    poster = Image.open(src_path).convert("RGB")
    iw, ih = poster.size
    bg = make_background()
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [CARD_X + 6, CARD_Y + 14, CARD_X + CARD_W + 6, CARD_Y + CARD_H + 14], 44, fill=(110, 50, 140, 90)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    frame_mask = rounded_mask((CARD_W + 20, CARD_H + 20), 44)
    card_mask = rounded_mask((CARD_W, CARD_H), 36)
    particles = Particles()

    starts, t = [], 0.0
    for s in SHOTS:
        starts.append(t)
        t += s[0]
    total = t
    nframes = int(total * FPS)

    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", audio_path,
         "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out_path],
        stdin=subprocess.PIPE,
    )
    cap_cache = {}
    for f in range(nframes):
        t = f / FPS
        i = max(k for k in range(len(SHOTS)) if starts[k] <= t)
        dur, cam, text, flags = SHOTS[i]
        tl = t - starts[i]
        prev = SHOTS[i - 1][1] if i > 0 else cam
        k = ease(tl / 1.4)
        cx, cy, cw = (p + (c - p) * k for p, c in zip(prev, cam))
        # slow "breathing" drift so still moments never feel frozen
        cw *= 1 - 0.035 * ease(tl / dur)
        rect = clamp_rect(cx, cy, cw, iw, ih)
        view = poster.transform((CARD_W, CARD_H), Image.EXTENT, rect, Image.BICUBIC)

        img = bg.convert("RGBA")
        particles.draw(img, t)
        img.alpha_composite(shadow)
        img.paste((255, 255, 255), (CARD_X - 10, CARD_Y - 10), frame_mask)
        img.paste(view, (CARD_X, CARD_Y), card_mask)

        if flags.get("breathe"):
            img.alpha_composite(breathe_layer(tl, dur))

        a_in = ease((tl - 0.5) / 0.6)
        a_out = 1 - ease((tl - (dur - 0.45)) / 0.4)
        alpha = max(0.0, min(a_in, a_out))
        if alpha > 0.01:
            q = round(alpha, 2)
            rise = round((1 - a_in) * 30)
            key = (i, q, rise)
            if key not in cap_cache:
                cap_cache.clear()
                cap_cache[key] = caption_layer(text, q, rise, flags.get("big", False))
            img.alpha_composite(cap_cache[key])

        # soft fade from/to white at the very start and end
        edge = min(1.0, t / 1.0, (total - t) / 1.5)
        if edge < 1:
            img = Image.blend(Image.new("RGBA", (W, H), (255, 245, 250, 255)), img, max(edge, 0))

        ff.stdin.write(img.convert("RGB").tobytes())
        if f % 300 == 0:
            print(f"frame {f}/{nframes}", flush=True)
    ff.stdin.close()
    ff.wait()
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
        seg += 0.025 * chime[: len(seg)]
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
    starts, acc = [], 0.0
    for s in SHOTS:
        starts.append(acc)
        acc += s[0]
    audio = out.rsplit(".", 1)[0] + "_music.wav"
    make_music(acc, audio, starts)
    print(f"music ready ({acc:.1f}s)")
    render(src, out, audio)
    print("done:", out)
