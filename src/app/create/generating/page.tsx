import type { Metadata } from "next";
import Generating from "@/components/create/Generating";

export const metadata: Metadata = {
  title: "Creating your content | Ledify",
};

export default function GeneratingPage() {
  return <Generating />;
}