import type { Metadata } from "next";
import Link from "next/link";
import { Kapi } from "@/components/Kapi";
import { asLang } from "@/lib/i18n";
import { REMIND_DAYS, dayText, endDateProblem, parseDay, reminderDay } from "@/lib/ics";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const T = {
  en: {
    title: "Wattch — remind me before my plan ends",
    desc: "Add a reminder to your calendar 30 days before your power plan ends, so you can shop before your price changes.",
    h1: "Don't let your plan run out on you.",
    intro: `When a fixed-price plan ends and you don't pick a new one, you may be moved to a month-to-month rate that can cost more. Tell Wattch when yours ends and get a reminder in your calendar ${REMIND_DAYS} days before.`,
    q: "When does your contract end?",
    hint: "It's on your bill or your welcome letter, often called “contract expiration.”",
    go: "Make my reminder",
    ends: (plan: string, end: string) => `Your plan${plan ? ` (${plan})` : ""} ends ${end}`,
    when: (d: string) => `Your reminder: ${d}.`,
    how: "Open the file and your phone or computer adds it to your calendar. Nothing is saved on Wattch.",
    add: "Add to my calendar",
    more: "Want to see what you'd pay on every plan right now?",
    start: "Start here",
    home: "/",
  },
  es: {
    title: "Wattch — recuérdame antes de que termine mi plan",
    desc: "Agrega un recordatorio a tu calendario 30 días antes de que termine tu plan de luz, para buscar uno nuevo antes de que cambie tu precio.",
    h1: "Que no se te acabe el plan sin aviso.",
    intro: `Cuando termina un plan de precio fijo y no escoges otro, te pueden pasar a una tarifa mes a mes que puede costar más. Dile a Wattch cuándo termina el tuyo y recibe un recordatorio en tu calendario ${REMIND_DAYS} días antes.`,
    q: "¿Cuándo termina tu contrato?",
    hint: "Aparece en tu factura o en tu carta de bienvenida, muchas veces como “fecha de vencimiento del contrato”.",
    go: "Crear mi recordatorio",
    ends: (plan: string, end: string) => `Tu plan${plan ? ` (${plan})` : ""} termina el ${end}`,
    when: (d: string) => `Tu recordatorio: ${d}.`,
    how: "Abre el archivo y tu teléfono o computadora lo agrega a tu calendario. Wattch no guarda nada.",
    add: "Agregar a mi calendario",
    more: "¿Quieres ver cuánto pagarías con cada plan ahora mismo?",
    start: "Empieza aquí",
    home: "/es",
  },
} as const;

export async function generateMetadata({ searchParams }: PageProps<"/remind">): Promise<Metadata> {
  const t = T[asLang(one((await searchParams as SP).lang))];
  return { title: t.title, description: t.desc };
}
/** Reads ?end= from the URL, so it renders per request. */
export const instant = false;

export default async function Remind({ searchParams }: PageProps<"/remind">) {
  const sp = (await searchParams) as SP;
  const lang = asLang(one(sp.lang));
  const t = T[lang];
  const raw = one(sp.end);
  const plan = one(sp.plan) ?? "";
  const end = parseDay(raw);
  const problem = raw ? endDateProblem(end, new Date(), lang) : null;
  const ok = raw && end && !problem;
  const file = `/api/remind?end=${raw ?? ""}${plan ? `&plan=${encodeURIComponent(plan)}` : ""}${lang === "es" ? "&lang=es" : ""}`;
  return (
    <div lang={lang} className="mx-auto max-w-2xl px-5 pt-8">
      <div className="flex items-end gap-3">
        <Kapi pose="thinking" className="h-16 w-16 shrink-0" />
        <h1 className="display text-3xl font-extrabold leading-tight sm:text-4xl">{t.h1}</h1>
      </div>
      <p className="mt-4 text-lg text-ink-2">{t.intro}</p>

      <form action="/remind" method="get" className="mt-6 rounded-3xl bg-card p-5 shadow-[var(--shadow-lift)] sm:p-6">
        <label htmlFor="end" className="block text-base font-semibold">{t.q}</label>
        <p className="mt-1 text-sm text-ink-2">{t.hint}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input id="end" name="end" type="date" required defaultValue={raw ?? ""}
            className="num min-w-0 flex-1 rounded-2xl bg-paper px-4 py-3 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ink" />
          {plan && <input type="hidden" name="plan" value={plan} />}
          {lang === "es" && <input type="hidden" name="lang" value="es" />}
          <button className="rounded-2xl bg-volt px-5 py-3 text-base font-bold text-ink shadow-[var(--shadow-soft)] hover:brightness-95">{t.go}</button>
        </div>
        {problem && <p role="alert" className="mt-3 text-sm font-medium text-over">{problem}</p>}
      </form>

      {ok && (
        <section className="pop mt-6 rounded-3xl bg-ink p-5 text-paper shadow-[var(--shadow-lift)] sm:p-6">
          <p className="text-sm font-semibold text-volt">{t.ends(plan, dayText(end, lang))}</p>
          <p className="display mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{t.when(dayText(reminderDay(end, new Date()), lang, false))}</p>
          <p className="mt-2 text-paper/80">{t.how}</p>
          <a href={file} download className="mt-4 inline-block rounded-full bg-volt px-5 py-2.5 font-bold text-ink">{t.add}</a>
        </section>
      )}

      <p className="mt-6 text-sm text-ink-2">
        {t.more} <Link href={t.home} className="font-semibold underline underline-offset-4">{t.start}</Link>.
      </p>
    </div>
  );
}
