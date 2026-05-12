import { Star } from 'lucide-react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowI18n } from '@/lib/dateLocale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VehicleCardProps {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  condition: 'New' | 'Used';
  year: number;
  transmission: string;
  color: string;
  topSpeed: string;
  createdAt?: string | Date | null;
}

export default function VehicleCard({
  id,
  name,
  image,
  price,
  originalPrice,
  rating,
  ratingCount,
  condition,
  year,
  transmission,
  color,
  topSpeed,
  createdAt,
}: VehicleCardProps) {
  const { t, i18n } = useTranslation();
  const conditionLabel = condition === 'New' ? t('vehicleCard.new') : t('vehicleCard.used');
  const listedAgo = createdAt
    ? formatDistanceToNowI18n(new Date(createdAt), i18n.language)
    : null;
  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-500 hover:shadow-2xl hover:-translate-y-1" data-testid={`card-vehicle-${id}`}>
      <Link href={`/vehicle/${id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black p-8">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain img-zoom"
            data-testid={`img-vehicle-${id}`}
          />
          {originalPrice && (
            <Badge variant="destructive" className="absolute top-4 right-4 shadow-lg" data-testid={`badge-sale-${id}`}>
              {t('vehicleCard.sale')}
            </Badge>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent dark:from-black/30" />
        </div>

        <CardContent className="p-6">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2" data-testid={`text-rating-${id}`}>
              ({ratingCount})
            </span>
          </div>

          <h3 className="text-xl font-heading font-bold mb-3 tracking-display" data-testid={`text-name-${id}`}>
            {name}
          </h3>

          <div className="mb-4 flex items-baseline gap-2 flex-wrap">
            {originalPrice && (
              <span className="text-base text-muted-foreground line-through" data-testid={`text-original-price-${id}`}>
                ${originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-2xl font-bold tracking-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70" data-testid={`text-price-${id}`}>
              ${price.toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {t('vehicleCard.description')}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-semibold">{conditionLabel}</Badge>
            </div>
            <div className="text-muted-foreground" data-testid={`text-year-${id}`}>{year}</div>
            <div className="text-muted-foreground" data-testid={`text-transmission-${id}`}>{transmission}</div>
            <div className="text-muted-foreground" data-testid={`text-color-${id}`}>{color}</div>
            <div className="text-muted-foreground col-span-2" data-testid={`text-speed-${id}`}>{topSpeed}</div>
          </div>

          {listedAgo && (
            <p
              className="text-xs text-muted-foreground mt-3"
              data-testid={`text-listed-${id}`}
            >
              {t('vehicleCard.listed', { when: listedAgo })}
            </p>
          )}
        </CardContent>
      </Link>

      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full" 
          variant="default" 
          asChild
          data-testid={`button-order-${id}`}
        >
          <Link href={`/vehicle/${id}`}>{t('vehicleCard.viewDetails')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
