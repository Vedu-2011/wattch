# CLAUDE.md — Triple H (Teens Hack Houston 2026) — project: Wattch

The rules in ~/Hackathons/CLAUDE.md apply here too. This file adds what's specific to this event.

## The event
- Link: https://tripleh.devpost.com (schedule: /details/dates — checked Nov 14 in browser)
- Dates (Pacific): opened Sat Nov 14, 6 AM → DEADLINE Sat Nov 21, 3 PM PT (5 PM CST). Submit by noon PT.
  Judging Sun Nov 22, 3 PM → Tue Nov 24, 10 AM PT. Winners by Tue Nov 24, 3 PM PT.
- Theme: "A more efficient way to live."
- Tracks: Technical (website/app/tool) AND Business (pitch deck ≤15 pages: executive summary, market opportunity,
  business model, the ask; presenter role-plays an executive). We enter BOTH with the same project.
  Prizes per track: $100 / $50 / $25.
- Judging: Functionality 30%, Value & Impact 25%, UX 20%, Creativity 15%, Presentation 10%, + capybara bonus.
- Submission: Devpost. MANDATORY demo video, max 10 min, aim 3–8 min, must demo the product, audio must be clear
  (points off if not). A Zoom pitch may happen (format not final).
- Same project also goes to: STEM2Connect (due Sat Nov 21, 8:59 PM PT; video ≤6 min; README must list every AI
  tool used; Demo Day Nov 24) and GenHacks (due Dec 25; list AI tools). → Target video length: ~5 min.
- Sponsors we use: Anakin.io (scraping/browser API — fetches the plan fine print), Anakin AI (anakin.ai — one
  QuickApp for the plain-English explainer, if hackathon credits include API access), .XYZ (free domain,
  wattch.xyz or similar). Kariaa challenge: optional stretch only (real Kariaa keys need 18+).

## The project
- Wattch — reads the fine print on every Houston plan. Repo github.com/Vedu-2011/wattch · live https://getwattch.vercel.app · see docs/ARCHITECTURE.md + prompts/overnight-1.md.

## Files
- prompts/*.md — written by the planner. Do one when Vedhanth says "Do prompts/<file>.md".
- Handoffs go to ~/Hackathons/_coord/handoffs/ (see root CLAUDE.md). HANDOFF.md here is history only.
- docs/ — ARCHITECTURE.md (plan), later DESIGN.md, DEVPOST.md, SCRIPT.md, DECK.md, SOURCES.md
- test-data/ — hand-checked EFL samples + expected numbers (the frozen test set).

## OVERNIGHT RULES (survive context compaction — re-read OVERNIGHT.md whenever unsure)
- Work loop: BACKLOG.md top item → verify (test, lint, build, screenshots) → commit → `git push origin overnight` → PROGRESS.md → next.
- Never stop, never ask, never say "done". Never delete (mv to .trash/ + log in _coord/TO-DELETE.md).
- Never cd+git in one command; one git command per Bash call; edit files with Edit/Write. Never touch main.
