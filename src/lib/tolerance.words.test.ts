import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CHECK_TOLERANCE } from "./bill";

// The label check allows ±0.11¢ (labels round to 0.1¢), so the app must never claim an exact "tenth of a cent".
const files = ["src/lib/i18n.ts", "src/lib/planWords.ts", "src/lib/howWords.ts", "src/lib/sourcesWords.ts", "src/components/Demo.tsx"];

describe("the check's tolerance is described honestly", () => {
  it("the tolerance is a bit over a tenth of a cent", () => {
    expect(CHECK_TOLERANCE).toBeGreaterThan(0.1);
    expect(CHECK_TOLERANCE).toBeLessThan(0.15);
  });
  for (const f of files) {
    it(f, () => {
      const s = readFileSync(f, "utf8");
      expect(s).not.toMatch(/(?<!about )(to|within) (a|the) tenth of a cent/);
      expect(s).not.toMatch(/(al|un) décimo de centavo|menos de una décima/);
    });
  }
});
