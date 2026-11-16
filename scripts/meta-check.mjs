// Every Dallas–Fort Worth URL: the <title>, description and social-card text must not say "Houston".
// Needs the app running on :3000 (npm run build && npx next start -p 3000). Exits 1 on any hit.
const BASE = process.env.BASE ?? "http://localhost:3000";
const urls = [
  "/wall?kwh=1100&area=dallas", "/wall?kwh=1100&area=dallas&lang=es", "/wall?kwh=600&area=dallas&lock=1",
  "/plan/17283?kwh=1100&area=dallas", "/plan/17283", "/compare?a=17283&b=31144&kwh=1100&area=dallas",
  "/traps?area=dallas", "/remind", "/how",
];
const TAGS = /<title>[^<]*|<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt)" content="[^"]*"/g;
let bad = 0;
for (const u of urls) {
  const html = await (await fetch(BASE + u)).text();
  const hits = (html.match(TAGS) ?? []).filter((t) => /Houston/.test(t) && !/Houston and Dallas/.test(t));
  console.log(hits.length ? "HOUSTON" : "ok     ", u, hits.length ? "\n   " + hits.join("\n   ") : "");
  bad += hits.length;
}
process.exit(bad ? 1 : 0);
