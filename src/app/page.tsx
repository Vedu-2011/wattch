import { Kapi } from "@/components/Kapi";
import { UsagePicker } from "@/components/UsagePicker";
import { snapshotInfo } from "@/lib/plans/data";

export default function Home() {
  const verified = snapshotInfo.counts.verified ?? 0;
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-volt-2 px-3 py-1 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-good" /> {snapshotInfo.total} Houston plans · fine print read{" "}
            {new Date(snapshotInfo.builtAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <h1 className="display mt-5 text-5xl font-extrabold leading-[0.95] sm:text-7xl">
            Your power plan&apos;s real price is in the fine print.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            Texas lets you pick your electricity plan, then hides the real price in a PDF. Wattch reads every Houston
            plan&apos;s fine print, checks its own work against the label, and does the honest math at <em>your</em> usage.
          </p>
          <p className="mt-3 text-sm text-ink-2">{verified} plans checked to the cent so far.</p>
        </div>
        <div className="relative">
          <Kapi reading className="absolute -top-14 right-4 h-24 w-24 drop-shadow-md" />
          <UsagePicker />
        </div>
      </div>
    </div>
  );
}
