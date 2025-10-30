import VehicleCard from './VehicleCard';
import whiteSUV from '@assets/generated_images/White_luxury_SUV_studio_shot_f7358436.png';
import blueSports from '@assets/generated_images/Blue_sports_car_studio_shot_5efd9737.png';
import blackSedan from '@assets/generated_images/Black_luxury_sedan_studio_shot_97a6a2cb.png';
import yellowSports from '@assets/generated_images/Yellow_sports_car_studio_shot_cd261208.png';

const specialOffers = [
  {
    id: 11,
    name: 'Cayenne Turbo',
    image: whiteSUV,
    price: 67200,
    rating: 4.5,
    ratingCount: 2136,
    condition: 'New' as const,
    year: 2024,
    transmission: 'Automatic',
    color: 'White',
    topSpeed: '159 mph',
  },
  {
    id: 12,
    name: '911 Carrera S',
    image: yellowSports,
    price: 89400,
    rating: 4.8,
    ratingCount: 2147,
    condition: 'New' as const,
    year: 2024,
    transmission: 'Automatic',
    color: 'Yellow',
    topSpeed: '183 mph',
  },
  {
    id: 13,
    name: 'Panamera 4S',
    image: blackSedan,
    price: 80000,
    originalPrice: 85000,
    rating: 4.6,
    ratingCount: 2134,
    condition: 'New' as const,
    year: 2024,
    transmission: 'Automatic',
    color: 'Black',
    topSpeed: '164 mph',
  },
  {
    id: 14,
    name: '718 Boxster',
    image: blueSports,
    price: 56000,
    rating: 4.7,
    ratingCount: 2202,
    condition: 'New' as const,
    year: 2024,
    transmission: 'Automatic',
    color: 'Blue',
    topSpeed: '170 mph',
  },
];

export default function SpecialOffers() {
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
