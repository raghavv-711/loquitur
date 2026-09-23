"""Turns the logo's navy background transparent (keeps soft, anti-aliased edges).
Usage: python3 scripts/transparent-logo.py input.bmp output.png   (make the BMP with: sips -s format bmp in.png --out in.bmp)"""
import struct, sys, zlib

BG = (4, 12, 32)  # the logo's background, #040c20

def read_bmp(path):
    d = open(path, "rb").read()
    off = struct.unpack_from("<I", d, 10)[0]
    w, h = struct.unpack_from("<ii", d, 18)
    bpp = struct.unpack_from("<H", d, 28)[0] // 8
    row = (w * bpp + 3) // 4 * 4
    top_down, h = h < 0, abs(h)
    px = []
    for y in range(h):
        yy = y if top_down else h - 1 - y
        base = off + yy * row
        px.append([(d[base + x * bpp + 2], d[base + x * bpp + 1], d[base + x * bpp]) for x in range(w)])
    return w, h, px

def to_rgba(c):
    # Alpha from how far the pixel is from the background; then "un-mix" the background out of the color.
    diff = max(abs(c[i] - BG[i]) for i in range(3))
    a = min(1.0, max(0.0, (diff - 6) / 60))
    if a == 0:
        return (0, 0, 0, 0)
    rgb = [round(min(255, max(0, (c[i] - BG[i] * (1 - a)) / a))) for i in range(3)]
    return (*rgb, round(a * 255))

def write_png(path, w, h, rows):
    raw = b"".join(b"\x00" + bytes(v for p in r for v in p) for r in rows)
    chunk = lambda t, data: struct.pack(">I", len(data)) + t + data + struct.pack(">I", zlib.crc32(t + data) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    open(path, "wb").write(png)

w, h, px = read_bmp(sys.argv[1])
write_png(sys.argv[2], w, h, [[to_rgba(c) for c in row] for row in px])
print(f"wrote {sys.argv[2]} ({w}x{h})")
