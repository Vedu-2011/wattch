const sources = [
  { name: "Power to Choose — plan list (CSV export)", by: "Public Utility Commission of Texas", url: "https://www.powertochoose.org/en-us/Plan/ExportToCsv", use: "Every plan, its fine-print link, and the prices the state site shows." },
  { name: "16 Tex. Admin. Code § 25.475 — Electricity Facts Label rules", by: "Texas Administrative Code (via Cornell LII)", url: "https://www.law.cornell.edu/regulations/texas/16-Tex-Admin-Code-SS-25-475", use: "Why every label prints average prices at 500, 1,000 and 2,000 kWh — the numbers our check rebuilds." },
  { name: "Form EIA-861M — monthly sales and customers (sales_revenue.xlsx)", by: "U.S. Energy Information Administration", url: "https://www.eia.gov/electricity/data/eia861m/", use: "The \"Texas seasons\" shape: Texas residential kWh per customer for each month, 2023–2025. August ≈ 1.46× the yearly average, April ≈ 0.71×; the average Texas home uses about 1,117 kWh a month. Statewide, not Houston-only, and by billing month." },
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
