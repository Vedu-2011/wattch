# Video shots — raw 1920×1080 clips

One clip per row of docs/SCRIPT.md, recorded by `scripts/video-shots.mjs` against a local production build.
They're in `video/raw/` (not in git — too big). Each is `.webm` + `.mp4` (H.264, opens in iMovie / CapCut).

**What they're for:** backups and a timing reference. A QuickTime screen recording of the same steps (with your real
mouse and your voice) will look sharper; if a live take goes wrong, drop the matching clip in instead.

**Re-record:** `npm run build && npx next start -p 3000`, then `node scripts/video-shots.mjs` (all) or
`node scripts/video-shots.mjs 06-locked-12 11-share` (just those). The yellow dot is the mouse (Playwright's video has
no cursor). Clips fail loudly on any page error or 4xx/5xx.

| Clip | Length | Script row | What happens |
|---|---|---|---|
| `01-home` | 16 s | 1 (0:00–0:25) | Home page, still; slow scroll past the stats and back |
| `02-trap-card` | 16 s | 2 (0:25–0:50) | Scroll to the rotating trap card; it changes once |
| `03-pick-usage` | 8 s | 3 (0:50–1:10) | Click **Average home** → **Read every plan** |
| `04-05-wall-reveal` | 19 s | 4 + 5 (1:10–2:20) | Tiles stamp as Kapi walks (9 s), then the **$378** reveal and the year bars |
| `06-locked-12` | 19 s | 6 (2:20–2:35) | Toggle **Price locked 12+ months**; the number changes |
| `07b-pick-plan-page` | 12 s | 7 (2:35–3:15) | The state site's #1 (Simple Saver 3): hover each bill line down to the **$125 credit** line |
| `07-plan-page` | 13 s | 7 (alt) | Wattch's #1 (SmartGreen 3): hover each bill line (no credit on this plan) |
| `08-live-check` | 7 s | 8 (3:15–3:35) | **Check this label again now** → "Same label, word for word" (live fetch from the provider) |
| `09-current-plan` | 23 s | 9 (3:35–4:05) | **Already on a plan?** → type `simple saver` → Simple Saver 3 → switch / wait answer |
| `10-traps` | 17 s | 10 (4:05–4:25) | Trap guide, slow scroll through the first kinds |
| `10b-dallas` | 21 s | 10b (optional) | Home → **Dallas–Fort Worth** → Read every plan → **$530** |
| `10c-espanol` | 17 s | 10c (optional) | Results → **Español** → the same $378 in Spanish |
| `11-share` | 17 s | 11 (4:25–4:40) | Results → **Share card** → the card image |
| `12-home-end` | 9 s | 12 (4:40–5:00) | Home page, still, for the closing line |
| `demo-slow` | 79 s | backup | `/demo?speed=slow`: all 7 scenes on their own, 10 s each — a full fallback if a live recording fails |

Notes
- Recorded Nov 19 late evening PT against the Nov 16 data (with plans that have since left Power to Choose marked and
  unranked). If the data is refreshed, re-record: the numbers in the clips come straight from the data.
- `06-locked-12` shows **SimpleSaver 12** as the state site's #1 among 12-month plans (#38 for this home, $208 a year
  more than the best 12-month plan). That's correct for the Nov 16 list.
- Clip lengths are real time. Slow a clip down in the editor rather than re-recording when the narration runs long.
