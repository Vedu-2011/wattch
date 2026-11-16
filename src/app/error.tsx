"use client";
import Link from "next/link";
import { Kapi } from "@/components/Kapi";

/** Something broke while showing a page. Never show a stack trace; offer a retry and a way home. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 pt-16 text-center sm:pt-24">
      <Kapi pose="thinking" className="h-28 w-28" />
      <h1 className="display mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">Something went wrong on our side.</h1>
      <p className="mt-3 text-lg text-ink-2">Your numbers are fine — this page just didn&apos;t load. Try again, or start over.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="rounded-full bg-ink px-5 py-2.5 font-bold text-paper">Try again</button>
        <Link href="/" className="rounded-full bg-card px-5 py-2.5 font-bold shadow-[var(--shadow-soft)]">Home</Link>
      </div>
    </div>
  );
}
