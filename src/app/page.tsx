import { Kapi } from "@/components/Kapi";
import { UsagePicker } from "@/components/UsagePicker";
import { StickyCta } from "@/components/StickyCta";
import { TrapCarousel } from "@/components/TrapCarousel";
import { heroStats } from "@/lib/hero";
import { clientPlans, snapshotInfo } from "@/lib/plans/data";

export default function Home() {
  const verified = snapshotInfo.counts.verified ?? 0;
  const hero = heroStats(clientPlans());
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-volt-2 px-3 py-1 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-good" /> {snapshotInfo.total} Houston plans · fine print read{" "}
            {new Date(snapshotInfo.builtAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <h1 className="display mt-5 text-[2.6rem] font-extrabold leading-[0.95] sm:text-7xl">
            Your power plan&apos;s real price is in the fine print.
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-2 sm:text-lg">
            Texas lets you pick your electricity plan, then hides the real price in a PDF. Wattch reads every Houston
            plan&apos;s fine print, checks its own work against the label, and does the honest math at <em>your</em> usage.
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Stat n={hero.read} label="Houston plans read" />
            <Stat n={verified} label="checked against their label" />
            <Stat n={hero.withTrap} label="with a usage trap" hot />
          </dl>
          <TrapCarousel cards={hero.cards} />
        </div>
        <div className="relative">
          <Kapi reading className="absolute -top-16 right-3 z-10 h-20 w-20 drop-shadow-md sm:-top-20 sm:h-24 sm:w-24" />
          <UsagePicker />
        </div>
      </div>
      <StickyCta />
    </div>
  );
}

function Stat({ n, label, hot = false }: { n: number; label: string; hot?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-3 sm:px-4 ${hot ? "bg-ink text-paper" : "bg-card shadow-[var(--shadow-soft)]"}`}>
      <dt className="sr-only">{label}</dt>
      <dd className={`num text-2xl font-semibold sm:text-3xl leading-none ${hot ? "text-volt" : ""}`}>{n}</dd>
      <dd className={`mt-1 text-xs font-medium ${hot ? "text-paper/70" : "text-ink-2"}`}>{label}</dd>
    </div>
  );
}
