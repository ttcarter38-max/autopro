import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import VehicleCard from './VehicleCard';

export default function FeaturedVehicles() {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/vehicles/featured'],
  });

  const getVehiclesByTab = (tab: string) => {
    const vehicles = data?.vehicles || [];
    if (tab === 'all') return vehicles.slice(0, 3);
    if (tab === 'new') return vehicles.filter((v: any) => v.condition === 'new').slice(0, 3);
    if (tab === 'used') return vehicles.filter((v: any) => v.condition === 'used').slice(0, 3);
    return [];
  };

  const handleViewAll = () => {
    toast({
      title: "Full Inventory",
      description: "Browse our complete collection of premium vehicles. Contact us at 1-800-CAR-DEAL for more details.",
    });
  };

  const displayVehicles = getVehiclesByTab(activeTab);

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
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading vehicles...</p>
                </div>
              ) : displayVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No vehicles available. Log in to the admin panel to add vehicles!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {displayVehicles.map((vehicle: any) => (
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
                  <div className="text-center">
                    <Button 
                      variant="default" 
                      size="lg" 
                      onClick={handleViewAll}
                      data-testid="button-view-all"
                    >
                      VIEW ALL
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
