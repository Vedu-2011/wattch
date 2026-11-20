import { Suspense } from "react";
import { NotFoundByUrl, NotFoundView } from "@/components/ErrorViews";

/** 404 — in Spanish when the link was Spanish (?lang=es or /es…). */
export default function NotFound() {
  return <Suspense fallback={<NotFoundView lang="en" />}><NotFoundByUrl /></Suspense>;
}
