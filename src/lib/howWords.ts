/** /how and its pipeline diagram, in English and Spanish. Numbers are passed in from the data files, never typed here. */
export const HOW_WORDS = {
  en: {
    title: "How Wattch works — AI reads, code checks",
    desc: "How Wattch reads each plan's fine-print label with AI, then rebuilds the label's own prices in code to prove the reading is right.",
    h1: "How Wattch works",
    motto: "AI reads. Code checks. Code decides.",
    steps: [
      { t: "Get every plan", d: "Wattch downloads the full plan list from Power to Choose, the state of Texas's official plan site, and keeps the Houston (CenterPoint) and Dallas–Fort Worth (Oncor) plans." },
      { t: "Open the fine print", d: "Every plan has an Electricity Facts Label, usually a PDF. When a provider's page only works in a real browser or blocks plain downloads, Anakin.io opens it for us." },
      { t: "AI reads", d: "An AI reader copies the numbers off each label: energy price, delivery charges, base fee, bill credits, minimum-use fees, time-of-use splits. It does not decide anything." },
      { t: "Code checks the AI", d: "Texas makes every label print its average price at 500, 1,000 and 2,000 kWh. Plain code rebuilds those three prices from what the AI read. If all three match to about a tenth of a cent, the plan is verified. If not, the AI gets one more try with the exact mismatch. Then a few free second chances: some labels keep their prices in PDF form fields, which plain code reads; a handful were read by hand. Every one of those still has to pass the same three-price check. Still wrong? The plan is shown as not verified and never ranked." },
      { t: "Real Houston seasons", d: "Nobody uses the same power every month. Wattch spreads your average over 12 months the way Houston homes really use power: ERCOT's grid data for the Coast weather zone, 2023–2025, mixed by how many CenterPoint homes are in each of its two home types. August comes out at about 2.6× February. That's where bill-credit plans hurt: you miss the credit in the mild months. Dallas–Fort Worth gets its own shape the same way, from the North Central zone and Oncor's homes: August is about 1.8× February there, and January runs high because more homes heat with electricity." },
      { t: "Code decides", d: "Your bill at your usage, the ranking, the yearly cost, the price cliffs and every \"why\" line are plain math with tests. Same inputs, same answer, every time. Variable-rate plans aren't ranked, because their price can change every month." },
    ],
    last: (city: string, when: string, v: number, total: number, mis: number, unread: number) =>
      `${city}: last full read ${when}. ${v} of ${total} plans verified, ${mis} didn't add up, ${unread} couldn't be opened.`,
    reader: (m: string) => `Reader: ${m}.`,
    // the diagram
    caption: (city: string) => `From the state's list to your answer (${city}, latest read)`,
    s1: "State list", s1t: (city: string) => `${city} plans`, s1d: "Power to Choose, the state's plan site",
    s2: "AI reads", s2t: "fine-print labels read", s2d: (model: string, unread: number) => `${model} copies the numbers and decides nothing. ${unread} couldn't be opened or read.`,
    s3: "Code checks", s3t: "verified", s3d: (mis: number) => `Plain code rebuilt all 3 of each label's own prices. ${mis} didn't add up, so ${mis === 1 ? "it's" : "they're"} never ranked.`,
    s4: "Code decides", s4t: "ranked for you", s4d: "Verified plans with a price you can count on (no variable-rate or prepaid) that are still on the state's list, priced at your usage.",
  },
  es: {
    title: "Cómo funciona Wattch — la IA lee, el código revisa",
    desc: "Cómo Wattch lee con IA la etiqueta de cada plan y luego rehace en código los propios precios de la etiqueta para probar que la lectura está bien.",
    h1: "Cómo funciona Wattch",
    motto: "La IA lee. El código revisa. El código decide.",
    steps: [
      { t: "Juntar todos los planes", d: "Wattch descarga la lista completa de planes de Power to Choose, el sitio oficial de planes del estado de Texas, y se queda con los planes de Houston (CenterPoint) y de Dallas–Fort Worth (Oncor)." },
      { t: "Abrir la letra pequeña", d: "Cada plan tiene una Etiqueta de Datos de Electricidad (Electricity Facts Label), casi siempre un PDF. Cuando la página del proveedor solo funciona en un navegador real o bloquea las descargas, Anakin.io la abre por nosotros." },
      { t: "La IA lee", d: "Un lector de IA copia los números de cada etiqueta: precio de la energía, cargos de entrega, cargo base, créditos, cargos por uso mínimo, precios por horario. No decide nada." },
      { t: "El código revisa a la IA", d: "Texas obliga a cada etiqueta a imprimir su precio promedio con 500, 1,000 y 2,000 kWh. Un código sencillo rehace esos tres precios con lo que leyó la IA. Si los tres coinciden con cerca de una décima de centavo de diferencia o menos, el plan queda verificado. Si no, la IA tiene otro intento con la diferencia exacta. Luego hay unas segundas oportunidades gratis: algunas etiquetas guardan sus precios en campos de formulario del PDF, que el código lee; unas pocas se leyeron a mano. Todas tienen que pasar la misma revisión de tres precios. ¿Sigue mal? El plan aparece como sin verificar y nunca entra en la lista." },
      { t: "Temporadas reales de Houston", d: "Nadie usa la misma luz todos los meses. Wattch reparte tu promedio en 12 meses como de verdad usan la luz las casas de Houston: datos de la red de ERCOT para la zona Coast, 2023–2025, mezclados según cuántas casas de CenterPoint hay en cada uno de sus dos tipos de casa. Agosto sale como 2.6 veces febrero. Ahí es donde duelen los planes con crédito: en los meses templados no lo recibes. Dallas–Fort Worth tiene su propia forma, hecha igual, con la zona North Central y las casas de Oncor: allá agosto es como 1.8 veces febrero, y enero sale alto porque más casas se calientan con electricidad." },
      { t: "El código decide", d: "Tu factura con tu consumo, la lista, el costo anual, los saltos de precio y cada línea de \"por qué\" son cuentas sencillas con pruebas. Mismos datos, misma respuesta, siempre. Los planes de tarifa variable no entran en la lista, porque su precio puede cambiar cada mes." },
    ],
    last: (city: string, when: string, v: number, total: number, mis: number, unread: number) =>
      `${city}: última lectura completa el ${when}. ${v} de ${total} planes verificados, ${mis} no cuadraron, ${unread} no se pudieron abrir.`,
    reader: (m: string) => `Lector: ${m}.`,
    caption: (city: string) => `De la lista del estado a tu respuesta (${city}, última lectura)`,
    s1: "Lista del estado", s1t: (city: string) => `planes de ${city}`, s1d: "Power to Choose, el sitio de planes del estado",
    s2: "La IA lee", s2t: "etiquetas leídas", s2d: (model: string, unread: number) => `${model} copia los números y no decide nada. ${unread} no se pudieron abrir o leer.`,
    s3: "El código revisa", s3t: "verificados", s3d: (mis: number) => `El código rehízo los 3 precios de cada etiqueta. ${mis} no ${mis === 1 ? "cuadró" : "cuadraron"}, así que nunca entra${mis === 1 ? "" : "n"} en la lista.`,
    s4: "El código decide", s4t: "en tu lista", s4d: "Planes verificados con un precio en el que puedes confiar (sin tarifa variable ni prepago) que siguen en la lista del estado, con el precio de tu consumo.",
  },
} as const;
