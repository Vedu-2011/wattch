import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { clientPlans } = await import("@/lib/plans/data");
const { headline } = await import("@/lib/headline");

// The deck, Devpost, script and judge Q&A must say what the data says. The state's list moves (plans leave it),
// so when data/delisted.json changes, this test points at every doc line that is now out of date.
const DOCS = ["docs/DECK.md", "docs/DEVPOST.md", "docs/SCRIPT.md", "docs/JUDGE-QA.md", "docs/SOURCES.md", "README.md"];
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

describe("presenter docs match the data", () => {
  const h = headline(clientPlans("houston"), "houston");
  const d = headline(clientPlans("dallas"), "dallas");
  const ranks = new Set([`${h.pickRank}/${h.ranked.length}`, `${d.pickRank}/${d.ranked.length}`]);

  for (const f of DOCS) {
    it(f, () => {
      const text = readFileSync(f, "utf8");
      // "#69 of 139", "#69 of 139 ⟲", "69 ⟲ out of 139" — a rank claim (not "171 of 172 verified")
      const re = /#(\d+)(?: ⟲)? of (\d{3})\b|\b(\d+)(?: ⟲)? out of (\d{3})\b/g;
      for (const m of text.matchAll(re)) {
        const [rank, of] = m[1] ? [m[1], m[2]] : [m[3], m[4]];
        expect(ranks.has(`${rank}/${of}`), `${f}: "${m[0]}" — data says #${h.pickRank} of ${h.ranked.length} (Houston), #${d.pickRank} of ${d.ranked.length} (Dallas)`).toBe(true);
      }
    });
  }

  it("the headline dollar gaps appear in the deck, Devpost and script", () => {
    for (const f of ["docs/DECK.md", "docs/DEVPOST.md", "docs/SCRIPT.md"]) {
      const text = readFileSync(f, "utf8").replace(/(\d) (dollars)/g, "$1 $2");
      const has = (n: number) => text.includes(money(n)) || text.includes(`${Math.round(n)} dollars`);
      expect(has(h.gap), `${f} should say ${money(h.gap)} (Houston)`).toBe(true);
      expect(has(d.gap), `${f} should say ${money(d.gap)} (Dallas)`).toBe(true);
    }
  });
});
