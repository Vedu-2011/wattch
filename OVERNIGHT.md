# OVERNIGHT MISSION — Wattch (runs until Vedhanth stops you in the morning)

You are Claude Code, working alone all night on Wattch (Next.js 16) in ~/Hackathons/Triple H on git branch
`overnight`. Vedhanth is asleep. Nobody will answer questions or approve anything. There is NO finish line
tonight: when one task ends, the next begins. The goal is to WIN Triple H (Functionality 30%, Value & Impact 25%,
UX 20%, Creativity 15%, Presentation 10%, capybara bonus) and also be ready for STEM2Connect + GenHacks.

Read once at the start: ~/Hackathons/CLAUDE.md, ./CLAUDE.md, docs/ARCHITECTURE.md, docs/STATUS.md,
the newest file in ~/Hackathons/_coord/handoffs/ (overnight-1). Then:

## First 5 minutes (once)
1. `git status` — commit anything left over on main from overnight-1 as "WIP: leftovers" (don't lose work).
2. `git switch -c overnight` (or `git switch overnight` if it exists). `git push -u origin overnight`.
   Every push to `overnight` makes a Vercel PREVIEW. Main (the live site) is only merged when Vedhanth says "merge".
3. Add your BOARD row in ~/Hackathons/_coord/BOARD.md (use your Edit tool, not sed).
4. .env.local now has ANTHROPIC_API_KEY (from Vedhanth). Never print it, never commit it.

## Every cycle (repeat forever)
1. Orient: `git status`, `git log --oneline -10`, top of BACKLOG.md, last 40 lines of PROGRESS.md.
2. Take the TOP unchecked item in BACKLOG.md. ONE item at a time.
3. Do it fully. Small working increments beat big rewrites.
4. Verify: `npm test`, `npm run lint`, `npm run build` must pass. For UI: run scripts/shots.mjs (or Playwright)
   at 375 + 1440 and LOOK at the screenshots; fix anything ugly before committing.
5. If it fails and you can't fix it in 3 tries: undo only your own uncommitted changes for that item
   (`git stash push -m "blocked <item>"` — never reset/clean), mark it `[blocked: reason]`, move on.
6. Commit (`git add -A` then `git commit -m "<what + why>"` — two separate commands), then `git push origin overnight`.
7. Append 2–4 lines to PROGRESS.md (time PT, item, result, $ spent if any). Tick the item in BACKLOG.md.
8. If fewer than 8 unchecked items remain, append 10 NEW specific, valuable tasks (see "Where to find more work").
9. Go to step 1. Never end your turn voluntarily. A Stop hook will send you back anyway.
10. Every ~5 items: a short self-review of the diff since the last review (or `codex review` if available);
    fix real findings. Every ~10 items: update docs/STATUS.md.

## Hard rules (never break)
- Never ask anything; decide, write the assumption in PROGRESS.md, continue.
- Never say the work is done. There is always a next item.
- Never delete: no rm/rmdir/unlink, git rm, git clean, git reset --hard, git branch -D, git stash drop.
  Move unwanted files to .trash/ and log them in ~/Hackathons/_coord/TO-DELETE.md.
- Never `cd` then git in one command. Run git alone from the project root, or `git -C "<abs path>"`.
- One git command per Bash call. Edit files with Edit/Write, not sed/awk/heredocs.
- Never force-push, never rewrite history. Merge to main only per CLAUDE.md "MERGES".
- Non-interactive only: `git commit -m`, `npx --yes`, `npm init -y`, `playwright --reporter=line`.
  No vim/nano/less/man, no `vercel` CLI, no sudo/brew/global installs. Background dev servers and stop them after.
- Stay inside ~/Hackathons/Triple H (plus _coord for BOARD/handoffs/logs). Don't edit .claude/.
- If a permission prompt still appears, there's nothing you can do from inside it — so avoid the command shapes
  above, and if something needs Vedhanth, write it in ~/Hackathons/_coord/NEEDS-VEDHANTH.md and move on.
- AI reads, code decides. Every number shown comes from code or is printed on a label. No invented stats/sources;
  only add a stat after opening its source page and quoting it in docs/SOURCES.md.
- Paid API: ≤ $3 total tonight. Log tokens/$ in PROGRESS.md. Cache everything.
- Plain human wording, no gray hairline borders, mobile-first, friendly errors, solo "I" voice in any writing.
- No real emails/phone numbers/business names invented in seed data (real provider names from Power to Choose are fine).

## Where to find more work when the backlog runs low
Judging criteria above; docs/ARCHITECTURE.md; anything in docs/STATUS.md "left"; ugly screenshots; missing tests;
slow pages (Lighthouse); accessibility; demo-video and Devpost readiness; business-track deck facts.

## Morning
At 7:00 AM PT or later, write the handoff (format in ~/Hackathons/CLAUDE.md) to ~/Hackathons/_coord/handoffs/,
then keep going on the backlog until stopped.
