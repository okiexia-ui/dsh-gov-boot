"""Encode numbered PNG frames into a looping GIF: frames-to-gif.py <dir> <out.gif> <ms-per-frame>.

Identical consecutive frames are merged (their durations add up), and every
frame shares one palette built from a sample of the whole clip, which keeps the
paper splash and the blue sign-in scene from flickering between palettes.
"""
import os
import sys

from PIL import Image, ImageChops

src, out, ms = sys.argv[1], sys.argv[2], int(sys.argv[3])
paths = sorted(os.path.join(src, name) for name in os.listdir(src) if name.endswith('.png'))
frames = [Image.open(path).convert('RGB') for path in paths]
# Drop the blank page Chromium shows before the preview loads.
while len(frames) > 1 and frames[0].convert('L').getextrema()[0] > 240:
    frames.pop(0)

# One palette for the whole clip, from a strip of evenly spaced frames.
sample = frames[:: max(1, len(frames) // 12)]
strip = Image.new('RGB', (sample[0].width, sample[0].height * len(sample)))
for i, frame in enumerate(sample):
    strip.paste(frame, (0, i * frame.height))
palette = strip.quantize(colors=255, method=Image.Quantize.MEDIANCUT)

merged, durations = [], []
for frame in frames:
    if merged and ImageChops.difference(frame, merged[-1]).getbbox() is None:
        durations[-1] += ms
        continue
    merged.append(frame)
    durations.append(ms)

indexed = [frame.quantize(palette=palette, dither=Image.Dither.FLOYDSTEINBERG) for frame in merged]
os.makedirs(os.path.dirname(out), exist_ok=True)
indexed[0].save(out, save_all=True, append_images=indexed[1:], duration=durations, loop=0, optimize=True, disposal=1)
print(f'{out}: {len(indexed)} frames, {os.path.getsize(out) / 1e6:.1f} MB')
