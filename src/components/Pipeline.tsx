/** The read → check → rank pipeline as a diagram. Every number comes from the data files (passed in), none typed here. */
export type PipelineCounts = { total: number; read: number; verified: number; mismatch: number; unread: number; ranked: number };

const Arrow = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="mx-auto h-6 w-6 shrink-0 rotate-90 text-ink-2 lg:rotate-0">
    <path d="M4 12h14m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Pipeline({ c, city, model }: { c: PipelineCounts; city: string; model: string }) {
  const stages = [
    { who: "State list", n: c.total, t: `${city} plans`, d: "Power to Choose, the state's plan site", tone: "bg-card" },
    { who: "AI reads", n: c.read, t: "fine-print labels read", d: `${model} copies the numbers and decides nothing. ${c.unread} couldn't be opened or read.`, tone: "bg-volt-2" },
    { who: "Code checks", n: c.verified, t: "verified", d: `Plain code rebuilt all 3 of each label's own prices. ${c.mismatch} didn't add up, so ${c.mismatch === 1 ? "it's" : "they're"} never ranked.`, tone: "bg-good-2" },
    { who: "Code decides", n: c.ranked, t: "ranked for you", d: "Verified plans with a price you can count on (no variable-rate or prepaid), priced at your usage.", tone: "bg-ink text-paper" },
  ];
  return (
    <figure className="rounded-3xl bg-paper-2 p-4 sm:p-6">
      <figcaption className="text-sm font-semibold text-ink-2">From the state&apos;s list to your answer ({city}, latest read)</figcaption>
      <ol className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {stages.map((s, i) => (
          <li key={s.who} className="flex flex-col gap-2 lg:flex-1 lg:flex-row lg:items-stretch">
            {i > 0 && <span className="lg:self-center"><Arrow /></span>}
            <div className={`flex-1 rounded-2xl p-4 shadow-[var(--shadow-soft)] ${s.tone}`}>
              <p className={`text-xs font-bold uppercase tracking-wide ${s.tone.includes("bg-ink") ? "text-volt" : "text-ink-2"}`}>{s.who}</p>
              <p className="num display mt-1 text-4xl font-extrabold leading-none">{s.n}</p>
              <p className="mt-1 font-semibold leading-snug">{s.t}</p>
              <p className={`mt-1 text-sm ${s.tone.includes("bg-ink") ? "text-paper/80" : "text-ink-2"}`}>{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
