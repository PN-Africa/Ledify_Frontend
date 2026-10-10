import type { Metadata } from "next";
import CreateInput from "@/components/create/CreateInput";

export const metadata: Metadata = {
  title: "Create | Ledify",
};



export default async function CreatePage() {
  
  return <CreateInput  />;
}