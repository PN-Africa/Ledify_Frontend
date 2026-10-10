import Image from "next/image";
import Hero from "@/components/layout/Home/Hero";
import Formats from "@/components/layout/Home/Formats";
import HowItWorks from "@/components/layout/Home/HowItWorks";
import FaQ from "@/components/layout/Home/FaQ";
import CtaBanner from "@/components/layout/Home/CtaBanner";
export default function Home() {
  return (
    <div>
      <Hero/>
      <Formats/>
      <HowItWorks/>
      <FaQ/>
      <CtaBanner/>
      
    </div>
  );
}
