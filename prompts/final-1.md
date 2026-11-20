# Final-1 (Thu Nov 19 night → Fri morning) — refresh data + freeze-ready polish + video/Devpost/deck assets (Claude Code)

Deadline: Triple H Sat Nov 21 3 PM PT (submit by noon), STEM2Connect Sat 8:59 PM PT. FEATURE FREEZE Fri Nov 20
night: no new features — polish, data, assets. Rules: ~/Hackathons/CLAUDE.md, ./CLAUDE.md, OVERNIGHT.md hard rules.
Read the day-2 handoff first.

## Part 0 — MERGE (Vedhanth said "merge" in the planner chat, Thu Nov 19 10:15 PM PT, and said merges for Wattch no
## longer need his confirmation)
1. On `overnight`: npm test, lint, build, check-all pass.
2. Take MAIN LOCK in BOARD.md (Edit tool). `git switch main` · `git merge --no-ff overnight -m "Merge overnight work"` ·
   `git push origin main` (one git command per call). Release MAIN LOCK.
3. Wait for the Vercel production deploy, then check https://getwattch.vercel.app: /, results, a plan page, compare,
   /traps, /demo, Español, Dallas → all 200, no console errors. If production fails, fix it and push again.
4. `git switch overnight` · `git merge main`. Keep working on `overnight`.
From now on: whenever a batch passes test + lint + build + check-all + a production-style check, merge it to main
the same way (max once every ~2 hours to save Vercel builds) and verify the live site. Log each merge in PROGRESS.md.

## Part 1 — DATA
- If ANAKIN_API_KEY is in .env.local: take PAID-API LOCK, run the refresh dry run, then
  `npx tsx --env-file=.env.local scripts/refresh.ts --area all --apply` (cap $0.50), re-verify counts, update the
  "read <date>" text, release lock. If not: keep the Nov 16 data; make sure plans that left Power to Choose
  (5 Abundance plans) are marked as no longer listed and never ranked, without a paid re-read.

## Part 2 — FREEZE-READY POLISH
1. Demo flow flawless on iPhone size and 1920 projector: home → usage → reveal → plan page → compare → Español →
   Dallas. Fix anything slow, jumpy, clipped, or confusing. Screenshots in docs/gallery-final/.
2. /demo runs start to finish with no input; add ?speed=slow for screen recording.
3. Playwright 1920×1080 screen captures (video on): reader wall + reveal, plan page (bill lines + cliff chart +
   highlighter if present), compare, Español switch, Dallas switch, live "check this label again". Save to
   video/raw/ (gitignored) and list them in docs/SHOTS.md. These are b-roll for Vedhanth's own-voice video.
4. docs/SCRIPT.md: final ~5:00 script (fits STEM2Connect ≤6 min, Triple H 3–8). Solo "I" voice. Scenes match SHOTS.md.
   Every number checked against today's data.
5. docs/DEVPOST.md: final text (Technical + Business tracks), Built with, AI tools list. Every claim checked. No "we".
6. docs/DECK.md: final ≤15-slide business deck content; every number has a working source link in docs/SOURCES.md.
7. README final. At 7:00 AM write the handoff, then keep polishing 1–3.
