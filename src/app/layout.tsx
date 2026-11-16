import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Fresh } from "@/components/Fresh";
import { Kapi } from "@/components/Kapi";
import { LangSwitch } from "@/components/LangSwitch";
import { Suspense } from "react";
import { snapshotInfo } from "@/lib/plans/data";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://getwattch.vercel.app"),
  title: "Wattch — your power plan, read for real",
  description: "Wattch reads the fine print on every Houston electricity plan and shows what each one really costs at your usage.",
  openGraph: { siteName: "Wattch", type: "website", images: [{ url: "/api/card?kwh=1100", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/api/card?kwh=1100"] },
};
export const viewport: Viewport = { themeColor: "#f5efe3" };

/** When the plan list was last read, and how many labels add up. From data/plans.json, never typed by hand. */
function FreshBadge() {
  const verified = snapshotInfo.counts.verified ?? 0;
  return (
    <Link href="/how" className={`inline-flex items-center gap-2 rounded-full bg-good-2 px-3 py-1 text-xs font-medium text-ink hover:brightness-95`}>
      <span aria-hidden className="h-2 w-2 rounded-full bg-good" />
      <span><span className="num">{verified}</span> of <span className="num">{snapshotInfo.total}</span> labels check out · <Fresh at={snapshotInfo.builtAt} prefix="read" /></span>
    </Link>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col bg-paper text-ink">
        <header className="mx-auto w-full max-w-6xl px-5 pt-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Wattch home">
            <Kapi className="h-9 w-9" />
            <span className="display text-2xl font-extrabold">Wattch</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden md:block"><FreshBadge /></span>
            <Suspense fallback={null}><LangSwitch /></Suspense>
            <nav className="flex gap-0.5 whitespace-nowrap text-sm font-medium sm:gap-1">
              <Link className="rounded-full px-2 py-1.5 hover:bg-paper-2 sm:px-3" href="/traps">Traps</Link>
              <Link className="rounded-full px-2 py-1.5 hover:bg-paper-2 sm:px-3" href="/how"><span className="sm:hidden">How</span><span className="hidden sm:inline">How it works</span></Link>
              <Link className="rounded-full px-2 py-1.5 hover:bg-paper-2 sm:px-3" href="/sources">Sources</Link>
            </nav>
          </div>
        </header>
        <aside aria-label="How fresh the data is" className="mx-auto mt-2 w-full max-w-6xl px-5 md:hidden"><FreshBadge /></aside>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-5 py-10 text-sm text-ink-2">
          Wattch shows the math. Always open the plan&apos;s fine print before you switch. Prices before taxes.
          Plan list from the state&apos;s Power to Choose site.
        </footer>
      </body>
    </html>
  );
}
