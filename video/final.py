"""Cut Wattch to Vedhanth's voice, with actual-word captions and the Dallas/Spanish scenes."""
import io
import json
import math
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

R = Path(__file__).resolve().parent
W = R / 'work/final'
O = R / 'out'
W.mkdir(parents=True, exist_ok=True)
O.mkdir(parents=True, exist_ok=True)
RAW = R / 'raw'

# Clip, target start/end, source start, voice start/end, voice delay.
S = [
 ('01-home',0,23,0,0,19.5,0),
 ('02-trap-card',23,46,0,19.5,37.5,0),
 ('03-pick-usage',46,61,0,37.5,46.3,0),
 ('04-05-wall-reveal',61,94,0,46.3,73.7,3),
 ('04-05-wall-reveal',94,134,10,73.7,108,0),
 ('06-locked-12',134,151,7,108,118.2,0),
 ('07b-pick-plan-page',151,188,0,118.2,136.7,0),
 ('08-live-check',188,207,0,136.7,149.9,0),
 ('09-current-plan',207,234,0,149.9,160.9,0),
 ('10-traps',234,254,0,160.9,169.3,0),
 ('10b-dallas',254,276,0,169.3,182.3,0),
 ('10c-espanol',276,296,0,182.3,191,0),
 ('11-share',296,312,5,191,197,0),
 ('12-home-end',312,332,0,197,214.7,0),
]
END = 337
def run(args): subprocess.run(args, check=True, stdout=subprocess.DEVNULL)
def dur(p): return float(json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(p)]))['format']['duration'])

# One distinct video render per scene. Fixed-rate encoding gives exact scripted scene lengths.
parts=[]
for i,(name,a,b,seek,va,vb,delay) in enumerate(S):
    src=RAW/f'{name}.mp4'
    motion=min(dur(src)-seek,b-a)
    target=W/f'{i:02d}.mp4'
    vf=f'fps=30,scale=1920:1080:flags=lanczos,setsar=1,trim=duration={motion},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={b-a-motion},trim=duration={b-a}'
    run(['ffmpeg','-y','-v','error','-ss',str(seek),'-i',str(src),'-vf',vf,'-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-r','30',str(target)])
    parts.append(target)

card=Image.new('RGB',(1920,1080),'#1b1611')
d=ImageDraw.Draw(card)
font='/System/Library/Fonts/Supplemental/Arial.ttf'
for label,size,color,y in [('Wattch',110,'#ffcf2e',150),('getwattch.vercel.app',62,'white',340),('Built by Vedhanth Mellamputi',45,'white',465)]:
    d.text((120,y),label,font=ImageFont.truetype(font,size),fill=color)
qr=W/'qr.png'
run(['qrencode','-o',str(qr),'-s','12','-m','2','https://getwattch.vercel.app'])
card.paste(Image.open(qr).convert('RGB').resize((390,390)),(1400,320))
card_png=W/'end.png'; card.save(card_png)
card_mp4=W/'end.mp4'
run(['ffmpeg','-y','-v','error','-loop','1','-framerate','30','-i',str(card_png),'-t','5','-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',str(card_mp4)])
parts.append(card_mp4)
concat=W/'picture.txt'; concat.write_text(''.join(f"file '{p}'\n" for p in parts))
picture=W/'picture.mp4'
run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(concat),'-c','copy',str(picture)])

# Scene-local voice spans preserve his rate while inserting real pauses for the screen actions.
audio_filters=[]
for i,(_,a,b,_,va,vb,delay) in enumerate(S):
    chain=f'[0:a]atrim=start={va}:end={vb},asetpts=PTS-STARTPTS'
    if delay: chain+=f',adelay={int(delay*1000)}|{int(delay*1000)}'
    chain+=f',apad=pad_dur={b-a},atrim=duration={b-a}[a{i}]'
    audio_filters.append(chain)
audio_filters.append(f'anullsrc=r=48000:cl=mono,atrim=duration={END-S[-1][2]}[tail]')
audio_filters.append(''.join(f'[a{i}]' for i in range(len(S)))+'[tail]concat=n='+str(len(S)+1)+':v=0:a=1,highpass=f=60,afftdn=nf=-30,loudnorm=I=-16:TP=-1.5:LRA=11[aout]')
audio=W/'master.wav'
run(['ffmpeg','-y','-v','error','-i',str(R/'voiceover.qta'),'-filter_complex',';'.join(audio_filters),'-map','[aout]','-ar','48000','-c:a','pcm_s16le',str(audio)])

# Captions are direct from two-pass Whisper transcript, with spelling corrections only.
trans=json.loads((R/'work/voice-medium.json').read_text())['transcription']
corrections=[('Watch','Wattch'),('watch','Wattch'),('Haikyu','Haiku'),('Haikyuu','Haiku'),('sources them','sorts them'),('source them','sorts them'),("it's own","its own"),('The labels own','The label’s own'),('what I cost','what it costs'),('3 usages','three usages'),('3 prices','three prices'),('7 kinds','seven kinds'),('6 months','six months'),('3 months','three months'),('Dallas Fort Worth','Dallas–Fort Worth'),('spanish','Spanish')]
def fix(s):
    s=s.strip()
    for old,new in corrections: s=s.replace(old,new)
    return s
def shifted(t):
    for name,a,b,seek,va,vb,delay in S:
        if va<=t<vb: return a+delay+t-va
    return END-5
cues=[]
for seg in trans:
    va=seg['offsets']['from']/1000; vb=seg['offsets']['to']/1000
    if va>=214.7: continue
    text=fix(seg['text'])
    if not text: continue
    start=max(0,shifted(va)); end=min(END-5,shifted(vb))
    if end<=start: continue
    cues.append((start,end,text))

def stamp(t):
    ms=round(t*1000); h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
(O/'captions.srt').write_text(''.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{text}\n\n' for i,(a,b,text) in enumerate(cues)))

# Encode caption stills to a transparent 1920×170 strip, then overlay once.
font52=ImageFont.truetype(font,52)
blank=Image.new('RGBA',(1920,180),(0,0,0,0)); blank.save(W/'blank.png')
timeline=[]; cursor=0
for i,(a,b,text) in enumerate(cues):
    if a>cursor+0.01: timeline.append((W/'blank.png',a-cursor))
    img=Image.new('RGBA',(1920,180),(0,0,0,0)); draw=ImageDraw.Draw(img)
    words=text.split(); lines=['']
    for word in words:
        trial=(lines[-1]+' '+word).strip()
        if draw.textbbox((0,0),trial,font=font52)[2]>1730 and len(lines)<2: lines.append(word)
        else: lines[-1]=trial
    lines=lines[:2]
    width=max(draw.textbbox((0,0),line,font=font52)[2] for line in lines)
    x=(1920-width)//2; y=8 if len(lines)==2 else 56
    draw.rounded_rectangle((x-30,y-8,x+width+30,y+len(lines)*62+4),radius=14,fill=(18,18,18,225))
    for j,line in enumerate(lines): draw.text((x,y+j*62),line,font=font52,fill='white')
    p=W/f'caption-{i:03}.png'; img.save(p)
    timeline.append((p,b-a)); cursor=b
if cursor<END: timeline.append((W/'blank.png',END-cursor))
caplist=W/'captions.txt'
caplist.write_text(''.join(f"file '{p}'\nduration {duration:.3f}\n" for p,duration in timeline)+f"file '{W/'blank.png'}'\n")
capvid=W/'captions.mov'
run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(caplist),'-vf','fps=30,format=argb','-t',str(END),'-c:v','qtrle',str(capvid)])

out=O/'wattch-demo.mp4'
run(['ffmpeg','-y','-v','error','-i',str(picture),'-i',str(capvid),'-i',str(audio),'-filter_complex','[0:v][1:v]overlay=0:870:shortest=1[v]',
     '-map','[v]','-map','2:a','-t',str(END),'-r','30','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',str(out)])
(O/'timeline.json').write_text(json.dumps([{'clip':x[0],'start':x[1],'end':x[2],'voice_start':x[4],'voice_end':x[5]} for x in S]+[{'clip':'end-card','start':332,'end':337}],indent=2))
print(out, len(cues), 'captions')
