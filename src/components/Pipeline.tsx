/** The read → check → rank pipeline as a diagram. Every number comes from the data files (passed in), none typed here. */
import { HOW_WORDS } from "@/lib/howWords";

export type PipelineCounts = { total: number; read: number; verified: number; mismatch: number; unread: number; ranked: number };

const Arrow = () => (
  <svg aria-hidden viewBox="0 0 24 24" className="mx-auto h-6 w-6 shrink-0 rotate-90 text-ink-2 lg:rotate-0">
    <path d="M4 12h14m-5-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Pipeline({ c, city, model, lang = "en" }: { c: PipelineCounts; city: string; model: string; lang?: "en" | "es" }) {
  const t = HOW_WORDS[lang];
  const stages = [
    { who: t.s1, n: c.total, t: t.s1t(city), d: t.s1d, tone: "bg-card" },
    { who: t.s2, n: c.read, t: t.s2t, d: t.s2d(model, c.unread), tone: "bg-volt-2" },
    { who: t.s3, n: c.verified, t: t.s3t, d: t.s3d(c.mismatch), tone: "bg-good-2" },
    { who: t.s4, n: c.ranked, t: t.s4t, d: t.s4d, tone: "bg-ink text-paper" },
  ];
  return (
    <figure className="rounded-3xl bg-paper-2 p-4 sm:p-6">
      <figcaption className="text-sm font-semibold text-ink-2">{t.caption(city)}</figcaption>
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
