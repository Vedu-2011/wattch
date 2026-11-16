import Link from "next/link";
import { notFound } from "next/navigation";
import { CliffChart } from "@/components/CliffChart";
import { Fresh } from "@/components/Fresh";
import { LiveCheck } from "@/components/LiveCheck";
import { YearBars } from "@/components/YearBars";
import { annualCost, billLines, monthlyBill } from "@/lib/bill";
import { whyLine, yearFor } from "@/lib/rank";
import { planById } from "@/lib/plans/data";

/** Reads ?kwh= from the URL, so it renders per request. */
export const instant = false;

export default async function PlanPage({ params, searchParams }: PageProps<"/plan/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const rec = planById(id);
  if (!rec) notFound();
  const k = Math.round(Number(Array.isArray(sp.kwh) ? sp.kwh[0] : sp.kwh));
  const kwh = Number.isFinite(k) && k >= 100 && k <= 5000 ? k : 1000;
  const seasons = (Array.isArray(sp.flat) ? sp.flat[0] : sp.flat) !== "1";
  const p = rec.pricing;
  const months = yearFor(kwh, seasons);
  const year = p ? annualCost(p, months) : 0;
  const why = p ? whyLine(p, months) : null;
  const line = p?.credits.filter((c) => !c.conditional && c.minKwh > 0).sort((a, b) => b.dollars - a.dollars)[0]?.minKwh;
  const back = `kwh=${kwh}${seasons ? "" : "&flat=1"}`;
  const read = new Date(rec.read.fetchedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });
  return (
    <div className="mx-auto max-w-4xl px-5 pt-6">
      <Link href={`/wall?${back}`} className="text-sm font-medium text-ink-2 hover:text-ink">← All plans</Link>
      <h1 className="display mt-3 text-4xl font-extrabold leading-tight">{rec.meta.planName}</h1>
      <p className="mt-1 text-ink-2">{rec.meta.provider} · {rec.meta.rateType} · {p ? `${p.termMonths} months` : ""} · {rec.meta.renewablePct}% renewable</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold">Does our math match the label?</h2>
          {rec.check.rows.length ? (
            <table className="mt-3 w-full text-left">
              <thead className="text-sm text-ink-2"><tr><th className="py-1 font-medium">Usage</th><th className="font-medium">Label says</th><th className="font-medium">We get</th><th /></tr></thead>
              <tbody className="num">
                {rec.check.rows.map((r) => (
                  <tr key={r.kwh}>
                    <td className="py-1">{r.kwh.toLocaleString()} kWh</td><td>{r.printed.toFixed(1)}¢</td><td>{r.ours.toFixed(1)}¢</td>
                    <td className={r.ok ? "text-good" : "text-over"}>{r.ok ? "✓" : "✕"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <p className={`mt-3 rounded-2xl px-3 py-2 text-sm font-medium ${rec.check.status === "verified" ? "bg-good-2" : "bg-volt-2"}`}>
            {rec.check.status === "verified" ? "Verified: all 3 label prices rebuilt within a tenth of a cent." : `Not verified: ${rec.check.message} We don't rank this plan.`}
          </p>
          {rec.check.status === "verified" && (rec.check.tduFilled || !rec.read.parsedBy.startsWith("claude")) && (
            <p className="mt-2 text-sm text-ink-2">{rec.check.message}</p>
          )}
          <LiveCheck id={id} />
          <p className="mt-3 text-xs text-ink-2">
            Fine print fetched {read} CT (<Fresh at={rec.read.fetchedAt} prefix="" />) {rec.read.via === "anakin" ? "through Anakin.io (the page needed a real browser)" : "straight from the provider"} ·{" "}
            {rec.read.parsedBy.startsWith("hand-read") ? rec.read.parsedBy : `read by ${rec.read.parsedBy}`}.{" "}
            <a className="underline" href={rec.meta.eflUrl} target="_blank" rel="noreferrer">Open the original label</a>
          </p>
        </section>
        {p && (
          <section className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-bold">Your bill at <span className="num">{kwh.toLocaleString()}</span> kWh</h2>
            <ul className="num mt-3 space-y-1 text-sm">
              {billLines(p, kwh).map((l, i) => (
                <li key={i} className="flex justify-between gap-3"><span className="font-sans">{l.label}</span><span className={l.dollars < 0 ? "text-good" : ""}>{l.dollars < 0 ? "−" : ""}${Math.abs(l.dollars).toFixed(2)}</span></li>
              ))}
              <li className="mt-2 flex justify-between rounded-xl bg-paper px-2 py-1.5 text-base font-semibold"><span className="font-sans">Total</span><span>${monthlyBill(p, kwh).toFixed(2)}</span></li>
            </ul>
          </section>
        )}
      </div>

      {p && (
        <section className="mt-4 rounded-3xl bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold">Your year on this plan</h2>
            <p className="num text-3xl font-semibold text-volt">${Math.round(year).toLocaleString("en-US")}<span className="text-sm text-paper/70">/yr</span></p>
          </div>
          <p className="mt-1 text-sm text-paper/70">
            {seasons
              ? `Averaging ${kwh.toLocaleString()} kWh, shaped like a real Texas year (more in summer, less in spring and fall).`
              : `${kwh.toLocaleString()} kWh every month.`}{" "}
            <Link className="underline underline-offset-4" href={`/plan/${id}?kwh=${kwh}${seasons ? "&flat=1" : ""}`}>{seasons ? "Show same usage every month" : "Use Texas seasons"}</Link>
          </p>
          {why && <p className="mt-3 text-lg font-semibold"><span className="text-volt">Why?</span> {why}</p>}
          <div className="mt-4"><YearBars months={months} line={line} lineLabel={line ? `credit needs ${line.toLocaleString()} kWh` : undefined} dark /></div>
        </section>
      )}

      {p && (
        <section className="mt-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-bold">Bill at every usage</h2>
          <p className="text-sm text-ink-2">Hover or tap the chart. Red bands are price cliffs.</p>
          <div className="mt-3"><CliffChart pricing={p} kwh={kwh} /></div>
        </section>
      )}

      {p && p.notes.length > 0 && (
        <section className="mt-4 rounded-3xl bg-volt-2 p-5">
          <h2 className="text-lg font-bold">Things the fine print says</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">{p.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          <p className="mt-2 text-xs text-ink-2">Written by the AI reader. The math above never uses these notes.</p>
        </section>
      )}
    </div>
  );
}
