import type { Metadata } from "next";
import FormatPicker from "@/components/create/FormatPicker";

export const metadata: Metadata = {
  title: "Choose a format | Ledify",
};

export default function FormatPage() {
  return <FormatPicker />;
}