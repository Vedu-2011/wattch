import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";

export const metadata: Metadata = { alternates: { languages: { en: "/", es: "/es" } } };

export default function Home() {
  return <HomeView lang="en" />;
}
