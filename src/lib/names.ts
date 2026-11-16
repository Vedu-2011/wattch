/** "AP GAS & ELECTRIC (TX) LLC" → "AP GAS & ELECTRIC": drops company suffixes and "(TX)". */
export const shortProvider = (s: string) => s.replace(/\b(LLC|INC|LP|L\.P\.|CO)\b\.?/gi, "").replace(/\(TX\)/gi, "").replace(/\s+/g, " ").trim();

/** "AP GAS & ELECTRIC (TX) LLC" → "Ap Gas & Electric" (how the results page shows providers). */
export const providerTitle = (s: string) => shortProvider(s).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
