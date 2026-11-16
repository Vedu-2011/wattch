import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return <Skeleton label="Getting every plan…" blocks={["h-12", "h-64", "h-40"]} />;
}
