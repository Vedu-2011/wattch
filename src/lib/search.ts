/** Case- and accent-blind text for plan search: "energia" finds "Energía", "SIMPLE" finds "Simple". */
export const fold = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Plans whose provider + name contain every typed word (in any order). */
export function searchPlans<T extends { provider: string; planName: string }>(plans: T[], q: string, max = 6): T[] {
  const words = fold(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return plans.filter((p) => { const hay = fold(`${p.provider} ${p.planName}`); return words.every((w) => hay.includes(w)); }).slice(0, max);
}
