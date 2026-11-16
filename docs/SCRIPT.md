# Demo video script — Wattch (~5:00, hard cap 5:30)

Draft v1 by Claude Code (overnight-2, Nov 16 2026). For Vedhanth to record in his own voice (ask before any AI voice).
Fits all three: Triple H (3–8 min, must demo the product, clear audio), STEM2Connect (≤6 min), GenHacks.
Numbers are from `npx tsx scripts/headline.ts` (data built Nov 16 07:03 UTC). Re-run it before recording; if the data
was refreshed, swap the numbers marked ⟲.

**Setup before recording**
- Chrome, 1920×1080, zoom 100%, bookmarks bar hidden, one tab. Open https://getwattch.vercel.app (or the overnight
  preview if not merged yet).
- Mic check: record 10 s, listen back. Quiet room. Triple H takes points off for unclear audio.
- Practice once with a stopwatch. Speak slowly — the timings below assume ~140 words a minute.

| # | Time | Screen + exact clicks | Narration (say this) |
|---|---|---|---|
| 1 | 0:00–0:25 | Home page, still. Slowly scroll so the "plans read / traps found" tiles show. | "In Houston you have to pick your own electricity plan. The state's website lists 172 ⟲ of them and sorts them by one number: the price if you use exactly 1,000 kilowatt-hours. I wanted to know if that number is real. So I built Wattch." |
| 2 | 0:25–0:50 | Point at the rotating trap card on home; let it change once. | "The truth is in a PDF every plan has to publish, called the Electricity Facts Label. That's where the catches are: bill credits you only get above a certain usage, minimum-use fees, teaser prices that last three months. Wattch reads all of them." |
| 3 | 0:50–1:10 | Usage picker → choose **Average home** (1,100 kWh — it's already selected by default). Click **Read every plan**. | "I'll say I'm a typical Houston home, about 1,100 kilowatt-hours a month, and press read every plan." |
| 4 | 1:10–1:40 | /wall: the tiles stamp ✓ as Kapi walks across. Don't talk over the first 3 seconds — let it play. | "Every tile is one real plan. An AI model, Claude Haiku, reads each label. But I don't trust the AI. Texas makes every label print its own average price at three usages. My code rebuilds those three prices from what the AI read, and they have to match to a tenth of a cent. 171 of 172 ⟲ check out. Only those get ranked." |
| 5 | 1:40–2:20 | The reveal: let the $ count up. Pause on it. Point at the year bars. | "Here's the answer. The plan the state site puts first — Simple Saver 3, 6.2 cents ⟲ — ranks number 74 ⟲ out of 154 for this home, and costs **378 dollars more a year** ⟲ than the best plan. Why? Its 125-dollar credit only kicks in at 1,000 kilowatt-hours. Look at the bars: Houston summers clear the line, but six months ⟲ a year this home doesn't, so the credit never comes." |
| 6 | 2:20–2:35 | Toggle **Price locked 12+ months**. Point at the new number. | "Some cheap plans only lock the price for three months. If I only want prices locked for a year, the gap is still 208 dollars ⟲." Toggle it back off. |
| 7 | 2:35–3:15 | Click the #1 plan → its plan page. Scroll to the label text. **Hover** the energy-charge bill line, then the credit line, so the numbers glow in the label. Scroll to the three-price check table. | "Every number is provable. This is the actual label text. When I hover a line of the bill, the exact number it came from lights up in the fine print. And here's the check: the label's own three prices next to the ones my code rebuilt. They match." |
| 8 | 3:15–3:35 | Click **Check this label again now**. Wait for the answer. | "Prices change, so any plan can be re-checked live. Wattch downloads the label again right now and tells me if anything changed." |
| 9 | 3:35–4:05 | Back to results → scroll to **Already on a plan?** → type `simple saver` → click the **first** one, **Simple Saver 3** (not SimpleSaver 12). Leave months left at 6. It says "You're paying $378 ⟲ a year more. Leaving costs $150 … pays back in 5 months … Switch now." Point at it. | "If you're already on a plan, Wattch does the switching math with your real exit fee and tells you plainly: switch now, or wait until your contract ends." |
| 10 | 4:05–4:25 | Header → **Traps**. Scroll slowly through 2–3 trap kinds. | "I also built a guide to the seven ⟲ kinds of traps I found, each with a real plan and what it costs at three usages." |
| 10b *(optional, +15 s)* | — | Home → in the form, tap **Dallas–Fort Worth (Oncor)**; the stats and trap card change. Click **Read every plan**, skip to the reveal. | "And it's not just Houston. The same code read every Dallas–Fort Worth plan too. There, that same 6.2-cent plan costs 530 dollars ⟲ more a year." |
| 10c *(optional, +15 s)* | — | On the results page, scroll to the top and click **Español** in the header (top right). The page switches and stays at the top, so scroll down to the big number and point at "más al año". Scroll up and click **English** to switch back. | "And every page works in Spanish too. Same plans, same math, same check — just in the language you read best." |
| 11 | 4:25–4:40 | Back to results → **Share my result** → show the card image. | "And every result is a link you can send someone, with your own number on it." |
| 12 | 4:40–5:00 | Home page, still. | "Texas gave people the power to choose, but not the time to read 172 ⟲ labels. Wattch reads them, checks its own work, and shows what your plan really costs. AI reads, code decides. Thanks for watching." |

Word count ≈ 640 → about 4:35 at 140 wpm, leaving ~25 s for pauses and the wall animation. Hard stop 5:30.

**Optional line for scene 7 (+10 s)** — scroll to "Ask yourself before you sign": "Under every bill line there's a
sentence saying where it comes from, and the page writes questions from the plan's own fine print, like: will I use
1,000 kilowatt-hours every single month? For this home, no — six months a year, 750 dollars."
With both optional bits the video is about 5:15; with 10c too, about 5:30 — right at the cap, so only add 10c if the rest runs short.
Drop order if you run long: 10c first, then the scene-7 line, then 10b. (10c checked Nov 16: the header button reads
"Español" at 1920 wide — on phones it's "ES" — and the Spanish reveal says "más al año"; switching lands at the top of the page, checked live; src/components/LangSwitch.tsx, src/lib/i18n.ts.)

**If something breaks while recording**
- /wall is slow → use /demo (same numbers, auto-plays, ← → keys) for scenes 4–6, and say "here's the walk-through".
- Live re-check fails (provider site down) → it says so in plain words; say "the provider's site is down right now,
  which is exactly why Wattch keeps the last checked copy" and move on.

**Checked against the code (Claude Code, Nov 16)**
172 / 171 / 154 / #74 / $378 / $125 / 1,000 kWh / 6 months: scripts/headline.ts at 1,100 kWh with seasons.
6.2¢: plan 33633 `ptc.k1000`. $208 locked: PROGRESS.md B8 + count-shot (url kwh=1100&lock=1). 7 trap kinds: trapGuide.ts.
Clicks (all found in the code): "Average home" (UsagePicker), "Read every plan" (UsagePicker), "Price locked 12+ months"
(Wall), "Check this label again now" (LiveCheck), "Already on a plan" (CurrentPlan), "Share my result" (ShareButton),
header "Traps" (layout). Still do one dry run on the live site before recording.
