import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ShieldCheck } from 'lucide-react';
import VehicleCard from './VehicleCard';

export default function FeaturedVehicles() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<{ vehicles: any[] }>({
    queryKey: ['/api/vehicles/featured'],
  });

  const vehicles = (data?.vehicles || []).slice(0, 6);

  return (
    <div className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold tracking-widest mb-2" data-testid="text-featured-eyebrow">
            {t('featured.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4" data-testid="text-featured-title">
            {t('featured.title')}
          </h2>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-featured-meta">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>
              {isLoading ? t('featured.loading') : t('featured.meta', { count: vehicles.length })}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-md aspect-[3/4]" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('featured.empty')}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {vehicles.map((vehicle: any) => (
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
              <Button variant="default" size="lg" asChild data-testid="button-view-all">
                <Link href="/inventory">{t('featured.viewAll')}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
