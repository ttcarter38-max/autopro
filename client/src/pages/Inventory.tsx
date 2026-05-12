import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch, useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Car, Caravan, Sailboat, Bike, Tractor, LayoutGrid, ShieldCheck, SearchX, RotateCcw } from 'lucide-react';
import VehicleCard from '@/components/VehicleCard';
import VehicleCardSkeleton from '@/components/VehicleCardSkeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSeo } from '@/hooks/useSeo';

const CATEGORY_TABS: { slug: string | null; key: string; Icon: any }[] = [
  { slug: null, key: 'all', Icon: LayoutGrid },
  { slug: 'car', key: 'car', Icon: Car },
  { slug: 'rv', key: 'rv', Icon: Caravan },
  { slug: 'boat', key: 'boat', Icon: Sailboat },
  { slug: 'bike', key: 'bike', Icon: Bike },
  { slug: 'tractor', key: 'tractor', Icon: Tractor },
];

const VALID_SLUGS = new Set(['car', 'rv', 'boat', 'bike', 'tractor']);

export default function Inventory() {
  const { t } = useTranslation();
  useSeo({
    title: 'Inventory — Curated Vehicles',
    description:
      'Browse our curated inventory of cars, RVs, boats, motorcycles, and tractors. Maximum 10 per category. Every listing is verified and inspection-ready.',
  });
  const search_str = useSearch();
  const [, setLocation] = useLocation();

  const categoryParam = useMemo(() => {
    const params = new URLSearchParams(search_str || '');
    const c = params.get('category');
    return c && VALID_SLUGS.has(c) ? c : null;
  }, [search_str]);

  const { data, isLoading } = useQuery<{ vehicles: any[] }>({
    queryKey: ['/api/vehicles'],
  });

  const allVehicles = (data?.vehicles || []).filter((v) => v.available);

  const filteredVehicles = allVehicles
    .filter((v) => !categoryParam || (v.category || 'car') === categoryParam)
    .sort((a, b) => b.id - a.id);

  const countFor = (slug: string | null) =>
    slug === null
      ? allVehicles.length
      : allVehicles.filter((v) => (v.category || 'car') === slug).length;

  const goTo = (slug: string | null) =>
    setLocation(slug ? `/inventory?category=${slug}` : '/inventory');

  const activeMeta = CATEGORY_TABS.find((tab) => tab.slug === categoryParam) || CATEGORY_TABS[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase mb-2">
            {t('inventory.eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3" data-testid="text-inventory-title">
            {activeMeta.slug ? t(`inventory.categories.${activeMeta.key}`) : t('inventory.fullSelection')}
          </h1>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {t('inventory.tagline')}
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" data-testid="tabs-categories">
          {CATEGORY_TABS.map(({ slug, key, Icon }) => {
            const isActive = (slug ?? null) === categoryParam;
            const count = countFor(slug);
            return (
              <button
                key={slug ?? 'all'}
                onClick={() => goTo(slug)}
                data-testid={`tab-category-${slug ?? 'all'}`}
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold hover-elevate active-elevate-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(`inventory.categories.${key}`)}</span>
                <span className={`ml-1 text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            role="status"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="sr-only">{t('vehicleDetail.loading')}</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="relative max-w-xl mx-auto text-center py-20 px-6 rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] overflow-hidden" data-testid="state-inventory-empty">
            <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] mb-6 mx-auto">
              <SearchX className="w-9 h-9 text-primary" strokeWidth={1.6} />
            </div>
            <p className="text-2xl font-heading font-bold mb-2 tracking-display">{t('inventory.emptyTitle')}</p>
            <p className="text-muted-foreground mb-7 leading-relaxed">
              {t('inventory.emptyDesc')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {categoryParam && (
                <button
                  onClick={() => goTo(null)}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover-elevate active-elevate-2"
                  data-testid="button-reset-filters"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('inventory.resetFilters')}
                </button>
              )}
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover-elevate active-elevate-2"
                data-testid="button-view-all"
              >
                {t('inventory.viewAll')}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle: any) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                name={vehicle.name}
                image={vehicle.image || '/placeholder-car.png'}
                price={parseFloat(vehicle.price)}
                rating={4.5}
                ratingCount={2136}
                condition={vehicle.condition === 'new' ? 'New' : 'Used'}
                year={vehicle.year}
                transmission={vehicle.transmission}
                color={vehicle.color}
                topSpeed={vehicle.topSpeed || 'N/A'}
                createdAt={vehicle.createdAt}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
