import { MONTHS } from "@/lib/seasons";

/**
 * Your 12 months as bars. With a credit line, months that miss the credit turn red, so the "why" is visible
 * at a glance: summer clears the line, spring and fall don't.
 */
export function YearBars({ months, line, lineLabel, dark = false }: { months: number[]; line?: number; lineLabel?: string; dark?: boolean }) {
  const max = Math.max(...months, line ?? 0) * 1.12;
  const below = (m: number) => line !== undefined && m < line;
  return (
    <figure aria-label={`Your usage by month${line ? `; ${months.filter(below).length} months under ${line.toLocaleString()} kWh` : ""}`}>
      <div className="relative h-32 sm:h-40">
        {line !== undefined && (
          <div className="absolute inset-x-0 z-10 flex translate-y-1/2 items-center gap-2" style={{ bottom: `${(line / max) * 100}%` }}>
            <div className={`h-0 flex-1 border-t-2 border-dashed ${dark ? "border-volt" : "border-ink"}`} />
            {lineLabel && <span className={`num shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${dark ? "bg-volt text-ink" : "bg-ink text-paper"}`}>{lineLabel}</span>}
          </div>
        )}
        <div className="flex h-full items-end gap-1 sm:gap-1.5">
          {months.map((m, i) => (
            <div key={i} className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`rounded-t-md transition-[height] duration-500 ${below(m) ? "bg-over" : dark ? "bg-paper/85" : "bg-ink/80"}`}
                style={{ height: `${(m / max) * 100}%` }}
                title={`${MONTHS[i]}: ${m.toLocaleString()} kWh`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex gap-1 sm:gap-1.5">
        {MONTHS.map((m) => (
          <span key={m} className={`flex-1 text-center text-[0.625rem] sm:text-xs ${dark ? "text-paper/60" : "text-ink-2"}`}>{m[0]}<span className="hidden sm:inline">{m.slice(1)}</span></span>
        ))}
      </div>
    </figure>
  );
}
