import { QRCodeSVG } from "qrcode.react";
import { Kapi } from "@/components/Kapi";

export const SITE_URL = "https://getwattch.vercel.app";

/** For the live demo: judges scan this and try Wattch on their own phone. */
export function JudgeQr() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl bg-volt p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:p-8">
      <div className="rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
        <QRCodeSVG value={SITE_URL} size={168} bgColor="#fffaf0" fgColor="#1b1611" level="M" title="QR code for getwattch.vercel.app" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="display text-3xl font-extrabold leading-tight sm:text-4xl">Try it with your own bill.</p>
        <p className="mt-2 text-lg">Scan with your phone camera, type your kWh, and see your own number.</p>
        <p className="num mt-2 font-semibold">getwattch.vercel.app</p>
      </div>
      <Kapi className="hidden h-24 w-24 shrink-0 sm:block" />
    </div>
  );
}
