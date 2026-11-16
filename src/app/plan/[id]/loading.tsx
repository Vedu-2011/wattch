import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return <Skeleton label="Opening the fine print…" blocks={["h-56", "h-80", "h-48"]} />;
}
