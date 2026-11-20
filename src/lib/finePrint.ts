import type { PlanPricing } from "@/lib/plans/schema";

/**
 * Finds, in the label text, every number the bill math uses, so the plan page can light it up.
 * Keys match BillLine.key: energy, base, tduKwh, tduMonthly, fee-i, amort-i, credit-i — plus avg-500/1000/2000
 * (the three printed averages the check rebuilds) and etf. Code only; nothing here is guessed by AI.
 */
export type Segment = { text: string; key?: string };
export type Target = { key: string; label: string };

/** The ways a label might print a cents-per-kWh price: 13.097 → "13.097", "13.0970", "$0.130970", "0.13097". */
export function centsForms(c: number): string[] {
  const out = new Set<string>();
  for (let d = 1; d <= 4; d++) if (Number(c.toFixed(d)) === c) out.add(c.toFixed(d));
  for (let d = 2; d <= 6; d++) if (Number(c.toFixed(d)) === c) out.add(c.toFixed(d)); // padded "13.0970", "6.533300"
  out.add(String(c));
  const dollars = c / 100;
  for (let d = 3; d <= 6; d++) if (Math.abs(Number(dollars.toFixed(d)) - dollars) < 1e-9) out.add(dollars.toFixed(d));
  return [...out].filter((f) => /\./.test(f) || Number(f) >= 10);
}

/** Dollar amounts: 4.95 → "4.95"; whole dollars only with a $ or ".00" (so "125" in "125 kWh" isn't a fee). */
function dollarPatterns(v: number): RegExp[] {
  if (!(v > 0)) return [];
  const esc = (s: string) => s.replace(/[.$]/g, (m) => "\\" + m);
  if (Number.isInteger(v)) {
    const whole = v.toLocaleString("en-US");
    return [new RegExp(`\\$ ?(?:${esc(whole)}|${v})(?:\\.00)?(?![\\d,])`, "g"), new RegExp(`(?<![\\d.])(?:${esc(whole)}|${v})\\.00(?!\\d)`, "g")];
  }
  return [new RegExp(`(?<![\\d.])${esc(v.toFixed(2))}(?!\\d)`, "g")];
}

function centsPatterns(c: number): RegExp[] {
  if (!(c > 0)) return [];
  return centsForms(c).map((f) => new RegExp(`(?<![\\d.])${f.replace(".", "\\.")}(?!\\d)`, "g"));
}

export function targets(p: PlanPricing, opts: { tduFilled?: boolean } = {}): (Target & { patterns: RegExp[] })[] {
  const t: (Target & { patterns: RegExp[] })[] = [];
  const avg = [[500, p.labelAvg.k500], [1000, p.labelAvg.k1000], [2000, p.labelAvg.k2000]] as const;
  for (const [k, v] of avg) t.push({ key: `avg-${k}`, label: `Average at ${k.toLocaleString("en-US")} kWh`, patterns: centsPatterns(v) });
  p.energyTiers.forEach((e, i) => t.push({ key: `energy-tier-${i}`, label: "Energy price", patterns: centsPatterns(e.cents) }));
  p.touPeriods.forEach((e, i) => t.push({ key: `energy-tou-${i}`, label: e.label, patterns: centsPatterns(Math.abs(e.cents)) }));
  if (!opts.tduFilled) {
    t.push({ key: "tduKwh", label: "Delivery per kWh", patterns: centsPatterns(p.tduCentsPerKwh) });
    t.push({ key: "tduMonthly", label: "Delivery monthly fee", patterns: dollarPatterns(p.tduMonthlyDollars) });
  }
  t.push({ key: "base", label: "Base charge", patterns: dollarPatterns(p.baseChargeDollars) });
  p.usageFees.forEach((f, i) => t.push({ key: `fee-${i}`, label: f.label, patterns: dollarPatterns(f.dollars) }));
  p.amortizedFees.forEach((f, i) => t.push({ key: `amort-${i}`, label: f.label, patterns: dollarPatterns(f.dollars) }));
  p.credits.forEach((c, i) => t.push({ key: `credit-${i}`, label: c.label, patterns: dollarPatterns(c.dollars) }));
  t.push({ key: "etf", label: "Early termination fee", patterns: dollarPatterns(p.earlyTerminationFee.dollars) });
  return t;
}

/**
 * Splits the label into plain and highlighted pieces. Earlier targets win overlaps (the averages first, since
 * they're what the check proves). At most 3 hits per number, so a common value can't paint the whole page.
 */
export function labelSegments(text: string, p: PlanPricing, opts: { tduFilled?: boolean } = {}): { segments: Segment[]; found: Record<string, number> } {
  const hits: { start: number; end: number; key: string }[] = [];
  const found: Record<string, number> = {};
  const free = (s: number, e: number) => hits.every((h) => e <= h.start || s >= h.end);
  for (const t of targets(p, opts)) {
    let n = 0;
    for (const re of t.patterns) {
      for (const m of text.matchAll(re)) {
        const s = m.index!, e = s + m[0].length;
        if (n < (t.key.startsWith("avg-") ? 1 : 3) && free(s, e)) { hits.push({ start: s, end: e, key: t.key }); n++; }
      }
    }
    found[t.key] = n;
  }
  hits.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let at = 0;
  for (const h of hits) {
    if (h.start > at) segments.push({ text: text.slice(at, h.start) });
    segments.push({ text: text.slice(h.start, h.end), key: h.key });
    at = h.end;
  }
  if (at < text.length) segments.push({ text: text.slice(at) });
  return { segments, found };
}

/** Does a highlighted piece belong to this bill line? ("energy" lights every tier and time-of-use price.) */
export const belongs = (segKey: string, lineKey: string) => segKey === lineKey || segKey.startsWith(lineKey + "-");
