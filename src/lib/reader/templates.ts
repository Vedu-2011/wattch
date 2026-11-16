import type { PlanPricing } from "@/lib/plans/schema";

type Avg = { k500: number; k1000: number; k2000: number };

/** How a form field prints a price: 13 not 13.0, 12.6 stays 12.6. */
const field = (v: number) => String(v);

/**
 * Southern Federal Power / Ranchero Power labels keep their prices in PDF form fields. Text extraction glues
 * the fields together, e.g. "...05-Nov-202612.711.711.2Centerpoint0.0420474.953 Months.Yes. $179".
 * Code reads them: the glued averages must spell out Power to Choose's own three numbers exactly
 * (that's how we know where one field ends and the next begins), then energy $/kWh, base $, term.
 * These labels don't print delivery charges — fillTdu() supplies CenterPoint's and the label check decides.
 */
export function readSoFedForm(text: string, ptc: Avg): PlanPricing | null {
  if (!/Southern Federal Power|Ranchero Power/i.test(text)) return null;
  const avgs = `${field(ptc.k500)}${field(ptc.k1000)}${field(ptc.k2000)}`;
  const re = new RegExp(
    `\\d{4}${avgs.replace(/\./g, "\\.")}(?:Centerpoint)+(0\\.\\d{6})(\\d+\\.\\d{2}|0)(\\d{1,2}) Months?\\.\\s?(Yes\\. \\$(\\d+?)(?=(?:0[1-9]|1[0-2])\\d{2}20\\d{2}|\\D|$)|No)`,
    "i",
  );
  const m = text.replace(/\s+/g, " ").match(re);
  if (!m) return null;
  const energyCents = Math.round(Number(m[1]) * 100 * 10000) / 10000;
  return {
    baseChargeDollars: Number(m[2]),
    energyTiers: [{ fromKwh: 0, cents: energyCents }],
    tduCentsPerKwh: 0,
    tduMonthlyDollars: 0,
    credits: [],
    usageFees: [],
    amortizedFees: [],
    touPeriods: [],
    termMonths: Number(m[3]),
    earlyTerminationFee: { dollars: m[5] ? Number(m[5]) : 0, perMonthRemaining: false },
    labelAvg: { ...ptc },
    notes: ["Delivery charges aren't printed on this label; they're passed through from CenterPoint."],
  };
}

/**
 * The reader sometimes copies the wrong number into the averages (e.g. a "37.2 %" renewable figure).
 * Power to Choose lists each plan's three averages too. When all three of those literally appear on the
 * label in the right order, trust them over the reader's copy.
 */
export function ptcAveragesOnLabel(text: string, ptc: Avg): boolean {
  if (!(ptc.k500 > 0 && ptc.k1000 > 0 && ptc.k2000 > 0)) return false;
  const flat = text.replace(/\s+/g, " ");
  const forms = (v: number) => [...new Set([v.toFixed(1), String(v), v.toFixed(2)])].map((f) => f.replace(".", "\\."));
  const num = (v: number) => `(?<![0-9.])(?:${forms(v).join("|")})(?![0-9])`;
  // a row of three prices in a row: "19.4¢ 18.0¢ 17.2¢"
  const row = new RegExp(`${num(ptc.k500)} ?¢ ?${num(ptc.k1000)} ?¢ ?${num(ptc.k2000)} ?¢`);
  // or each price right next to its usage: "500 kWh19.2 ¢ … 1,000 kWh6.2 ¢ … 2,000 kWh12.2 ¢"
  const at = (kwh: string, v: number) => new RegExp(`${kwh} ?kWh ?${num(v)} ?¢`, "i");
  return row.test(flat) || (at("500", ptc.k500).test(flat) && at("1,?000", ptc.k1000).test(flat) && at("2,?000", ptc.k2000).test(flat));
}
