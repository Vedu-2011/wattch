# Phase 0 — Setup tonight: repo, Vercel, Upstash, empty skeleton, data check (Claude Code)

Read first: ~/Hackathons/CLAUDE.md, ./CLAUDE.md, docs/ARCHITECTURE.md, _coord/BOARD.md.
Add your BOARD row. Before doing anything, list your plan in 3–5 bullets.
Vedhanth is going to sleep after this — do everything yourself. Only stop for CAPTCHAs / accepting terms.

## Tasks
1. Scaffold in THIS folder (keep CLAUDE.md, AGENTS.md, HANDOFF.md, docs/, prompts/, test-data/):
   Next.js latest (App Router, TypeScript, ESLint, Tailwind v4, src/ dir) scaffolded in a temp folder and moved
   in. Add vitest + zod. Init shadcn/ui (defaults for now — Claude Code designs it properly in phase 1).
2. git init, PUBLIC GitHub repo Vedu-2011/wattch via gh, push main.
3. .env.example: ANTHROPIC_API_KEY=, KV_REST_API_URL=, KV_REST_API_TOKEN=, ANAKIN_API_KEY=,
   ANAKIN_AI_API_KEY=, INGEST_SECRET=  (no real values committed). Copy the Anthropic key from
   ../DSH Hacks/.env.local into .env.local and Vercel env (same key; don't print it).
4. Vercel project "wattch", production from main. Turn OFF deployment protection for previews.
   Upstash Redis via Vercel Marketplace (env prefix KV_), pull env to .env.local.
   /api/health → writes + reads `wattch:health` → { ok, redis: true, time }.
5. Placeholder home page: "Wattch — reading the fine print. Coming soon." Plain, no gray hairline borders.
6. README.md: what Wattch is (2 lines), "AI tools used" section (Claude Code, Codex, Anthropic Claude API,
   Anakin.io, Anakin AI) — STEM2Connect requires this list.
7. DATA CHECK (no parsing, no paid calls): download the Power to Choose CSV
   (http://www.powertochoose.org/en-us/Plan/ExportToCsv). Save it to test-data/ptc-YYYY-MM-DD.csv.
   Report in the handoff: column names, total plans, how many are CenterPoint (Houston) TDU, how many EFL links
   are PDFs vs HTML viewer pages, and 5 example EFL URLs (mix of providers). Download 5 of those EFLs into
   test-data/efl-samples/ and say whether each has the 500/1000/2000 kWh average prices printed.
   If the CSV URL fails, try the JSON service (POST http://www.powertochoose.org/en-us/service/v1/,
   method "plans", zip_code "77002") and report what works.
8. Tests (vitest: health handler with Redis mocked), build, lint pass. Codex review before push; fix real findings.

## Done when
- Production URL live + public; /api/health shows redis: true; repo public.
- Data check results are in the handoff (numbers, not guesses).
- Handoff file saved in _coord/handoffs/; BOARD row moved to Done; run _coord/tidy.sh.

## How to test
1. Open the production URL on a phone-size viewport → placeholder shows.
2. /api/health → { ok: true, redis: true }.
3. A preview deployment URL opens without a login.
