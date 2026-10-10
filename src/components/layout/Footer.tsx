import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = 2026

  return (
    <footer className="w-full bg-[#0B0D17] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Link
          href="/"
          aria-label="Ledify home"
          className="flex items-center gap-2.5"
        >
          <Image src="/ledifyPhoto/Logo.png" alt="" width={120} height={120} />
  
        </Link>

        <p className="text-sm text-[#C9CBD6]">
          © {year} Ledify. All rights reserved.
        </p>
      </div>
    </footer>
  );
}