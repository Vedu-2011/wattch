/** Kapi — Wattch's capybara. Original drawing. Reads fine print with a magnifying glass. */
export function Kapi({ className = "", reading = false }: { className?: string; reading?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Kapi the capybara">
      <ellipse cx="32" cy="40" rx="22" ry="17" fill="#a8774a" />
      <ellipse cx="32" cy="42" rx="16" ry="11" fill="#c08f5f" />
      <rect x="15" y="16" width="34" height="26" rx="13" fill="#a8774a" />
      <ellipse cx="20" cy="17" rx="4" ry="3.2" fill="#7d5533" />
      <ellipse cx="44" cy="17" rx="4" ry="3.2" fill="#7d5533" />
      <rect x="22" y="27" width="20" height="13" rx="6.5" fill="#8f6339" />
      <ellipse cx="27" cy="31" rx="1.6" ry="1.2" fill="#3b2614" />
      <ellipse cx="37" cy="31" rx="1.6" ry="1.2" fill="#3b2614" />
      <circle cx="23.5" cy="24" r="2.3" fill="#1b1611" />
      <circle cx="40.5" cy="24" r="2.3" fill="#1b1611" />
      <circle cx="24.2" cy="23.3" r="0.7" fill="#fff" />
      <circle cx="41.2" cy="23.3" r="0.7" fill="#fff" />
      <path d="M28 36 q4 2.4 8 0" stroke="#3b2614" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {reading ? (
        <g>
          <circle cx="48" cy="44" r="7" fill="#fff1b8" fillOpacity=".75" stroke="#1b1611" strokeWidth="2.4" />
          <path d="M53 49 l6 6" stroke="#1b1611" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : (
        <path d="M30 6 l-3 7 h4 l-2 6 l6 -9 h-4 l2 -4 z" fill="#ffcf2e" stroke="#1b1611" strokeWidth="1.2" strokeLinejoin="round" />
      )}
    </svg>
  );
}
