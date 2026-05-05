import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import TrustShowcase from "@/components/TrustShowcase";
import Services from "@/components/Services";
import CTA from "@/components/CTA";
import ClubeVipSection from "@/components/ClubeVipSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-full overflow-x-clip">
        <Hero />
        <About />
        <TrustShowcase />
        <Services />
        <CTA />
        <ClubeVipSection />
      </main>
      <Footer />
    </>
  );
}
