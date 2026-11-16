import { PlanPricing } from "@/lib/plans/schema";
import { labelCheck, type CheckRow } from "@/lib/bill";
import { z } from "zod";

export const READER_MODEL = "claude-haiku-5-5";

const SYSTEM = `You read Texas Electricity Facts Labels (EFLs) and copy their numbers into JSON. You never guess.
Rules:
- Money in dollars, energy prices in CENTS per kWh (e.g. "$0.0920 per kWh" = 9.2 cents).
- labelAvg: the three "average price per kWh" numbers printed for 500, 1,000 and 2,000 kWh, in cents, exactly as printed.
- energyTiers: the provider's energy charge. Flat rate = one tier with fromKwh 0. Tiered ("first 1000 kWh 9¢, above 1000 kWh 12¢") = one tier per block, fromKwh is where the block starts.
- tduCentsPerKwh / tduMonthlyDollars: the delivery (TDU / TDSP / CenterPoint / CNP) charges printed on the label. If the label shows several per-kWh delivery charges, add them up. If the label does NOT print delivery charge amounts (it only says they are passed through), use 0 for both. Never look them up or guess.
- baseChargeDollars: the provider's own monthly base / customer charge (0 if none).
- credits: ONLY credits applied on EVERY monthly bill when usage is in a range (minKwh..maxKwh, maxKwh null if no top). Autopay, paperless or other "only if you do X" monthly credits: conditional true. One-time or occasional rebates (sign-up bonus, "$100 after 6 months", gift cards) are NOT credits: mention them in notes only.
- usageFees: minimum usage fees ("$9.95 if usage is less than 1,000 kWh" => belowKwh 1000).
- amortizedFees: one-time fees the label says are spread into the averages (e.g. "1/12 of this setup cost is included" => months 12).
- touPeriods: ONLY for time-of-use / free nights / free weekends plans: one entry per period with the share of usage the label ASSUMES for its averages and that period's energy price in cents. Shares add up to 1. Leave empty for normal plans.
- earlyTerminationFee: dollars; perMonthRemaining true if it is "$X per month remaining".
- notes: up to 4 short plain-English gotchas a normal person would miss (credits that vanish below a usage level, fees, conditions). 12 words max each. No marketing.
Copy what the label says. If a number truly is not on the label, use 0 (or empty list). If the three average prices are not readable in the text, use 0 for all three. Call the tool once.`;

const toolSchema = z.toJSONSchema(PlanPricing);

export type ParseResult = {
  pricing: PlanPricing | null;
  rows: CheckRow[];
  ok: boolean;
  attempts: number;
  inputTokens: number;
  outputTokens: number;
  message: string;
};

async function callClaude(apiKey: string, text: string, feedback?: string) {
  const messages: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: `EFL text:\n<efl>\n${text.slice(0, 24000)}\n</efl>` + (feedback ? `\n\n${feedback}` : "") },
  ];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: READER_MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      tools: [{ name: "save_efl", description: "Save the numbers read from the EFL.", input_schema: toolSchema }],
      tool_choice: { type: "tool", name: "save_efl" },
      messages,
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    content: { type: string; input?: unknown }[];
    usage: { input_tokens: number; output_tokens: number };
  };
  const block = data.content.find((c) => c.type === "tool_use");
  return { input: block?.input, usage: data.usage };
}

/** Every printed average the reader reports must literally appear in the label text. Stops made-up numbers. */
export function grounded(text: string, p: PlanPricing): boolean {
  const flat = text.replace(/\s+/g, " ");
  return [p.labelAvg.k500, p.labelAvg.k1000, p.labelAvg.k2000].every((v) => {
    if (!(v > 0)) return false;
    const forms = new Set([v.toFixed(1), String(v), v.toFixed(2)]);
    return [...forms].some((f) => new RegExp(`(^|[^0-9.])${f.replace(".", "\\.")}(?![0-9])`).test(flat));
  });
}

/** Some labels don't print delivery charges. Try the CenterPoint charges that other verified labels print. */
export function fillTdu(p: PlanPricing, candidates: { cents: number; monthly: number }[]): { pricing: PlanPricing; rows: CheckRow[] } | null {
  if (p.tduCentsPerKwh !== 0 || p.tduMonthlyDollars !== 0) return null;
  for (const c of candidates) {
    const q = { ...p, tduCentsPerKwh: c.cents, tduMonthlyDollars: c.monthly };
    const chk = labelCheck(q);
    if (chk.ok) return { pricing: q, rows: chk.rows };
  }
  return null;
}

/** AI reads. Code checks: rebuild the label's three printed averages from what was read. One retry with the exact mismatch. */
export async function parseEfl(apiKey: string, text: string): Promise<ParseResult> {
  let feedback: string | undefined;
  let inT = 0, outT = 0;
  let last: ParseResult = { pricing: null, rows: [], ok: false, attempts: 0, inputTokens: 0, outputTokens: 0, message: "" };
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { input, usage } = await callClaude(apiKey, text, feedback);
    inT += usage.input_tokens; outT += usage.output_tokens;
    const parsed = PlanPricing.safeParse(input);
    if (!parsed.success) {
      feedback = `Your last answer didn't fit the format: ${parsed.error.issues.slice(0, 3).map((i) => i.path.join(".") + " " + i.message).join("; ")}. Try again.`;
      last = { ...last, attempts: attempt, inputTokens: inT, outputTokens: outT, message: "Reader answer didn't fit the format." };
      continue;
    }
    if (!grounded(text, parsed.data)) {
      last = { pricing: null, rows: [], ok: false, attempts: attempt, inputTokens: inT, outputTokens: outT,
        message: "The label's prices aren't readable in this copy of the fine print." };
      return last;
    }
    const check = labelCheck(parsed.data);
    last = { pricing: parsed.data, rows: check.rows, ok: check.ok, attempts: attempt, inputTokens: inT, outputTokens: outT,
      message: check.ok ? "All 3 label averages match." : "Our math didn't match the label." };
    if (check.ok) return last;
    feedback = `When I rebuild the label's averages from your numbers I get: ${check.rows
      .map((r) => `${r.kwh} kWh → ${r.ours}¢ (label says ${r.printed}¢)`)
      .join(", ")}. Something is missing or misread (a credit, a fee, a tier, a delivery charge, or the time-of-use split). Read the label again carefully.`;
  }
  return last;
}
