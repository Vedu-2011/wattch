# Day 2 (Mon Nov 16) — planner decisions on overnight-2 + get it ready for Vedhanth to test (Claude Code)

Read: ~/Hackathons/CLAUDE.md, ./CLAUDE.md, OVERNIGHT.md rules (still apply: no deletes, no cd+git, one git cmd per call),
_coord/handoffs/2026-11-16-0701--triple-h--claude--overnight-2.md + the 0938 addendum. Stay on branch `overnight`.
Vedhanth is awake today, but don't ask him things you can decide — these are the planner's answers:

1. VERCEL LIMIT: add to vercel.json `{"git":{"deploymentEnabled":{"overnight":false}}}` (keep anything already in it)
   so pushes to `overnight` stop using builds. Push once per batch from now on. Production will build after "merge".
2. LOCAL TEST SERVER FOR VEDHANTH: `npm run build` then start `npx next start -p 3000` in the background and leave it
   running. Then check / , /wall, a plan page, compare, /traps, /demo, Español and Dallas at localhost:3000 yourself.
   Tell him in chat: "Open http://localhost:3000 — here are the 7 things to try" (use the STATUS 7-step list, short).
3. `.codex/`: untrack it (keep the files on disk): `git update-index --force-remove` on each tracked .codex file
   (git rm is blocked by the guard hook), .codex/ stays in .gitignore. Commit.
4. Screenshots: untrack docs/screenshots/overnight-2 (52 MB) the same way + add to .gitignore; keep docs/gallery/ tracked.
5. 0 kWh: the 12-month inputs and the usage box get a minimum of 50 kWh per month with a friendly message; add a
   test that no ranked plan shows a bill below $0 at any allowed usage with autopay ON.
6. .env.example: skip (env files are blocked for you); README already lists the keys — fine.
7. DATA: freeze the data for now (pages already say "read Nov 16"). The planner will run the refresh after the Anakin key
   is in .env.local. Don't apply refresh yourself.
8. Wrap: tests, lint, build, check-all, commit, push overnight (1 push). Handoff file + BOARD Done.
   Say "Handoff saved — tell the planner: handoffs".
