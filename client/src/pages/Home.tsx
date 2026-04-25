import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import TrustStrip from '@/components/TrustStrip';
import WhyAutoPro from '@/components/WhyAutoPro';
import StatisticsSection from '@/components/StatisticsSection';
import FeaturedVehicles from '@/components/FeaturedVehicles';
import RecentTransactions from '@/components/RecentTransactions';
import Footer from '@/components/Footer';
import { useSeo } from '@/hooks/useSeo';

export default function Home() {
  useSeo({
    title: 'AutoPro — Curated, Invitation-Only Vehicle Marketplace with Escrow',
    description:
      'Invitation-only dealership for cars, RVs, boats, motorcycles, and tractors. Maximum 10 vehicles per category. Escrow-protected. Inspection-backed. Delivered with care.',
  });
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSlider />
      <TrustStrip />
      <WhyAutoPro />
      <StatisticsSection />
      <FeaturedVehicles />
      <RecentTransactions />
      <Footer />
    </div>
  );
}
