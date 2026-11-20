"""Check the picture cut and make a one-frame-per-scene contact sheet."""
import io
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
video = root / 'out/wattch-demo.mp4'
timeline = json.loads((root / 'out/timeline.json').read_text())
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
streams = probe['streams']
duration = float(probe['format']['duration'])
assert 299.9 <= duration <= 300.1
assert any(s.get('codec_name') == 'h264' and s.get('width') == 1920 and s.get('height') == 1080 and s.get('r_frame_rate') == '30/1' for s in streams)
assert any(s.get('codec_name') == 'aac' and s.get('sample_rate') == '48000' for s in streams)

sheet = Image.new('RGB', (1920, 4 * 310), '#1b1611')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 20)
for i, scene in enumerate(timeline):
    at = scene['start'] + min(5, (scene['end'] - scene['start']) / 2)
    frame = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', str(at), '-i', str(video), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'])
    img = Image.open(io.BytesIO(frame)).convert('RGB').resize((460, 259))
    x, y = (i % 4) * 480 + 10, (i // 4) * 310 + 8
    sheet.paste(img, (x, y))
    draw.text((x, y + 263), f"{scene['start']:03d}s  {scene['clip']}", font=font, fill='white')
sheet.save(root / 'out/contact-sheet.png')
qr_frame = root / 'out/qr-frame.png'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '297', '-i', str(video), '-frames:v', '1', str(qr_frame)], check=True)
decoded = subprocess.check_output(['node', str(root / 'qr-check.cjs'), str(qr_frame)], text=True).strip()
assert decoded == 'https://getwattch.vercel.app'

report = {
    'status': 'VOICE PENDING — picture cut only',
    'video': str(video),
    'duration_seconds': duration,
    'resolution': '1920x1080', 'fps': 30,
    'video_codec': 'H.264', 'audio_codec': 'AAC silence',
    'voice_present': False, 'captions_burned': False,
    'caption_word_match': 'not testable until voice arrives',
    'loudness_lufs': 'not applicable to silence',
    'qr_target': 'https://getwattch.vercel.app',
    'qr_decode': decoded,
}
(root / 'out/verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
