"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { belongs, type Segment } from "@/lib/finePrint";

type Ctx = { active: string | null; set: (k: string | null) => void; sticky: boolean; setSticky: (s: boolean) => void };
const HL = createContext<Ctx>({ active: null, set: () => {}, sticky: false, setSticky: () => {} });

/** Shares "which number is lit" between the bill lines, the check rows and the label text. */
export function HighlightScope({ children }: { children: ReactNode }) {
  const [active, set] = useState<string | null>(null);
  const [sticky, setSticky] = useState(false);
  return <HL.Provider value={{ active, set, sticky, setSticky }}>{children}</HL.Provider>;
}

/** Hover, focus or tap something (a bill line, a check row) to light up its number in the label. */
export function HoverKey({ k, as = "li", className = "", children, found = true }: { k: string; as?: "li" | "tr"; className?: string; children: ReactNode; found?: boolean }) {
  const { active, set, sticky, setSticky } = useContext(HL);
  const on = active !== null && belongs(k, active);
  const Tag = as;
  return (
    <Tag
      tabIndex={found ? 0 : -1}
      data-on={on || undefined}
      title={found ? "Show this number in the label" : "This number isn't printed on the label"}
      onMouseEnter={() => !sticky && found && set(k)}
      onMouseLeave={() => !sticky && set(null)}
      onFocus={() => found && set(k)}
      onBlur={() => !sticky && set(null)}
      onClick={() => {
        if (!found) return;
        const same = active === k && sticky;
        setSticky(!same);
        set(same ? null : k);
      }}
      className={`${found ? "cursor-pointer" : ""} rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-volt data-[on]:bg-volt/40 ${className}`}
    >
      {children}
    </Tag>
  );
}

/** The label text, with every number the math uses marked; the lit one glows and scrolls into view. */
export function LabelText({ segments }: { segments: Segment[] }) {
  const { active, sticky } = useContext(HL);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || !box.current) return;
    const el = [...box.current.querySelectorAll<HTMLElement>("mark[data-key]")].find((m) => belongs(m.dataset.key!, active));
    if (!el) return;
    const b = box.current;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const top = el.offsetTop - b.clientHeight / 3; // the box is position:relative, so offsetTop is inside it
    b.scrollTo({ top, behavior });
    // a tap/click (not a hover): if the label is off-screen, bring it into view so the glow is seen
    const r = b.getBoundingClientRect();
    if (sticky && (r.top > window.innerHeight - 120 || r.bottom < 120)) b.scrollIntoView({ block: "center", behavior });
  }, [active, sticky]);
  return (
    <div ref={box} className="relative max-h-[28rem] overflow-auto rounded-2xl bg-paper p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words" tabIndex={0} aria-label="The plan's fine-print label text">
      {segments.map((s, i) => {
        if (!s.key) return <span key={i}>{s.text}</span>;
        const on = active !== null && belongs(s.key, active);
        const avg = s.key.startsWith("avg-");
        return (
          <mark
            key={i}
            data-key={s.key}
            className={`rounded px-0.5 text-ink transition-all ${avg ? "bg-good-2" : "bg-volt-2"} ${on ? "!bg-volt font-bold shadow-[0_0_0_3px_var(--color-volt)]" : ""}`}
          >
            {s.text}
          </mark>
        );
      })}
    </div>
  );
}
