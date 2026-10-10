import Image from "next/image";
import Link from "next/link";
import Star from "@/components/ui/Star";



export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-2 z-50   backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
         <Link href="/" className="flex items-center gap-2">
          <Image src="/ledifyPhoto/Logo.png" alt="Ledify" width={120} height={120} />
          
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            How it works
          </Link>
          <Link
          href="/create"
          className="rounded-lg bg-[#6843EC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5736c7]"
        >
          Create with Ledify
        </Link>
        </nav>

        
      </div>
    </header>
  );
}