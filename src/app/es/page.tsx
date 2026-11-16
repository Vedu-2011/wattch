import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";

export const metadata: Metadata = {
  title: "Wattch — el precio real de tu plan de luz",
  description: "Wattch lee la letra pequeña de cada plan de electricidad de Houston y de Dallas–Fort Worth y te muestra lo que de verdad cuesta cada uno con tu consumo.",
  alternates: { languages: { en: "/", es: "/es" } },
};

export default function HomeEs() {
  return <HomeView lang="es" />;
}
