import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleCard from './VehicleCard';
import whiteSUV from '@assets/generated_images/White_luxury_SUV_studio_shot_f7358436.png';
import blueSports from '@assets/generated_images/Blue_sports_car_studio_shot_5efd9737.png';
import blackSedan from '@assets/generated_images/Black_luxury_sedan_studio_shot_97a6a2cb.png';
import yellowSports from '@assets/generated_images/Yellow_sports_car_studio_shot_cd261208.png';
import silverCoupe from '@assets/generated_images/Silver_sports_coupe_studio_shot_7e85788f.png';

const allVehicles = [
  {
    id: 1,
    name: 'Cayenne Models',
    image: whiteSUV,
    price: 67200,
    rating: 4.5,
    ratingCount: 2136,
    condition: 'New' as const,
    year: 2024,
    transmission: 'Automatic',
    color: 'White',
    topSpeed: '159 mph',
    category: 'all',
  },
  {
    id: 2,
    name: '911 Carrera Models',
    image: yellowSports,
    price: 89400,
    rating: 4.8,
    ratingCount: 2147,
    condition: 'New' as const,
    year: 2024,
    transmission: 'Automatic',
    color: 'Yellow',
    topSpeed: '183 mph',
    category: 'new',
  },
  {
    id: 3,
    name: 'Panamera Models',
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
    category: 'new',
  },
  {
    id: 4,
    name: 'Boxster Models',
    image: blueSports,
    price: 56000,
    rating: 4.7,
    ratingCount: 2202,
    condition: 'Used' as const,
    year: 2022,
    transmission: 'Automatic',
    color: 'Blue',
    topSpeed: '170 mph',
    category: 'used',
  },
  {
    id: 5,
    name: 'Macan Models',
    image: silverCoupe,
    price: 65000,
    originalPrice: 67200,
    rating: 4.4,
    ratingCount: 2129,
    condition: 'Used' as const,
    year: 2023,
    transmission: 'Automatic',
    color: 'Silver',
    topSpeed: '159 mph',
    category: 'used',
  },
];

export default function FeaturedVehicles() {
  const [activeTab, setActiveTab] = useState('all');

  const getVehiclesByTab = (tab: string) => {
    if (tab === 'all') return allVehicles.slice(0, 3);
    if (tab === 'new') return allVehicles.filter(v => v.category === 'new').slice(0, 3);
    if (tab === 'used') return allVehicles.filter(v => v.category === 'used').slice(0, 3);
    return [];
  };

  return (
    <div className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold tracking-widest mb-2" data-testid="text-featured-eyebrow">
            RANDOM VEHICLES
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8" data-testid="text-featured-title">
            FEATURED VEHICLES
          </h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-12" data-testid="tabs-featured">
              <TabsTrigger value="all" data-testid="tab-all">ALL CARS</TabsTrigger>
              <TabsTrigger value="new" data-testid="tab-new">NEW CARS</TabsTrigger>
              <TabsTrigger value="used" data-testid="tab-used">USED CARS</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {getVehiclesByTab(activeTab).map((vehicle) => (
                  <VehicleCard key={vehicle.id} {...vehicle} />
                ))}
              </div>
              <div className="text-center">
                <Button variant="default" size="lg" data-testid="button-view-all">
                  VIEW ALL
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
