import Link from "next/link";
import { Kapi } from "@/components/Kapi";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
      <Kapi reading className="h-28 w-28" />
      <h1 className="display mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">Kapi couldn&apos;t find that page.</h1>
      <p className="mt-3 text-lg text-ink-2">
        The link may be old, or that plan isn&apos;t on Power to Choose anymore. Plans come and go every week.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/wall?kwh=1100" className="rounded-full bg-ink px-5 py-2.5 font-bold text-paper">See every plan</Link>
        <Link href="/" className="rounded-full bg-card px-5 py-2.5 font-bold shadow-[var(--shadow-soft)]">Home</Link>
      </div>
    </div>
  );
}
