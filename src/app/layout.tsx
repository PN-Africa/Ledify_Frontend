import type { Metadata } from "next";
import { Bricolage_Grotesque ,Outfit} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { bricolage,outfit } from "@/lib/fonts/fonts";



export const metadata: Metadata = {
  title: "Ledify",
  description: "Turn any idea into a polished presentation, page, or document, instantly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.className} ${outfit.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer/>
      </body>
    </html>
  );
}