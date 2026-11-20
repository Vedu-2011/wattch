# Wattch final demo cut

The current `out/wattch-demo.mp4` is a 5:37 cut with Vedhanth's own voice, Dallas and Español scenes, 69 burned captions, and a QR end card. All media stays local; only edit and verification scripts are committed. Read `out/verification.json` for measured specifications and the stutter review note.

To rebuild, place the raw clips in `video/raw/` (a symlink to the home project's raw folder also works) and Vedhanth's Voice Memos recording at `video/voiceover.qta`. Run `npm ci --prefix video/qrcheck`. Transcribe locally with whisper.cpp small.en and medium.en to `video/work/voice-medium.json`; then run `python3 video/final.py` and `python3 video/verify_final.py`. The scripts use ffmpeg, ffprobe, qrencode, Pillow, and the local `jsqr`/`pngjs` decoder packages. Every rebuild renders the clips again.

The editor preserves the original voice speed, uses light cleanup and loudness normalization, and burns 52 px white captions on dark boxes. The two ASR passes found one possible stumble at source 2:46 (“what it costs”), but no unambiguous repeated word or false start to cut. The recording is preserved there. Listen to that sentence before submitting if you want a different choice. Do not upload from this lane.
