const sources = [
  { name: "Power to Choose — plan list (CSV export)", by: "Public Utility Commission of Texas", url: "https://www.powertochoose.org/en-us/Plan/ExportToCsv", use: "Every plan, its fine-print link, and the prices the state site shows." },
  { name: "16 Tex. Admin. Code § 25.475 — Electricity Facts Label rules", by: "Texas Administrative Code (via Cornell LII)", url: "https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475", use: "Why every label prints average prices at 500, 1,000 and 2,000 kWh — the numbers our check rebuilds." },
  { name: "Backcasted (Actual) Load Profiles, 2023–2025", by: "ERCOT (the Texas grid operator)", url: "https://www.ercot.com/mktinfo/loadprofile/alp", use: "The \"Houston seasons\" shape. ERCOT's 15-minute residential profiles for the Coast weather zone, added up by calendar month: August ≈ 1.63× the yearly average, February ≈ 0.63×. A profile is ERCOT's modeled average home of one type, not one real meter." },
  { name: "Profile Type Counts (Nov 2, 2026 file)", by: "ERCOT", url: "https://www.ercot.com/mktinfo/loadprofile", use: "How many CenterPoint homes ERCOT puts in each home type: 1,868,817 \"low winter\" (RESLOWR) and 650,559 \"high winter\" (RESHIWR, which use more in winter). Wattch mixes the two profiles by these counts." },
  { name: "Form EIA-861M — monthly sales and customers (sales_revenue.xlsx)", by: "U.S. Energy Information Administration", url: "https://www.eia.gov/electricity/data/eia861m/", use: "The average Texas home uses about 1,117 kWh a month (residential sales ÷ customers, 2023–2025) — the hint on the home page. Its statewide month shape (August ≈ 1.46×) was Wattch's first season model; the Houston one above replaced it." },
  { name: "Anakin.io URL Scraper", by: "Anakin.io (Triple H sponsor)", url: "https://anakin.io", use: "Opens fine-print pages that need a real browser or block plain downloads." },
  { name: "Each plan's Electricity Facts Label", by: "The plan's provider", url: "", use: "Linked from every plan page. This is what the AI reads." },
];

export default function Sources() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-8">
      <h1 className="display text-4xl font-extrabold">Sources</h1>
      <p className="mt-2 text-ink-2">Every number in Wattch comes from one of these.</p>
      <ul className="mt-6 space-y-3">
        {sources.map((s) => (
          <li key={s.name} className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-bold">{s.url ? <a className="underline decoration-volt decoration-2 underline-offset-4" href={s.url} target="_blank" rel="noreferrer">{s.name}</a> : s.name}</h2>
            <p className="text-sm text-ink-2">{s.by}</p>
            <p className="mt-1">{s.use}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
