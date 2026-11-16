import type { Metadata } from "next";
import { Kapi } from "@/components/Kapi";
import { Pipeline } from "@/components/Pipeline";
import { areaInfo, pipelineCounts, snapshotInfo } from "@/lib/plans/data";
import { AREAS } from "@/lib/plans/ptc";

/** "claude-haiku-5-5" → "Claude Haiku" */
const niceModel = (m: string) => m.split("-").filter((w) => !/^\d/.test(w)).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const steps = [
  { t: "Get every plan", d: "Wattch downloads the full plan list from Power to Choose, the state of Texas's official plan site, and keeps the Houston (CenterPoint) and Dallas–Fort Worth (Oncor) plans." },
  { t: "Open the fine print", d: "Every plan has an Electricity Facts Label, usually a PDF. When a provider's page only works in a real browser or blocks plain downloads, Anakin.io opens it for us." },
  { t: "AI reads", d: "An AI reader copies the numbers off each label: energy price, delivery charges, base fee, bill credits, minimum-use fees, time-of-use splits. It does not decide anything." },
  { t: "Code checks the AI", d: "Texas makes every label print its average price at 500, 1,000 and 2,000 kWh. Plain code rebuilds those three prices from what the AI read. If all three match to a tenth of a cent, the plan is verified. If not, the AI gets one more try with the exact mismatch. Then a few free second chances: some labels keep their prices in PDF form fields, which plain code reads; a handful were read by hand. Every one of those still has to pass the same three-price check. Still wrong? The plan is shown as not verified and never ranked." },
  { t: "Real Houston seasons", d: "Nobody uses the same power every month. Wattch spreads your average over 12 months the way Houston homes really use power: ERCOT's grid data for the Coast weather zone, 2023–2025, mixed by how many CenterPoint homes are in each of its two home types. August comes out at about 2.6× February. That's where bill-credit plans hurt: you miss the credit in the mild months. Dallas–Fort Worth gets its own shape the same way, from the North Central zone and Oncor's homes: August is about 1.8× February there, and January runs high because more homes heat with electricity." },
  { t: "Code decides", d: "Your bill at your usage, the ranking, the yearly cost, the price cliffs and every \"why\" line are plain math with tests. Same inputs, same answer, every time. Variable-rate plans aren't ranked, because their price can change every month." },
];

export const metadata: Metadata = {
  title: "How Wattch works — AI reads, code checks",
  description: "How Wattch reads each plan's fine-print label with AI, then rebuilds the label's own prices in code to prove the reading is right.",
};

export default function How() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-8">
      <h1 className="display text-4xl font-extrabold">How Wattch works</h1>
      <p className="mt-2 text-lg text-ink-2">AI reads. Code checks. Code decides.</p>
      <div className="mt-6 space-y-4">
        {(["houston", "dallas"] as const).map((a) => (
          <Pipeline key={a} c={pipelineCounts(a)} city={AREAS[a].city} model={niceModel(areaInfo(a).model)} />
        ))}
      </div>
      <ol className="mt-8 space-y-4">
        {steps.map((s, i) => (
          <li key={s.t} className="flex gap-4 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <span className="display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-volt text-lg font-extrabold">{i + 1}</span>
            <div><h2 className="text-lg font-bold">{s.t}</h2><p className="mt-1 text-ink-2">{s.d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex items-center gap-4 rounded-3xl bg-good-2 p-5">
        <Kapi reading className="h-14 w-14 shrink-0" />
        <p>
          Last full read: <b>{new Date(snapshotInfo.builtAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</b>.{" "}
          {snapshotInfo.counts.verified ?? 0} of {snapshotInfo.total} plans verified, {snapshotInfo.counts.mismatch ?? 0} didn&apos;t add up,{" "}
          {snapshotInfo.counts.unread ?? 0} couldn&apos;t be opened. Reader: {snapshotInfo.model}.
        </p>
      </div>
    </div>
  );
}
