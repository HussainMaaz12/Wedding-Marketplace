// 📁 Location: src/components/homepage/Testimonials.tsx
export default function Testimonials() {
  return (
    <section className="py-24 px-6 md:px-16 bg-cream">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="text-burgundy text-xs font-medium tracking-[0.18em] uppercase mb-4">
            Real Love Stories
          </div>
          <h2 className="text-4xl md:text-5xl font-display text-charcoal">
            What <em className="text-gold font-light">couples</em> are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { a: "A", name: "Ananya & Rohan Mehta", loc: "Mumbai", text: "WeddingConnect made finding our photographer so effortless. Kapoor Studio captured every emotion perfectly." },
            { a: "P", name: "Priya & Vikram Sharma", loc: "Delhi", text: "Found our dream caterer within an hour of searching! The advance payment system gave us complete peace of mind." },
            { a: "S", name: "Sunita & Arjun Patel", loc: "Bangalore", text: "The verified vendor badge gave us confidence. Our decorator transformed our venue beyond imagination." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-cream-dkr relative">
              <div className="text-6xl text-gold/20 font-display absolute top-4 right-6 leading-none">"</div>
              <p className="text-text-muted italic mb-8 relative z-10 leading-relaxed">
                {item.text}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-cream-dk flex items-center justify-center text-burgundy font-display font-semibold text-xl">
                  {item.a}
                </div>
                <div>
                  <div className="text-sm font-semibold text-charcoal">{item.name}</div>
                  <div className="text-xs text-text-light">{item.loc} Wedding</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}