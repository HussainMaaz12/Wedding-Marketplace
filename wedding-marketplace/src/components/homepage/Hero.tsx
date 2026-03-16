"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 w-full flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content */}
        <div className="flex-1 w-full max-w-2xl z-10 animate-fadeUp">
          <div className="flex items-center gap-3 text-gold text-xs md:text-sm font-medium tracking-[0.18em] uppercase mb-6">
            <span className="w-8 h-[1px] bg-gold"></span>
            India's Premium Wedding Marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-display text-charcoal leading-[1.1] mb-6">
            Find the <span className="italic text-burgundy font-light">perfect</span><br />
            vendors for your<br />
            dream wedding
          </h1>

          <p className="text-lg text-text-muted mb-10 max-w-xl leading-relaxed">
            Discover verified photographers, caterers, decorators,
            and more. Compare packages, read reviews, and book confidently.
          </p>

          {/* Search Box */}
          <div className="bg-white p-3 md:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center border border-cream-dkr">
            <div className="flex flex-col w-full px-2 md:px-4 py-2 border-b md:border-b-0 md:border-r border-cream-dkr">
              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">City</label>
              <select className="bg-transparent text-charcoal font-medium outline-none cursor-pointer">
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
              </select>
            </div>

            <div className="flex flex-col w-full px-2 md:px-4 py-2">
              <label className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Category</label>
              <select className="bg-transparent text-charcoal font-medium outline-none cursor-pointer">
                <option>All Categories</option>
                <option>Photography</option>
                <option>Decoration</option>
              </select>
            </div>

            <button
              className="bg-burgundy text-white px-8 py-4 rounded-xl font-medium hover:bg-burgundy-dk transition-colors w-full md:w-auto whitespace-nowrap shadow-lg shadow-burgundy/20"
              onClick={() => router.push("/vendors")}
            >
              Search Vendors
            </button>
          </div>
        </div>

        {/* Right Image/Graphic placeholder */}
        <div className="flex-1 w-full relative h-[500px] lg:h-[700px] animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          {/* Main Image Frame */}
          <div className="absolute inset-0 bg-cream-dk rounded-t-[200px] rounded-b-3xl overflow-hidden shadow-2xl border-8 border-white">
             {/* Placeholder for actual image: <img src="/hero-img.jpg" className="w-full h-full object-cover" alt="Wedding" /> */}
             <div className="w-full h-full bg-gradient-to-tr from-cream-dkr to-cream-dk flex items-center justify-center">
                <span className="text-text-muted/50 font-display italic text-2xl">Image Placeholder</span>
             </div>
          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-burgundy/5 rounded-full blur-3xl"></div>
        </div>

      </div>
    </section>
  );
}