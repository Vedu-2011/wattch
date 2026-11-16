#!/bin/bash
# PreToolUse guard (deny-only): blocks risky or interactive command shapes before they run.
IN=$(cat)
deny() { printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"$1\"}}"; exit 0; }
if printf '%s' "$IN" | grep -Eq '(^|[^A-Za-z])cd [^;&|]+(&&|;|\|\|)[^"]*git '; then
  deny "Never combine cd with git. Run git alone from the project root, or use git -C with the absolute path."
fi
if printf '%s' "$IN" | grep -Eq '(^|[^A-Za-z_-])(rm|rmdir|unlink)[[:space:]]'; then
  deny "Don't delete tonight. mv it into .trash/ and log it in ~/Hackathons/_coord/TO-DELETE.md."
fi
if printf '%s' "$IN" | grep -Eq 'git (rebase -i|add -p|add -i)|playwright (codegen|show-report)|(^|[ ;&])vercel( |$)|npm init$|gh auth login|git checkout main|git switch main|git push( [^ ]*)? origin main'; then
  deny "Blocked overnight: interactive command or touching main. Use non-interactive forms (git commit -m, npx --yes, npm init -y). Stay on branch overnight."
fi
exit 0
