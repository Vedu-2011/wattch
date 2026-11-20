/**
 * The day Wattch downloaded the state's plan list and read the labels (data/plans.json and data/plans-dallas.json
 * `builtAt`, in Texas time). "The state site's #1" always means #1 on THAT list — the app never claims today's order.
 * Kept as a constant so client components don't load the data files; listDate.test.ts checks it against both files.
 */
export const LIST_DATE = { en: "Nov 16", es: "16 de nov" } as const;
