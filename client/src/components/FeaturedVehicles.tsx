import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleCard from './VehicleCard';
import { vehicles } from '@/data/vehicles';

export default function FeaturedVehicles() {
  const [activeTab, setActiveTab] = useState('all');

  const getVehiclesByTab = (tab: string) => {
    if (tab === 'all') return vehicles.filter(v => v.featured).slice(0, 3);
    if (tab === 'new') return vehicles.filter(v => v.featured && v.condition === 'New').slice(0, 3);
    if (tab === 'used') return vehicles.filter(v => v.featured && v.condition === 'Used').slice(0, 3);
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
