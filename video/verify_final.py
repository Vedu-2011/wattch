"""Verify the actual final encode and create its contact sheet."""
import io, json, re, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

R=Path(__file__).resolve().parent; O=R/'out'; v=O/'wattch-demo.mp4'
p=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(v)]))
duration=float(p['format']['duration']); streams=p['streams']
assert 225<=duration<=255
assert any(s.get('codec_name')=='h264' and s.get('width')==1920 and s.get('height')==1080 and s.get('r_frame_rate')=='30/1' and int(s.get('nb_frames',0))==round(duration*30) for s in streams)
assert any(s.get('codec_name')=='aac' and s.get('sample_rate')=='48000' for s in streams)

report_audio=subprocess.run(['ffmpeg','-hide_banner','-i',str(v),'-filter_complex','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True).stderr
summary=report_audio.split('Summary:')[-1]
loud=float(re.search(r'I:\s*(-?\d+(?:\.\d+)?) LUFS',summary).group(1))
peak=float(re.search(r'Peak:\s*(-?\d+(?:\.\d+)?) dBFS',summary).group(1))
assert -17<=loud<=-15 and peak < -1

frame=O/'qr-frame.png'
subprocess.run(['ffmpeg','-y','-v','error','-ss',str(duration-3),'-i',str(v),'-frames:v','1',str(frame)],check=True)
decoded=subprocess.check_output(['node',str(R/'qr-check.cjs'),str(frame)],text=True).strip()
assert decoded=='https://getwattch.vercel.app'

srt=(O/'captions.srt').read_text()
joined=' '.join(line for block in srt.strip().split('\n\n') for line in block.splitlines()[2:]).lower()
assert 'sources them' not in joined and 'source them' not in joined and 'sorts them' in joined
assert 'what i cost' not in joined and 'what it costs' in joined
blocks=[b for b in srt.strip().split('\n\n') if b]
assert len(blocks)>50
for block in blocks:
    lines=block.splitlines()
    assert len(lines)<=4  # sequence + times + at most two text lines
    assert '-->' in lines[1]

timeline=json.loads((O/'timeline.json').read_text())
source_by_clip={}
for scene in timeline:
    if 'source_start' not in scene: continue
    assert scene['source_end']>scene['source_start'], scene
    for prior in source_by_clip.get(scene['clip'],[]):
        assert scene['source_start']>=prior['source_end'] or scene['source_end']<=prior['source_start'], (prior,scene)
    source_by_clip.setdefault(scene['clip'],[]).append(scene)

silence_log=subprocess.run(['ffmpeg','-hide_banner','-i',str(v),'-af','silencedetect=noise=-40dB:d=0.15','-f','null','-'],capture_output=True,text=True,check=True).stderr
starts=[float(x) for x in re.findall(r'silence_start: (\d+(?:\.\d+)?)',silence_log)]
ends=[float(x) for x in re.findall(r'silence_end: (\d+(?:\.\d+)?)',silence_log)]
gaps=[{'start':round(a,3),'end':round(b,3),'seconds':round(b-a,3)} for a,b in zip(starts,ends)]
longest=max(gaps,key=lambda g:g['seconds'])
assert longest['seconds']<=3.05,longest
assert all(g['seconds']<=3.05 for g in gaps)
sheet=Image.new('RGB',(1920,4*310),'#1b1611'); d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',20)
for i,scene in enumerate(timeline):
    at=scene['start']+min(5,(scene['end']-scene['start'])/2)
    data=subprocess.check_output(['ffmpeg','-v','error','-ss',str(at),'-i',str(v),'-frames:v','1','-f','image2pipe','-vcodec','png','-'])
    x,y=(i%4)*480+10,(i//4)*310+8
    sheet.paste(Image.open(io.BytesIO(data)).convert('RGB').resize((460,259)),(x,y))
    d.text((x,y+263),f"{scene['start']:05.1f}s {scene['clip']}",font=font,fill='white')
sheet.save(O/'contact-sheet.png')

early=Image.new('RGB',(1920,5*255),'#1b1611'); ed=ImageDraw.Draw(early)
for i,at in enumerate(range(40,122,2)):
    data=subprocess.check_output(['ffmpeg','-v','error','-ss',str(at),'-i',str(v),'-frames:v','1','-f','image2pipe','-vcodec','png','-'])
    x,y=(i%10)*192,(i//10)*255
    early.paste(Image.open(io.BytesIO(data)).convert('RGB').resize((188,106)),(x,y))
    ed.text((x+4,y+110),f'{at//60}:{at%60:02}',font=font,fill='white')
early.save(O/'contact-sheet-early.png')

report={'status':'FINAL CANDIDATE — voice and captions present','duration_seconds':duration,'frames':round(duration*30),
        'resolution':'1920x1080','fps':30,'video_codec':'H.264','audio_codec':'AAC 48kHz',
        'voice':'Vedhanth own voice, normal speed','caption_count':len(blocks),'caption_source':'locally transcribed actual voice, small.en and medium.en cross-checked',
        'source_ranges_not_reused':True,
        'source_ranges':{clip:[{'start':s['source_start'],'end':s['source_end']} for s in scenes] for clip,scenes in source_by_clip.items()},
        'longest_voice_silence':longest,'voice_silence_over_1_2_seconds':[g for g in gaps if g['seconds']>1.2],
        'loudness_lufs':loud,'true_peak_dbfs':peak,'qr_decode':decoded,
        'stutter_cut':'none — no unambiguous repeated word/false start in two ASR passes; 2:46 phrase reviewed as possible slip',
        'caption_word_match':'checked against corrected medium.en transcript; small.en agrees on suspected what-it-costs phrase'}
(O/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
