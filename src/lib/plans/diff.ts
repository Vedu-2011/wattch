import type { PlanMeta } from "./schema";

/** What changed on Power to Choose since our last read. Pure, so it's tested; scripts/refresh.ts prints it. */
export type PlanDiff = {
  added: PlanMeta[];
  removed: PlanMeta[];
  /** advertised price (PTC's 500/1,000/2,000 kWh numbers) changed */
  priceChanged: { before: PlanMeta; after: PlanMeta }[];
  /** the fine-print link moved, so the label must be fetched again */
  labelMoved: PlanMeta[];
  unchanged: number;
};

const samePrice = (a: PlanMeta["ptc"], b: PlanMeta["ptc"]) => a.k500 === b.k500 && a.k1000 === b.k1000 && a.k2000 === b.k2000;

export function diffPlans(before: PlanMeta[], after: PlanMeta[]): PlanDiff {
  const old = new Map(before.map((m) => [m.id, m]));
  const now = new Map(after.map((m) => [m.id, m]));
  const d: PlanDiff = { added: [], removed: [], priceChanged: [], labelMoved: [], unchanged: 0 };
  for (const m of after) {
    const b = old.get(m.id);
    if (!b) { d.added.push(m); continue; }
    let changed = false;
    if (!samePrice(b.ptc, m.ptc)) { d.priceChanged.push({ before: b, after: m }); changed = true; }
    if (b.eflUrl !== m.eflUrl) { d.labelMoved.push(m); changed = true; }
    if (!changed) d.unchanged++;
  }
  for (const m of before) if (!now.has(m.id)) d.removed.push(m);
  return d;
}

/** Plans that need the AI reader again (new, or their label may be different). Everything else reuses the last read. */
export const needsRead = (d: PlanDiff) => [...d.added, ...d.priceChanged.map((p) => p.after), ...d.labelMoved].map((m) => m.id).filter((id, i, a) => a.indexOf(id) === i);

const name = (m: PlanMeta) => `${m.planName} (${m.provider})`;

/** A short, plain-words report. */
export function diffReport(d: PlanDiff, city: string): string {
  const lines = [`## ${city}: what changed on Power to Choose`, ""];
  lines.push(`- ${d.unchanged} plans unchanged · ${d.added.length} new · ${d.removed.length} gone · ${d.priceChanged.length} advertised price changes · ${d.labelMoved.length} fine-print links moved`);
  const list = (title: string, items: string[]) => {
    if (!items.length) return;
    lines.push("", `### ${title}`);
    for (const s of items.slice(0, 15)) lines.push(`- ${s}`);
    if (items.length > 15) lines.push(`- …and ${items.length - 15} more`);
  };
  list("New", d.added.map((m) => `${name(m)} — ${m.ptc.k1000}¢ at 1,000 kWh`));
  list("Gone", d.removed.map(name));
  list("Advertised price changed (1,000 kWh)", d.priceChanged.map(({ before, after }) => `${name(after)}: ${before.ptc.k1000}¢ → ${after.ptc.k1000}¢`));
  list("Fine-print link moved", d.labelMoved.map(name));
  const n = needsRead(d).length;
  lines.push("", n ? `→ ${n} label${n === 1 ? "" : "s"} need${n === 1 ? "s" : ""} the AI reader again (about $${(n * 0.0067).toFixed(2)}: the Nov 16 Dallas run cost ~0.67¢ per label). Run with --apply.` : "→ No changes on the state's list.");
  lines.push("  A label can also change at the same link without the list changing; --apply re-downloads every label and re-reads only the ones whose text changed.");
  return lines.join("\n");
}
