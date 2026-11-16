"use client";
import { useState } from "react";
import { timeAgo } from "@/lib/timeAgo";

type Live = { ok: true; via: "direct" | "anakin"; ms: number; same: boolean; pricesSame: boolean; readAt: string } | { ok: false; message: string };

/** Opens the provider's label again, right now, and says in plain words whether it still says what we read. */
export function LiveCheck({ id }: { id: string }) {
  const [state, setState] = useState<"idle" | "busy" | Live>("idle");
  async function run() {
    setState("busy");
    try {
      const r = await fetch(`/api/live?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      setState((await r.json()) as Live);
    } catch {
      setState({ ok: false, message: "Couldn't reach the provider's site right now. Try again in a minute." });
    }
  }
  const res = typeof state === "object" ? state : null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={run}
        disabled={state === "busy"}
        className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt disabled:opacity-60"
      >
        {state === "busy" ? "Opening the label…" : "Check this label again now"}
      </button>
      <div aria-live="polite" className="mt-2 text-sm [&>span]:block [&>span]:rounded-2xl [&>span]:px-3 [&>span]:py-2">
        {res && res.ok && res.same && (
          <span className="rounded-xl bg-good-2 px-2 py-1">✓ Same label, word for word, as when Wattch read it {timeAgo(res.readAt)}. Opened in {(res.ms / 1000).toFixed(1)}s.</span>
        )}
        {res && res.ok && !res.same && res.pricesSame && (
          <span className="rounded-xl bg-good-2 px-2 py-1">✓ The file is new (often just a new print date), but it still prints the same 3 prices we checked.</span>
        )}
        {res && res.ok && !res.same && !res.pricesSame && (
          <span className="rounded-xl bg-volt-2 px-2 py-1">This label changed since Wattch read it {timeAgo(res.readAt)}. The numbers here may be out of date until the next read.</span>
        )}
        {res && !res.ok && <span className="rounded-xl bg-volt-2 px-2 py-1">{res.message}</span>}
      </div>
    </div>
  );
}
