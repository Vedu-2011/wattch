import { NextResponse } from "next/server";
import { planById } from "@/lib/plans/data";
import { fetchEfl } from "@/lib/reader/fetchEfl";

export const maxDuration = 60;

/** Re-fetches one plan's fine print right now and says whether it changed since Wattch read it. No AI call, no cost. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const rec = planById(id);
  if (!rec) return NextResponse.json({ ok: false, message: "We don't know that plan." }, { status: 404 });
  try {
    const f = await fetchEfl(rec.meta.eflUrl, { anakinKey: process.env.ANAKIN_API_KEY, timeoutMs: 15000 });
    return NextResponse.json({ ok: true, via: f.via, ms: f.ms, same: f.sha256 === rec.read.sha256, readAt: rec.read.fetchedAt });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : "Couldn't open it right now." }, { status: 200 });
  }
}
