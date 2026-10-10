import type { Metadata } from "next";
import ResultView from "@/components/create/ResultView";

export const metadata: Metadata = {
  title: "Your result | Ledify",
};

export default function ResultPage() {
  return <ResultView />;
}