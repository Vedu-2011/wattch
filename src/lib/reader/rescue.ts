import { labelCheck, type CheckRow } from "@/lib/bill";
import { PlanPricing, type PlanRecord } from "@/lib/plans/schema";
import { fillTdu, grounded } from "./parse";
import { ptcAveragesOnLabel, readSoFedForm } from "./templates";

export type TduCandidate = { cents: number; monthly: number };
export type ManualRead = { id: string; plan: string; sha256: string; readBy: string; why: string; pricing: PlanPricing };

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
 * 3. A hand-read of this exact file (same sha256) in data/manual/.
 */
export function rescue(rec: PlanRecord, text: string, tdu: TduCandidate[], manual?: ManualRead): Fix | null {
  const ptc = rec.meta.ptc;
  if (rec.pricing && ptcAveragesOnLabel(text, ptc)) {
    const p = { ...rec.pricing, labelAvg: { ...ptc } };
    const c = check(p, tdu);
    if (c) return { ...c, parsedBy: `${rec.read.parsedBy} + averages from Power to Choose`, message: "The reader copied one average wrong; with the averages the label prints, all 3 match." };
  }
  const form = readSoFedForm(text, ptc);
  if (form) {
    const c = check(form, tdu);
    if (c) return { ...c, parsedBy: "code (form-field reader)", message: "Read by code from the label's form fields; all 3 averages match." };
  }
  if (manual && manual.sha256 === rec.read.sha256) {
    const parsed = PlanPricing.safeParse(manual.pricing);
    if (parsed.success && grounded(text, parsed.data)) {
      const c = check(parsed.data, tdu);
      if (c) return { ...c, parsedBy: manual.readBy, message: `Hand-read, then checked by code: all 3 averages match. ${manual.why}` };
    }
  }
  return null;
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
