import { createHash } from "node:crypto";
import { labelCheck, type CheckRow } from "@/lib/bill";
import { PlanPricing, type PlanRecord } from "@/lib/plans/schema";
import { fillTdu, grounded } from "./parse";
import { ptcAveragesOnLabel, readSoFedForm } from "./templates";

export type TduCandidate = { cents: number; monthly: number };
/** A hand-read pinned to the exact label text it was read from (sha256 of data/text/<id>.txt). */
export type ManualRead = { id: string; plan: string; textSha256: string; readBy: string; why: string; pricing: PlanPricing };

export const textSha = (text: string) => createHash("sha256").update(text).digest("hex");

type Fix = { pricing: PlanPricing; rows: CheckRow[]; tduFilled: boolean; parsedBy: string; message: string };

/** Label check, and if the label doesn't print delivery charges, try CenterPoint's from other labels. */
function check(p: PlanPricing, tdu: TduCandidate[]): { pricing: PlanPricing; rows: CheckRow[]; tduFilled: boolean } | null {
  const c = labelCheck(p);
  if (c.ok) return { pricing: p, rows: c.rows, tduFilled: false };
  const f = fillTdu(p, tdu);
  return f ? { ...f, tduFilled: true } : null;
}

/**
 * Second chances for a plan whose first read didn't add up, cheapest first. Every path ends in the same
 * code check: the three printed averages must be on the label and must rebuild to ±0.1¢.
 * 1. The reader's prices were fine but it copied a wrong average → use Power to Choose's, if the label prints them.
 * 2. Ranchero / Southern Federal form-field labels → read by code (templates.ts).
 * 3. A hand-read of this exact label text (same sha256) in data/manual/.
 */
export function rescue(rec: PlanRecord, text: string, tdu: TduCandidate[], manual?: ManualRead, draft?: PlanPricing | null): Fix | null {
  const ptc = rec.meta.ptc;
  // the reader's read, or (when its averages weren't on the label) its draft — code re-checks either way
  const read = rec.pricing ?? draft ?? null;
  if (read) {
    for (const s of slipFixes(read)) {
      const c = check(s.pricing, tdu);
      if (c) return { ...c, parsedBy: `${rec.read.parsedBy} + code fix`, message: `${s.why} With that fixed, all 3 averages match.` };
    }
  }
  if (read && ptcAveragesOnLabel(text, ptc)) {
    const p = { ...read, labelAvg: { ...ptc } };
    const c = check(p, tdu);
    if (c) return { ...c, parsedBy: `${rec.read.parsedBy} + averages from Power to Choose`, message: "The reader copied one average wrong; with the averages the label prints, all 3 match." };
  }
  const form = readSoFedForm(text, ptc);
  if (form) {
    const c = check(form, tdu);
    if (c) return { ...c, parsedBy: "code (form-field reader)", message: "Read by code from the label's form fields; all 3 averages match." };
  }
  if (manual && manual.textSha256 === textSha(text)) {
    const parsed = PlanPricing.safeParse(manual.pricing);
    if (parsed.success && grounded(text, parsed.data)) {
      const c = check(parsed.data, tdu);
      if (c) return { ...c, parsedBy: manual.readBy, message: `Hand-read, then checked by code: all 3 averages match. ${manual.why}` };
    }
  }
  return null;
}

/**
 * Small, known reader slips, each fixed by code. A fix is only kept if the label check then passes.
 * - "credit if usage greater than 1,000 kWh" read as 1000.01 while the label's own 1,000 kWh average includes the credit.
 * - "Day Hours energy credited back" read as a NEGATIVE price on that share, instead of 0¢ (free).
 */
export function slipFixes(p: PlanPricing): { pricing: PlanPricing; why: string }[] {
  const out: { pricing: PlanPricing; why: string }[] = [];
  if (p.credits.some((c) => !Number.isInteger(c.minKwh))) {
    out.push({
      pricing: { ...p, credits: p.credits.map((c) => ({ ...c, minKwh: Math.floor(c.minKwh) })) },
      why: "The reader started the credit just above a round number (like 1,000.01 kWh), but the label counts it at exactly that usage.",
    });
  }
  const pos = new Set(p.touPeriods.filter((t) => t.cents > 0).map((t) => t.cents));
  if (p.touPeriods.some((t) => t.cents < 0 && pos.has(-t.cents))) {
    out.push({
      pricing: { ...p, touPeriods: p.touPeriods.map((t) => (t.cents < 0 && pos.has(-t.cents) ? { ...t, cents: 0 } : t)) },
      why: "The reader counted credited-back hours as a negative price; on the label those hours are free (0¢).",
    });
  }
  return out;
}

/** The CenterPoint delivery charges most verified labels print, most common first. */
export function tduCandidates(plans: PlanRecord[]): TduCandidate[] {
  const pairs = new Map<string, TduCandidate & { n: number }>();
  for (const r of plans) {
    if (r.check.status !== "verified" || !r.pricing || r.check.tduFilled || !r.pricing.tduMonthlyDollars) continue;
    const k = `${r.pricing.tduCentsPerKwh}|${r.pricing.tduMonthlyDollars}`;
    const e = pairs.get(k) ?? { cents: r.pricing.tduCentsPerKwh, monthly: r.pricing.tduMonthlyDollars, n: 0 };
    e.n++;
    pairs.set(k, e);
  }
  return [...pairs.values()].sort((a, b) => b.n - a.n).slice(0, 3).map(({ cents, monthly }) => ({ cents, monthly }));
}
