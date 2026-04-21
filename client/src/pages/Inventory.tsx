import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from 'wouter';
import { Search, SlidersHorizontal, X, Car, Caravan, Sailboat, Bike, Tractor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const CATEGORY_META: Record<string, { label: string; title: string; subtitle: string; Icon: any }> = {
  car: { label: 'Cars', title: 'Cars', subtitle: 'Browse our full collection of cars', Icon: Car },
  rv: { label: 'RVs', title: 'RVs & Motorhomes', subtitle: 'Explore RVs and motorhomes available with full escrow protection', Icon: Caravan },
  boat: { label: 'Boats', title: 'Boats', subtitle: 'Find your next boat — secured by AutoPro escrow', Icon: Sailboat },
  bike: { label: 'Motorcycles', title: 'Motorcycles', subtitle: 'Browse motorcycles available for secure purchase', Icon: Bike },
  tractor: { label: 'Tractors', title: 'Tractors', subtitle: 'Agricultural and utility tractors available now', Icon: Tractor },
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import VehicleCard from '@/components/VehicleCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under $50,000', min: 0, max: 50000 },
  { label: '$50,000 – $100,000', min: 50000, max: 100000 },
  { label: '$100,000 – $200,000', min: 100000, max: 200000 },
  { label: 'Over $200,000', min: 200000, max: Infinity },
];

export default function Inventory() {
  const search_str = useSearch();
  const categoryParam = useMemo(() => {
    const params = new URLSearchParams(search_str || '');
    const c = params.get('category');
    return c && CATEGORY_META[c] ? c : null;
  }, [search_str]);

  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data, isLoading } = useQuery<{ vehicles: any[] }>({
    queryKey: ['/api/vehicles'],
  });

  const allVehicles = data?.vehicles || [];
  const meta = categoryParam ? CATEGORY_META[categoryParam] : null;

  const filteredVehicles = allVehicles
    .filter((v) => {
      if (!v.available) return false;
      if (categoryParam && (v.category || 'car') !== categoryParam) return false;
      if (condition !== 'all' && v.condition !== condition) return false;

      if (priceRange !== 'all') {
        const range = PRICE_RANGES.find((r) => r.label === priceRange);
        if (range) {
          const price = parseFloat(v.price);
          if (price < range.min || price > range.max) return false;
        }
      }

      if (search) {
        const q = search.toLowerCase();
        return (
          v.name?.toLowerCase().includes(q) ||
          v.make?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          String(v.year).includes(q) ||
          v.color?.toLowerCase().includes(q)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'year-asc') return a.year - b.year;
      return b.id - a.id;
    });

  const activeFilters = [
    condition !== 'all' && condition,
    priceRange !== 'all' && priceRange,
  ].filter(Boolean) as string[];

  const clearAll = () => {
    setSearch('');
    setCondition('all');
    setPriceRange('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-heading font-bold mb-2 flex items-center gap-3" data-testid="text-inventory-title">
            {meta && <meta.Icon className="w-9 h-9 text-primary" />}
            {meta ? meta.title : 'Vehicle Inventory'}
          </h1>
          <p className="text-muted-foreground">
            {meta ? meta.subtitle : 'Browse our full collection of premium vehicles'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-md p-4 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>

            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger data-testid="select-condition">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger data-testid="select-price-range">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                {PRICE_RANGES.slice(1).map((r) => (
                  <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="year-desc">Year: Newest</SelectItem>
                <SelectItem value="year-asc">Year: Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter chips */}
          {(activeFilters.length > 0 || search) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Active filters:
              </span>
              {search && (
                <Badge variant="secondary" className="gap-1">
                  "{search}"
                  <button onClick={() => setSearch('')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {activeFilters.map((f) => (
                <Badge key={f} variant="secondary" className="gap-1">
                  {f}
                  <button
                    onClick={() => {
                      if (f === condition) setCondition('all');
                      else if (f === priceRange) setPriceRange('all');
                    }}
                    className="ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-6" data-testid="text-results-count">
            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-md aspect-[3/4]" />
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-semibold mb-3">No vehicles found</p>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search term.
            </p>
            <Button onClick={clearAll} data-testid="button-clear-filters">
              Clear Filters
            </Button>
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
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
