import { REMIND_DAYS } from "@/lib/ics";

/** Every fixed string on /remind, in English and Spanish. */
export const REMIND_WORDS = {
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
