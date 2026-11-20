/**
 * Kapi — Wattch's capybara. Original drawing.
 * Poses: default (lightning bolt), reading (magnifying glass), thinking, surprised, celebrating.
 * Decorative: the words next to Kapi always say what is going on, so screen readers skip it (in every language).
 */
export type KapiPose = "default" | "reading" | "thinking" | "surprised" | "celebrating";

export function Kapi({ className = "", reading = false, pose }: { className?: string; reading?: boolean; pose?: KapiPose }) {
  const p: KapiPose = pose ?? (reading ? "reading" : "default");
  const ink = "#1b1611", brown = "#3b2614";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="32" cy="40" rx="22" ry="17" fill="#a8774a" />
      <ellipse cx="32" cy="42" rx="16" ry="11" fill="#c08f5f" />
      <rect x="15" y="16" width="34" height="26" rx="13" fill="#a8774a" />
      {/* ears: perk up when surprised */}
      <ellipse cx="20" cy={p === "surprised" ? 15 : 17} rx="4" ry={p === "surprised" ? 4 : 3.2} fill="#7d5533" />
      <ellipse cx="44" cy={p === "surprised" ? 15 : 17} rx="4" ry={p === "surprised" ? 4 : 3.2} fill="#7d5533" />
      <rect x="22" y="27" width="20" height="13" rx="6.5" fill="#8f6339" />
      <ellipse cx="27" cy="31" rx="1.6" ry="1.2" fill={brown} />
      <ellipse cx="37" cy="31" rx="1.6" ry="1.2" fill={brown} />

      {/* eyes */}
      {p === "celebrating" ? (
        <>
          <path d="M21 25 q2.5 -3.2 5 0" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M38 25 q2.5 -3.2 5 0" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      ) : p === "surprised" ? (
        <>
          <circle cx="23.5" cy="23.5" r="3.3" fill="#fff" />
          <circle cx="40.5" cy="23.5" r="3.3" fill="#fff" />
          <circle cx="23.5" cy="23.5" r="1.9" fill={ink} />
          <circle cx="40.5" cy="23.5" r="1.9" fill={ink} />
        </>
      ) : (
        <>
          <circle cx={p === "thinking" ? 24.3 : 23.5} cy={p === "thinking" ? 23.2 : 24} r="2.3" fill={ink} />
          <circle cx={p === "thinking" ? 41.3 : 40.5} cy={p === "thinking" ? 23.2 : 24} r="2.3" fill={ink} />
          <circle cx={p === "thinking" ? 25 : 24.2} cy={p === "thinking" ? 22.4 : 23.3} r="0.7" fill="#fff" />
          <circle cx={p === "thinking" ? 42 : 41.2} cy={p === "thinking" ? 22.4 : 23.3} r="0.7" fill="#fff" />
        </>
      )}

      {/* mouth */}
      {p === "surprised" ? (
        <ellipse cx="32" cy="36.5" rx="2.2" ry="2.6" fill={brown} />
      ) : p === "thinking" ? (
        <path d="M29 36.5 h6" stroke={brown} strokeWidth="1.4" strokeLinecap="round" />
      ) : p === "celebrating" ? (
        <path d="M27.5 35 q4.5 4.5 9 0 z" fill={brown} stroke={brown} strokeWidth="1" strokeLinejoin="round" />
      ) : (
        <path d="M28 36 q4 2.4 8 0" stroke={brown} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}

      {/* extras */}
      {p === "reading" && (
        <g>
          <circle cx="48" cy="44" r="7" fill="#fff1b8" fillOpacity=".75" stroke={ink} strokeWidth="2.4" />
          <path d="M53 49 l6 6" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {p === "default" && (
        <path d="M30 6 l-3 7 h4 l-2 6 l6 -9 h-4 l2 -4 z" fill="#ffcf2e" stroke={ink} strokeWidth="1.2" strokeLinejoin="round" />
      )}
      {p === "thinking" && (
        <g>
          <circle cx="48" cy="14" r="1.3" fill="#fff1b8" stroke={ink} strokeWidth="0.9" />
          <circle cx="51.5" cy="10.5" r="1.9" fill="#fff1b8" stroke={ink} strokeWidth="0.9" />
          <circle cx="57" cy="6" r="5" fill="#fff1b8" stroke={ink} strokeWidth="1" />
          <path d="M55.2 4.6 q1.8 -2 3.6 0 q0 1.4 -1.8 2 v1" stroke={ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <circle cx="57" cy="9.4" r="0.7" fill={ink} />
        </g>
      )}
      {p === "surprised" && (
        <g stroke="#ffcf2e" strokeWidth="2.2" strokeLinecap="round">
          <path d="M11 9 l3 4" />
          <path d="M32 3 v5" />
          <path d="M53 9 l-3 4" />
        </g>
      )}
      {p === "celebrating" && (
        <g>
          <path d="M9 12 l1.6 3.4 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5 z" fill="#ffcf2e" stroke={ink} strokeWidth=".8" strokeLinejoin="round" />
          <path d="M55 8 l1.2 2.6 2.8 .4 -2 1.9 .5 2.8 -2.5 -1.3 -2.5 1.3 .5 -2.8 -2 -1.9 2.8 -.4 z" fill="#ffcf2e" stroke={ink} strokeWidth=".8" strokeLinejoin="round" />
          <circle cx="32" cy="6" r="1.6" fill="#136b44" />
          <rect x="46" y="20" width="3" height="3" rx=".6" transform="rotate(20 47.5 21.5)" fill="#b3301d" />
          <rect x="13" y="24" width="3" height="3" rx=".6" transform="rotate(-20 14.5 25.5)" fill="#2f5fd0" />
        </g>
      )}
    </svg>
  );
}
