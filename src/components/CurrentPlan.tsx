"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { annualCost } from "@/lib/bill";
import type { ClientPlan, Ranked } from "@/lib/rank";
import { switchLine, switchMath } from "@/lib/switching";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();

/** "Already on a plan?" Find yours, say how many months are left, and get a plain switch / wait answer. */
export function CurrentPlan({ plans, best, includeConditional, kwh, seasons }: {
  plans: ClientPlan[]; best: Ranked; includeConditional: boolean; kwh: number; seasons: boolean;
}) {
  const choices = useMemo(() => plans.filter((p) => p.status === "verified" && p.pricing), [plans]);
  const [q, setQ] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [left, setLeft] = useState(6);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = words.length ? choices.filter((p) => words.every((w) => `${p.provider} ${p.planName}`.toLowerCase().includes(w))).slice(0, 6) : [];
  const cur = choices.find((p) => p.id === id) ?? null;
  const annual = cur ? annualCost(cur.pricing!, best.months, { includeConditional }) : 0;
  const m = cur ? switchMath(annual, best.annual, cur.pricing!, left) : null;
  const f = cur?.pricing!.earlyTerminationFee;

  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-bold">Already on a plan?</h2>
      <p className="text-sm text-ink-2">Find it, and Wattch does the switching math with its own early-exit fee.</p>
      {!cur ? (
        <>
          <label htmlFor="cur-q" className="sr-only">Search your current plan</label>
          <input
            id="cur-q" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
            placeholder="Type your provider or plan, like “TXU” or “Simple Saver”"
            className="mt-3 w-full rounded-2xl bg-paper px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-volt"
          />
          {matches.length > 0 && (
            <ul className="mt-2 space-y-1">
              {matches.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setId(p.id)} className="w-full rounded-xl px-3 py-2 text-left hover:bg-volt-2 focus-visible:bg-volt-2 focus-visible:outline-none">
                    <span className="font-semibold">{p.planName}</span> <span className="text-sm text-ink-2">· {tidy(p.provider)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {words.length > 0 && matches.length === 0 && <p className="mt-2 text-sm text-ink-2">No Houston plan we verified matches that. Try just the provider&apos;s name.</p>}
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper px-4 py-3">
            <span><span className="font-semibold">{cur.planName}</span> <span className="text-sm text-ink-2">· {tidy(cur.provider)}</span></span>
            <button type="button" onClick={() => { setId(null); setQ(""); }} className="text-sm font-medium underline underline-offset-4">Change</button>
          </div>
          <label className="flex flex-wrap items-center gap-3 text-sm">
            <span>Months left on your contract</span>
            <input type="number" min={0} max={36} value={left} onChange={(e) => setLeft(Math.max(0, Math.min(36, Math.round(Number(e.target.value) || 0))))}
              className="num w-20 rounded-xl bg-paper px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-volt" />
          </label>
          {m && (
            <div className={`rounded-2xl p-4 ${m.verdict === "wait" ? "bg-volt-2" : m.verdict === "switch" ? "bg-good-2" : "bg-paper"}`}>
              <p className="text-lg font-semibold">{switchLine(m, left)}</p>
              <dl className="num mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                <div><dt className="font-sans text-ink-2">Your plan</dt><dd>{money(annual)}/yr</dd></div>
                <div><dt className="font-sans text-ink-2">Best plan</dt><dd>{money(best.annual)}/yr</dd></div>
                <div><dt className="font-sans text-ink-2">Exit fee now</dt><dd>{money(m.fee)}</dd></div>
                <div><dt className="font-sans text-ink-2">Pays back in</dt><dd>{m.paybackMonths === null ? "—" : `${m.paybackMonths} mo`}</dd></div>
              </dl>
              <p className="mt-2 text-xs text-ink-2">
                Same {kwh.toLocaleString()} kWh average{seasons ? " with Houston seasons" : ""}, today&apos;s prices, before taxes. Exit fee from your
                plan&apos;s label: {f!.dollars ? `$${f!.dollars}${f!.perMonthRemaining ? " × months left" : ""}` : "none listed"}.{" "}
                Best plan: <Link className="underline" href={`/plan/${best.plan.id}?kwh=${kwh}${seasons ? "" : "&flat=1"}`}>{best.plan.planName}</Link>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
