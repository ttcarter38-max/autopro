import { useQuery } from '@tanstack/react-query';
import VehicleCard from './VehicleCard';

export default function SpecialOffers() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/vehicles/featured'],
  });

  const specialOffers = data?.vehicles?.slice(0, 4) || [];

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

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading vehicles...</p>
          </div>
        ) : specialOffers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No special offers at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialOffers.map((vehicle: any) => (
              <VehicleCard 
                key={vehicle.id} 
                id={vehicle.id}
                name={vehicle.name}
                image={vehicle.image || '/placeholder-car.png'}
                price={parseFloat(vehicle.price)}
                originalPrice={vehicle.originalPrice ? parseFloat(vehicle.originalPrice) : undefined}
                rating={4.5}
                ratingCount={2136}
                condition={vehicle.condition === 'new' ? 'New' : 'Used'}
                year={vehicle.year}
                transmission={vehicle.transmission}
                color={vehicle.color}
                topSpeed={vehicle.topSpeed || 'N/A'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
