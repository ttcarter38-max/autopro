import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import VehicleSearchBar from '@/components/VehicleSearchBar';
import SpecialOffers from '@/components/SpecialOffers';
import StatisticsSection from '@/components/StatisticsSection';
import FeaturedVehicles from '@/components/FeaturedVehicles';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSlider />
      <VehicleSearchBar />
      <SpecialOffers />
      <StatisticsSection />
      <FeaturedVehicles />
      <Footer />
    </div>
  );
}
