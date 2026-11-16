import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Kapi } from "@/components/Kapi";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Wattch — your power plan, read for real",
  description: "Wattch reads the fine print on every Houston electricity plan and shows what each one really costs at your usage.",
};
export const viewport: Viewport = { themeColor: "#f5efe3" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col bg-paper text-ink">
        <header className="mx-auto w-full max-w-6xl px-5 pt-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Wattch home">
            <Kapi className="h-9 w-9" />
            <span className="display text-2xl font-extrabold">Wattch</span>
          </Link>
          <nav className="flex gap-1 text-sm font-medium">
            <Link className="rounded-full px-3 py-1.5 hover:bg-paper-2" href="/how">How it works</Link>
            <Link className="rounded-full px-3 py-1.5 hover:bg-paper-2" href="/sources">Sources</Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-5 py-10 text-sm text-ink-2">
          Wattch shows the math. Always open the plan&apos;s fine print before you switch. Prices before taxes.
          Plan list from the state&apos;s Power to Choose site.
        </footer>
      </body>
    </html>
  );
}
