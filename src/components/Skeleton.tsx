import { Kapi } from "@/components/Kapi";

/** Loading placeholder: soft blocks in the page's shape, plus Kapi reading. */
export function Skeleton({ label, blocks }: { label: string; blocks: string[] }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-5" role="status" aria-live="polite">
      <div className="flex items-end gap-3">
        <Kapi reading className="h-14 w-14 shrink-0" />
        <p className="display text-3xl font-extrabold sm:text-4xl">{label}</p>
      </div>
      <div className="mt-6 space-y-4">
        {blocks.map((h, i) => <div key={i} className={`skeleton rounded-3xl bg-paper-2 ${h}`} />)}
      </div>
    </div>
  );
}
