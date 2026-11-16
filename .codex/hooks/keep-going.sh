#!/bin/bash
# Overnight Stop hook: sends Claude back to the backlog instead of ending. Off if .overnight-stop exists or 9:00-16:59.
cat > /dev/null
PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -f "$PROJ/.overnight-stop" ] && exit 0
H=$(date +%H)
if [ "$H" -ge 9 ] && [ "$H" -lt 17 ]; then exit 0; fi
printf '%s\n' '{"decision":"block","reason":"OVERNIGHT MODE: keep working. Re-read OVERNIGHT.md, BACKLOG.md and the last 40 lines of PROGRESS.md. Take the next unchecked BACKLOG item and do it. If fewer than 8 items are open, first append 10 new concrete improvement tasks. Verify (npm test, npm run lint, npm run build), commit, git push origin overnight, log 2-4 lines in PROGRESS.md, then continue with the next item."}'
exit 0
