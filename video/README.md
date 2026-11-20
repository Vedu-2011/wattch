# Wattch demo picture cut

The current `out/wattch-demo.mp4` is a five minute picture cut with silent AAC. It is marked **VOICE PENDING** on the end card and is not ready to submit. All media stays local; only the edit and verification scripts are committed.

To rebuild, place the raw clips in `/Users/mellamputi_vedhanth/Hackathons/Triple H/video/raw/`, then run `python3 video/edit.py` and `python3 video/verify.py` from this lane. The scripts use ffmpeg, ffprobe, qrencode, Pillow, and the local `jsqr`/`pngjs` decoder packages under `video/work/qrcheck/node_modules/`.

When the voice recording arrives, use it as the audio master. Transcribe it with local whisper.cpp, check the words against what is actually spoken, burn 52 px white captions on dark boxes, normalize to about −16 LUFS with a true peak below −1 dBFS, remove the pending note, and verify the final encode and QR again. Do not upload from this lane.
