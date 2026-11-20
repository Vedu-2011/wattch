"""Build the silent Wattch picture cut; re-run after voice arrives for final audio/captions."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
RAW = ROOT / 'raw'
WORK = ROOT / 'work-v3'
OUT = ROOT / 'out'
WORK.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

# Script rows 1–12; the combined wall/reveal clip is split at its natural reveal.
SCENES = [
    ('01-home', 0, 25, 0, None),
    ('02-trap-card', 25, 50, 0, None),
    ('03-pick-usage', 50, 70, 0, None),
    ('04-05-wall-reveal', 70, 100, 0, 10),
    ('04-05-wall-reveal', 100, 140, 10, None),
    ('06-locked-12', 140, 155, 7, None),
    ('07b-pick-plan-page', 155, 195, 0, None),
    ('08-live-check', 195, 215, 0, None),
    ('09-current-plan', 215, 245, 0, None),
    ('10-traps', 245, 265, 0, None),
    ('11-share', 265, 280, 5, None),
    ('12-home-end', 280, 295, 0, None),
]

def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL)

segments = []
for idx, (name, start, stop, source_start, source_stop) in enumerate(SCENES):
    source = RAW / f'{name}.mp4'
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-of', 'json', str(source)]))
    available = float(probe['format']['duration']) - source_start
    if source_stop is not None:
        available = min(available, source_stop - source_start)
    length = stop - start
    motion = min(available, length)
    hold = max(0, length - motion)
    target = WORK / f'{idx:02d}.mp4'
    vf = f'fps=30,scale=1920:1080:flags=lanczos,setsar=1,trim=duration={motion},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={hold:.4f},trim=duration={length}'
    run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(source_start), '-i', str(source), '-vf', vf,
         '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', str(target)])
    segments.append(target)

# Final 5 seconds are a legible, static QR card.
qr = WORK / 'qr.png'
run(['qrencode', '-o', str(qr), '-s', '12', '-m', '2', 'https://getwattch.vercel.app'])
card = WORK / 'card.mp4'
card_image = Image.new('RGB', (1920, 1080), '#1b1611')
draw = ImageDraw.Draw(card_image)
font = '/System/Library/Fonts/Supplemental/Arial.ttf'
for label, size, color, y in [
    ('Wattch', 110, '#ffcf2e', 150),
    ('getwattch.vercel.app', 62, '#ffffff', 340),
    ('Built by Vedhanth Mellamputi', 45, '#ffffff', 465),
    ('VOICE PENDING', 30, '#ffcf2e', 750),
]:
    draw.text((120, y), label, font=ImageFont.truetype(font, size), fill=color)
card_image.paste(Image.open(qr).convert('RGB').resize((390, 390)), (1400, 320))
png = WORK / 'card.png'
card_image.save(png)
run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-framerate', '30', '-i', str(png),
     '-t', '5', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', str(card)])
segments.append(card)

manifest = WORK / 'concat.txt'
manifest.write_text(''.join(f"file '{p}'\n" for p in segments))
result = OUT / 'wattch-demo.mp4'
run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(manifest),
     '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000', '-t', '300',
     '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p',
     '-r', '30', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(result)])
(OUT / 'timeline.json').write_text(json.dumps([{'clip': s[0], 'start': s[1], 'end': s[2]} for s in SCENES] + [{'clip': 'end-card', 'start': 295, 'end': 300}], indent=2))
print(result)
