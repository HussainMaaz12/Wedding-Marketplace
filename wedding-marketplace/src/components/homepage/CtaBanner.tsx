// 📁 Location: src/components/homepage/CtaBanner.tsx
"use client";
import { useRouter } from "next/navigation";
import Button from "../ui/Button"; // Reusing our updated button!

export default function CtaBanner() {
  const router = useRouter();

  return (
    <section className="px-6 md:px-16 pb-24 bg-cream">
      <div className="max-w-[1200px] mx-auto bg-burgundy rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden relative">
        {/* Background graphic */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">
            Are you a wedding <em className="text-gold font-light">vendor?</em>
          </h2>
          <p className="text-white/80 max-w-md text-sm md:text-base leading-relaxed">
            Join 5,000+ vendors already growing their business on WeddingConnect.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Button variant="gold" size="lg" onClick={() => router.push("/vendor/register")}>
            List Your Business →
          </Button>
        </div>
      </div>
    </section>
  );
}