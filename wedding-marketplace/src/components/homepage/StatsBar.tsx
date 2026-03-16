// 📁 Location: src/components/homepage/StatsBar.tsx
"use client";

import { useEffect } from "react";

export default function StatsBar() {
  useEffect(() => {
    const counters = document.querySelectorAll("[data-target]");

    counters.forEach((el) => {
      const target = Number(el.getAttribute("data-target"));
      let current = 0;
      const increment = target / 100;

      const update = () => {
        current += increment;
        if (current < target) {
          (el as HTMLElement).innerText = Math.floor(current).toLocaleString("en-IN") + "+";
          requestAnimationFrame(update);
        } else {
          (el as HTMLElement).innerText = target.toLocaleString("en-IN") + "+";
        }
      };
      update();
    });
  }, []);

  return (
    <div className="bg-charcoal text-white py-16 px-6 md:px-16 border-t border-b border-gold/20 relative z-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
        {[
          { target: "5000", label: "Verified Vendors" },
          { target: "28", label: "Cities Covered" },
          { target: "12000", label: "Happy Couples" },
          { target: "4", label: "Average Rating" },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            <span className="text-4xl md:text-5xl font-display text-gold mb-2" data-target={stat.target}>
              0
            </span>
            <div className="text-xs tracking-[0.15em] uppercase text-white/60 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}