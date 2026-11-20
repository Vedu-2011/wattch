"use client";
import { ErrorView } from "@/components/ErrorViews";

/** Something broke while showing a page. Never show a stack trace; offer a retry and a way home (in the page's language). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView reset={reset} />;
}
