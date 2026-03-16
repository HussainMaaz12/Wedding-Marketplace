// 📁 Location: src/components/homepage/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Search & Filter", desc: "Browse thousands of verified vendors by city, category, date, and budget." },
    { num: "02", title: "Compare & Choose", desc: "Read real reviews, view portfolios, and compare packages side by side." },
    { num: "03", title: "Send Enquiry", desc: "Send a booking enquiry with your event details. Vendors respond within 24 hrs." },
    { num: "04", title: "Pay & Confirm", desc: "Secure advance payment locks your date. Balance paid after your event." },
  ];

  return (
    <section className="py-24 px-6 md:px-16 bg-charcoal text-cream">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
          <div className="text-gold text-xs font-medium tracking-[0.18em] uppercase mb-4">
            Simple Process
          </div>
          <h2 className="text-4xl md:text-5xl font-display">
            How <em className="text-gold font-light">WeddingConnect</em> works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Optional: Add a connecting line for desktop here later */}
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col relative">
              <div className="text-6xl md:text-7xl font-display text-white/5 font-bold mb-4 absolute -top-8 -left-4 z-0">
                {step.num}
              </div>
              <div className="relative z-10">
                <div className="text-gold font-medium mb-3">{step.title}</div>
                <p className="text-sm text-white/60 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}