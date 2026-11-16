"use client";
import { searchPlans } from "@/lib/search";
import Link from "next/link";
import { useMemo, useState } from "react";
import { annualCost } from "@/lib/bill";
import type { ClientPlan, Ranked } from "@/lib/rank";
import { switchLine, switchMath } from "@/lib/switching";
import { CURRENT_WORDS } from "@/lib/wallToolsWords";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const tidy = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();

/** "Already on a plan?" Find yours, say how many months are left, and get a plain switch / wait answer. */
export function CurrentPlan({ plans, best, includeConditional, kwh, seasons, qs, mine = false, city = "Houston", lang = "en" }: {
  plans: ClientPlan[]; best: Ranked; includeConditional: boolean; kwh: number; seasons: boolean; qs: string; mine?: boolean; city?: string; lang?: "en" | "es";
}) {
  const t = CURRENT_WORDS[lang];
  const choices = useMemo(() => plans.filter((p) => p.status === "verified" && p.pricing), [plans]);
  const [q, setQ] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [left, setLeft] = useState(6);
  const words = q.split(/\s+/).filter(Boolean);
  const matches = searchPlans(choices, q); // case- and accent-blind: "energia" finds "Energía"
  const cur = choices.find((p) => p.id === id) ?? null;
  // variable-rate and prepaid plans aren't ranked: their price can change, so a yearly number would be a guess
  const unsure = cur ? cur.prepaid || cur.rateType.toLowerCase() === "variable" : false;
  const annual = cur && !unsure ? annualCost(cur.pricing!, best.months, { includeConditional }) : 0;
  const m = cur && !unsure ? switchMath(annual, best.annual, cur.pricing!, left) : null;
  const f = cur?.pricing!.earlyTerminationFee;

  return (
    <div lang={lang} className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="text-lg font-bold">{t.title}</h2>
      <p className="text-sm text-ink-2">{t.intro}</p>
      {!cur ? (
        <>
          <label htmlFor="cur-q" className="sr-only">{t.search}</label>
          <input
            id="cur-q" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
            placeholder={t.placeholder}
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
          {words.length > 0 && matches.length === 0 && <p className="mt-2 text-sm text-ink-2">{t.none(city)}</p>}
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-paper px-4 py-3">
            <span><span className="font-semibold">{cur.planName}</span> <span className="text-sm text-ink-2">· {tidy(cur.provider)}</span></span>
            <button type="button" onClick={() => { setId(null); setQ(""); }} className="text-sm font-medium underline underline-offset-4">{t.change}</button>
          </div>
          <label className="flex flex-wrap items-center gap-3 text-sm">
            <span>{t.left}</span>
            <input type="number" min={0} max={36} value={left} onChange={(e) => setLeft(Math.max(0, Math.min(36, Math.round(Number(e.target.value) || 0))))}
              className="num w-20 rounded-xl bg-paper px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-volt" />
          </label>
          {unsure && (
            <p className="rounded-2xl bg-volt-2 p-4 text-sm">
              {cur.prepaid ? t.prepaid : t.variable}{t.unsure}{" "}
              <Link className="font-semibold underline" href={`/plan/${best.plan.id}?${qs}`}>{best.plan.planName}</Link>, {money(best.annual)}{t.perYr}.
            </p>
          )}
          {m && (
            <div className={`rounded-2xl p-4 ${m.verdict === "wait" ? "bg-volt-2" : m.verdict === "switch" ? "bg-good-2" : "bg-paper"}`}>
              <p className="text-lg font-semibold">{switchLine(m, left, lang)}</p>
              <dl className="num mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                <div><dt className="font-sans text-ink-2">{t.yours}</dt><dd>{money(annual)}{t.perYr}</dd></div>
                <div><dt className="font-sans text-ink-2">{t.best}</dt><dd>{money(best.annual)}{t.perYr}</dd></div>
                <div><dt className="font-sans text-ink-2">{t.fee}</dt><dd>{money(m.fee)}</dd></div>
                <div><dt className="font-sans text-ink-2">{t.payback}</dt><dd>{m.paybackMonths === null ? "—" : t.mo(m.paybackMonths)}</dd></div>
              </dl>
              <p className="mt-2 text-xs text-ink-2">
                {t.basis(mine, kwh.toLocaleString("en-US"), city, seasons)} {t.feeFrom} {f!.dollars ? t.feeVal(f!.dollars, f!.perMonthRemaining) : t.noFee}.{" "}
                {t.bestPlan} <Link className="underline" href={`/plan/${best.plan.id}?${qs}`}>{best.plan.planName}</Link>.
              </p>
              {m.verdict === "wait" && (
                <Link href={`/remind?plan=${encodeURIComponent(cur!.planName)}${lang === "es" ? "&lang=es" : ""}`} className="mt-3 inline-block rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper">
                  {t.remind}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
