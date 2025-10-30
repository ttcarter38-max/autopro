import VehicleCard from './VehicleCard';
import { vehicles } from '@/data/vehicles';

export default function SpecialOffers() {
  const specialOffers = vehicles.filter(v => v.special).slice(0, 4);

  return (
    <div className="bg-muted py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold tracking-widest mb-2" data-testid="text-offers-eyebrow">
            MOST WANTED ITEM
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-offers-title">
            SPECIAL OFFERS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialOffers.map((vehicle) => (
            <VehicleCard key={vehicle.id} {...vehicle} />
          ))}
        </div>
      </div>
    </div>
  );
}
