import { z } from "zod";

/**
 * What the AI reader pulls out of one Electricity Facts Label (EFL).
 * All money in dollars, all energy prices in cents per kWh.
 * The AI only READS. Everything that decides (bills, ranking, checks) is plain code in src/lib/bill.
 */
export const EnergyTier = z.object({
  /** usage above this many kWh in the month (0 for the first block) */
  fromKwh: z.number().min(0),
  /** cents per kWh for usage in this block */
  cents: z.number().min(0).max(200),
});

export const BillCredit = z.object({
  /** credit applies when monthly usage is >= minKwh */
  minKwh: z.number().min(0),
  /** ...and <= maxKwh (null = no upper limit) */
  maxKwh: z.number().nullable(),
  dollars: z.number().min(0),
  /** short label in the EFL's own words, e.g. "Usage credit" or "Autopay discount" */
  label: z.string(),
  /** true when the credit needs something extra (autopay, paperless, a subscription) */
  conditional: z.boolean(),
});

export const UsageFee = z.object({
  /** fee applies when monthly usage is < belowKwh */
  belowKwh: z.number().min(0),
  dollars: z.number().min(0),
  label: z.string(),
});

export const PlanPricing = z.object({
  baseChargeDollars: z.number().min(0),
  /** energy charge blocks; one block for a flat rate */
  energyTiers: z.array(EnergyTier).min(1),
  /** delivery (TDU) charge per kWh in cents, as printed on the EFL */
  tduCentsPerKwh: z.number().min(0).max(50),
  /** delivery (TDU) fixed charge per month in dollars */
  tduMonthlyDollars: z.number().min(0).max(50),
  credits: z.array(BillCredit),
  usageFees: z.array(UsageFee),
  /** one-time fees the EFL says are spread into the averages, e.g. $49.99 over 12 months */
  amortizedFees: z.array(z.object({ dollars: z.number(), months: z.number().min(1), label: z.string() })),
  /** time-of-use / free nights: the share of usage the EFL assumes in each period. Empty for normal plans */
  touPeriods: z.array(z.object({ label: z.string(), share: z.number().min(0).max(1), cents: z.number().min(0) })),
  termMonths: z.number().min(0),
  earlyTerminationFee: z.object({ dollars: z.number().min(0), perMonthRemaining: z.boolean() }),
  /** average price per kWh printed on the label at 500 / 1000 / 2000 kWh, in cents */
  labelAvg: z.object({ k500: z.number(), k1000: z.number(), k2000: z.number() }),
  /** plain-English gotchas the reader noticed, each one short. The code never uses these to decide anything. */
  notes: z.array(z.string()).max(6),
});
export type PlanPricing = z.infer<typeof PlanPricing>;
export type BillCredit = z.infer<typeof BillCredit>;

export const PlanMeta = z.object({
  id: z.string(),
  provider: z.string(),
  planName: z.string(),
  rateType: z.string(),
  renewablePct: z.number(),
  prepaid: z.boolean(),
  timeOfUse: z.boolean(),
  eflUrl: z.string(),
  enrollUrl: z.string(),
  website: z.string(),
  rating: z.number().nullable(),
  /** Power to Choose's own headline numbers, in cents per kWh */
  ptc: z.object({ k500: z.number(), k1000: z.number(), k2000: z.number() }),
});
export type PlanMeta = z.infer<typeof PlanMeta>;

export const PlanRecord = z.object({
  meta: PlanMeta,
  pricing: PlanPricing.nullable(),
  read: z.object({
    fetchedAt: z.string(),
    via: z.enum(["direct", "anakin"]),
    sha256: z.string(),
    parsedBy: z.string(),
    readMs: z.number(),
  }),
  check: z.object({
    status: z.enum(["verified", "mismatch", "unread"]),
    /** recomputed vs printed, cents */
    rows: z.array(z.object({ kwh: z.number(), printed: z.number(), ours: z.number(), ok: z.boolean() })),
    message: z.string(),
  }),
});
export type PlanRecord = z.infer<typeof PlanRecord>;
