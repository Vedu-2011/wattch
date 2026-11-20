import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return <Skeleton kind="plan" blocks={["h-56", "h-80", "h-48"]} />;
}
