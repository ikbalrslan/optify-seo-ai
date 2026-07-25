import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ClientSuccess } from "@/components/landing/ClientSuccess";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { AccountDeletedPopup } from "@/components/shared/AccountDeletedPopup";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF6EF] font-sans text-[#1C1815] selection:bg-[#009E8A]/20 selection:text-[#00877A]">
      <Navbar />
      <Hero />
      <ClientSuccess />
      <section id="features">
        <Features />
      </section>
      <Testimonials />
      <section id="pricing">
        <Pricing />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <Footer />
      <AccountDeletedPopup />
    </main>
  );
}
