import Hero from "@/components/homepage/Hero";
import StatsBar from "@/components/homepage/StatsBar";
import Categories from "@/components/homepage/Categories";
import FeaturedVendors from "@/components/homepage/VendorCard";
import HowItWorks from "@/components/homepage/HowItWorks";
import Testimonials from "@/components/homepage/Testimonials";
import CtaBanner from "@/components/homepage/CtaBanner";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WeddingConnect — India\'s Premium Wedding Marketplace',
  description: 'Discover verified photographers, caterers, decorators, and more. Compare packages, read real reviews, and book with complete confidence.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <Categories />
      <FeaturedVendors />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
}