// Page metadata check (needs the app running on :3000: npm run build && npx next start -p 3000). Exits 1 on any hit.
// 1. Every Dallas–Fort Worth URL: the <title>, description and social-card text must not say "Houston".
// 2. Every Spanish URL: the <title> and description must not be English.
const BASE = process.env.BASE ?? "http://localhost:3000";
const TAGS = /<title>[^<]*|<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt)" content="[^"]*"/g;
const OWN = /<title>[^<]*|<meta name="description" content="[^"]*"/g; // what the page itself sets (social text may come from the layout)

const dallas = [
  "/wall?kwh=1100&area=dallas", "/wall?kwh=1100&area=dallas&lang=es", "/wall?kwh=600&area=dallas&lock=1",
  "/plan/17283?kwh=1100&area=dallas", "/compare?a=17283&b=31144&kwh=1100&area=dallas",
  "/traps?area=dallas", "/remind", "/how",
];
const spanish = [
  "/es", "/wall?kwh=1100&lang=es", "/plan/33633?kwh=1100&lang=es", "/plan/17283?kwh=1100&area=dallas&lang=es",
  "/compare?a=37797&b=33633&kwh=1100&lang=es", "/traps?lang=es", "/traps?area=dallas&lang=es", "/how?lang=es", "/remind?lang=es", "/sources?lang=es",
];
// common English words that never appear in our Spanish copy (plan names like "Simple Saver" are allowed)
const ENGLISH = /\b(the|every|your|works|reads|checks|plans? at|really costs|compare two|remind me|fine print|traps in)\b/i;

let bad = 0;
const page = async (u) => (await fetch(BASE + u)).text();
for (const u of dallas) {
  const hits = ((await page(u)).match(TAGS) ?? []).filter((t) => /Houston/.test(t) && !/Houston and Dallas/.test(t));
  console.log(hits.length ? "HOUSTON" : "ok     ", u, hits.length ? "\n   " + hits.join("\n   ") : "");
  bad += hits.length;
}
for (const u of spanish) {
  const hits = ((await page(u)).match(OWN) ?? []).filter((t) => ENGLISH.test(t.replace(/Simple Saver \d|Power to Choose/g, "")));
  console.log(hits.length ? "ENGLISH" : "ok     ", u, hits.length ? "\n   " + hits.join("\n   ") : "");
  bad += hits.length;
}
process.exit(bad ? 1 : 0);
