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
// both home pages must name both areas (the app covers Houston and Dallas–Fort Worth)
for (const u of ["/", "/es"]) {
  const d = ((await page(u)).match(/<meta name="description" content="[^"]*"/) ?? [""])[0];
  const ok = /Houston/.test(d) && /Dallas/.test(d);
  console.log(ok ? "ok     " : "ONE AREA", u, ok ? "" : "\n   " + d);
  bad += ok ? 0 : 1;
}
// a shared Spanish link must preview the Spanish card (and a Dallas link the Dallas card); bots get tags in <head>
for (const u of spanish) {
  const html = await (await fetch(BASE + u, { headers: { "user-agent": "facebookexternalhit/1.1" } })).text();
  const img = (html.match(/<meta property="og:image" content="([^"]*)"/) ?? [, ""])[1].replaceAll("&amp;", "&");
  const ok = /lang=es/.test(img) && (!/area=dallas/.test(u) || /area=dallas/.test(img)) && /og:site_name/.test(html);
  console.log(ok ? "ok     " : "OGIMAGE", u, ok ? "" : "\n   " + (img || "(no og:image)"));
  bad += ok ? 0 : 1;
}
// an unknown plan streams a friendly not-found page with status 200, so it must say noindex
for (const u of ["/plan/99999999", "/plan/nope?lang=es"]) {
  const ok = /<meta name="robots" content="noindex"/.test(await page(u));
  console.log(ok ? "ok     " : "INDEX  ", u, ok ? "" : "(missing noindex)");
  bad += ok ? 0 : 1;
}
// robots keeps the scripted walk-through and the APIs out; the sitemap must be valid XML (a raw "&" breaks the whole file)
{
  const robots = await page("/robots.txt");
  const ok = /Disallow: \/demo\b/.test(robots) && /Disallow: \/api\//.test(robots) && /Sitemap: https:\/\//.test(robots);
  console.log(ok ? "ok     " : "ROBOTS ", "/robots.txt");
  bad += ok ? 0 : 1;
  const xml = await page("/sitemap.xml");
  const raw = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;)/g)?.length ?? 0;
  const urls = xml.match(/<url>/g)?.length ?? 0, es = xml.match(/hreflang="es"/g)?.length ?? 0;
  const ok2 = raw === 0 && urls > 300 && es === urls && /area=dallas/.test(xml);
  console.log(ok2 ? "ok     " : "SITEMAP", `/sitemap.xml (${urls} urls, ${es} Spanish twins, ${raw} raw &)`);
  bad += ok2 ? 0 : 1;
}
process.exit(bad ? 1 : 0);
