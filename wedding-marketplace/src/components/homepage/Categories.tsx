// 📁 Location: src/components/homepage/Categories.tsx
"use client";
import { useRouter } from "next/navigation";

export default function Categories() {
  const router = useRouter();

  const categories = [
    { name: "Photography", icon: "📸" },
    { name: "Catering", icon: "🍽️" },
    { name: "Decoration", icon: "💐" },
    { name: "Makeup Artist", icon: "💄" },
  ];

  return (
    <section className="py-24 px-6 md:px-16 bg-cream">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 text-gold text-xs font-medium tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-[1px] bg-gold"></span>
            Browse by Category
            <span className="w-6 h-[1px] bg-gold"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display text-charcoal">
            Everything for your <em className="text-burgundy font-light">perfect day</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-cream-dk flex flex-col items-center text-center group hover:-translate-y-1"
              onClick={() => router.push("/vendors")}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              <div className="text-lg font-semibold text-charcoal mb-1">{cat.name}</div>
              <div className="text-sm text-text-muted">100+ vendors</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}