import raw from "../../../data/delisted.json";

/**
 * Plans Wattch read that have since left Power to Choose (data/delisted.json, made for free by scripts/delisted.ts).
 * They keep their page with a plain note, but are never ranked or picked as the state site's #1.
 */
export const DELISTED = { checkedAt: raw.checkedAt, ids: new Set<string>([...raw.houston, ...raw.dallas]) };
export const isListed = (id: string) => !DELISTED.ids.has(id);
