import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Badge, type BadgeCounts, FreshBadge as AreaBadge } from "@/components/FreshBadge";
import { Kapi } from "@/components/Kapi";
import { LangSwitch } from "@/components/LangSwitch";
import { Footer, FooterView, Nav, NavView } from "@/components/SiteChrome";
import { Suspense } from "react";
import { areaInfo } from "@/lib/plans/data";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://getwattch.vercel.app"),
  title: "Wattch — your power plan, read for real",
  description: "Wattch reads the fine print on every electricity plan in Houston and Dallas–Fort Worth and shows what each one really costs at your usage.",
  openGraph: { siteName: "Wattch", type: "website", images: [{ url: "/api/card?kwh=1100", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/api/card?kwh=1100"] },
};
export const viewport: Viewport = { themeColor: "#f5efe3" };

/** When the plan list was last read, and how many labels add up — per area. From the data files, never typed by hand. */
const counts = (a: "houston" | "dallas"): BadgeCounts => {
  const i = areaInfo(a);
  return { verified: i.counts.verified ?? 0, total: i.total, builtAt: i.builtAt };
};
function FreshBadge() {
  const c = { houston: counts("houston"), dallas: counts("dallas") };
  return <Suspense fallback={<Badge c={c.houston} />}><AreaBadge counts={c} /></Suspense>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col bg-paper text-ink">
        <header className="no-print mx-auto w-full max-w-6xl px-4 pt-5 flex items-center justify-between gap-2 sm:px-5">
          <Link href="/" className="flex items-center gap-2" aria-label="Wattch home">
            <Kapi className="h-8 w-8 max-[359px]:hidden sm:h-9 sm:w-9" />
            <span className="display text-xl font-extrabold sm:text-2xl">Wattch</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden md:block"><FreshBadge /></span>
            <Suspense fallback={null}><LangSwitch /></Suspense>
            <Suspense fallback={<NavView lang="en" />}><Nav /></Suspense>
          </div>
        </header>
        <aside aria-label="How fresh the data is" className="no-print mx-auto mt-2 w-full max-w-6xl px-5 md:hidden"><FreshBadge /></aside>
        <main className="flex-1">{children}</main>
        <footer className="no-print mx-auto w-full max-w-6xl px-5 py-10 text-sm text-ink-2">
          <Suspense fallback={<FooterView lang="en" />}><Footer /></Suspense>
        </footer>
      </body>
    </html>
  );
}
