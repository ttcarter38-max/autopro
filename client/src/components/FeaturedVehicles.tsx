import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ShieldCheck } from 'lucide-react';
import VehicleCard from './VehicleCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function FeaturedVehicles() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<{ vehicles: any[] }>({
    queryKey: ['/api/vehicles/featured'],
  });

  const vehicles = (data?.vehicles || []).slice(0, 6);

  const header = useScrollReveal<HTMLDivElement>();
  const grid = useScrollReveal<HTMLDivElement>();

  return (
    <div className="relative bg-background py-16 sm:py-24 overflow-hidden">
      {/* Subtle radial accent */}
      <div className="pointer-events-none absolute inset-0 premium-halo opacity-40" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={header.ref}
          className={`text-center mb-12 sm:mb-16 reveal ${header.visible ? 'is-visible' : ''}`}
        >
          <p className="text-xs sm:text-sm text-primary font-semibold tracking-[0.28em] mb-3 uppercase" data-testid="text-featured-eyebrow">
            {t('featured.eyebrow')}
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-display mb-4" data-testid="text-featured-title">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-md aspect-[3/4]" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('featured.empty')}</p>
          </div>
        ) : (
          <>
            <div
              ref={grid.ref}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 stagger ${
                grid.visible ? '' : ''
              }`}
            >
              {vehicles.map((vehicle: any) => (
                <div key={vehicle.id} className={`reveal ${grid.visible ? 'is-visible' : ''}`}>
                  <VehicleCard
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
                    createdAt={vehicle.createdAt}
                  />
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button
                variant="default"
                size="lg"
                asChild
                className="shadow-[0_10px_40px_-12px_hsl(var(--primary)/0.6)]"
                data-testid="button-view-all"
              >
                <Link href="/inventory">{t('featured.viewAll')}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
