"""Draw the home-screen icons with the standard library only (no Pillow needed).

Run from the project folder:  python tools/make-icons.py
Writes icons/icon-192.png, icons/icon-512.png and icons/apple-touch-icon.png (180 px).
The design matches icons/icon.svg: a tick inside a 3/4 progress ring on the header teal.
Everything sits inside the central 80% so Android can crop it to a circle (maskable).
"""
import math
import os
import struct
import zlib

BG = (0x0E, 0x5C, 0x57)
WHITE = (255, 255, 255)
# Shapes in a 512-unit square.
C, R, RING_W = (256.0, 256.0), 150.0, 26.0
SWEEP = 270.0  # degrees, clockwise from 12 o'clock
TICK = [(194.0, 262.0), (238.0, 306.0), (322.0, 212.0)]
TICK_W = 30.0


def seg_dist(p, a, b):
    ax, ay = a
    bx, by = b
    px, py = p
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def arc_end(deg):
    a = math.radians(deg - 90)
    return (C[0] + R * math.cos(a), C[1] + R * math.sin(a))


ENDS = [arc_end(0), arc_end(SWEEP)]


def sdfs(x, y):
    d_c = math.hypot(x - C[0], y - C[1])
    ring = abs(d_c - R) - RING_W / 2
    ang = (math.degrees(math.atan2(y - C[1], x - C[0])) + 90) % 360
    arc = ring if ang <= SWEEP else min(math.hypot(x - e[0], y - e[1]) for e in ENDS) - RING_W / 2
    tick = min(seg_dist((x, y), TICK[i], TICK[i + 1]) for i in range(len(TICK) - 1)) - TICK_W / 2
    return ring, arc, tick


def blend(base, top, a):
    return tuple(round(b + (t - b) * a) for b, t in zip(base, top))


def render(size):
    s = 512.0 / size  # units per pixel
    rows = []
    for py in range(size):
        row = bytearray([0])  # PNG filter: none
        for px in range(size):
            x, y = (px + 0.5) * s, (py + 0.5) * s
            ring, arc, tick = sdfs(x, y)
            cov = lambda d: max(0.0, min(1.0, 0.5 - d / s))  # signed distance anti-aliasing
            col = BG
            col = blend(col, WHITE, 0.22 * cov(ring))
            col = blend(col, WHITE, cov(arc))
            col = blend(col, WHITE, cov(tick))
            row.extend(col)
        rows.append(bytes(row))
    return b"".join(rows)


def write_png(path, size):
    def chunk(kind, data):
        c = kind + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(render(size), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("wrote", path)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
    os.makedirs(out, exist_ok=True)
    for name, size in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:
        write_png(os.path.join(out, name), size)
