"use client";

/**
 * Last-resort page when even the layout can't render (for example, the plan data failed its check).
 * It replaces the whole document, so it carries its own html/body and plain inline styles. English + Spanish.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f5efe3", color: "#1b1611", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 560, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 56, margin: 0 }} aria-hidden>⚡</p>
          <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: "12px 0" }}>Wattch is taking a short break.</h1>
          <p style={{ fontSize: 18, color: "#5b5145" }}>
            Our plan list didn&apos;t load correctly, so we&apos;re not showing any prices rather than showing wrong ones. Please try again soon.
          </p>
          {/* bilingual on purpose: this page replaces everything, so it can't know the language the visitor picked */}
          <div lang="es">
            <h2 style={{ fontSize: 26, lineHeight: 1.15, margin: "20px 0 8px" }}>Wattch está en una pausa corta.</h2>
            <p style={{ fontSize: 18, color: "#5b5145", margin: 0 }}>
              Nuestra lista de planes no cargó bien, así que preferimos no mostrar precios antes que mostrar precios equivocados. Intenta de nuevo en un rato.
            </p>
          </div>
          <button type="button" onClick={reset}
            style={{ marginTop: 16, border: 0, borderRadius: 999, padding: "10px 20px", fontSize: 16, fontWeight: 700, background: "#1b1611", color: "#f5efe3", cursor: "pointer" }}>
            Try again · <span lang="es">Intentar otra vez</span>
          </button>
        </main>
      </body>
    </html>
  );
}
