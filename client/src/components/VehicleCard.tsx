import { Star } from 'lucide-react';
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
}: VehicleCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all hover:shadow-xl" data-testid={`card-vehicle-${id}`}>
      <div className="relative aspect-square bg-white p-8">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain"
          data-testid={`img-vehicle-${id}`}
        />
        {originalPrice && (
          <Badge variant="destructive" className="absolute top-4 right-4" data-testid={`badge-sale-${id}`}>
            SALE
          </Badge>
        )}
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

        <h3 className="text-xl font-heading font-bold mb-3" data-testid={`text-name-${id}`}>
          {name}
        </h3>

        <div className="mb-4">
          {originalPrice && (
            <span className="text-lg text-muted-foreground line-through mr-2" data-testid={`text-original-price-${id}`}>
              ${originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-bold text-primary" data-testid={`text-price-${id}`}>
            ${price.toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          Premium luxury vehicle with exceptional performance and comfort.
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">{condition}</Badge>
          </div>
          <div className="text-muted-foreground" data-testid={`text-year-${id}`}>{year}</div>
          <div className="text-muted-foreground" data-testid={`text-transmission-${id}`}>{transmission}</div>
          <div className="text-muted-foreground" data-testid={`text-color-${id}`}>{color}</div>
          <div className="text-muted-foreground col-span-2" data-testid={`text-speed-${id}`}>{topSpeed}</div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button className="w-full" variant="default" data-testid={`button-order-${id}`}>
          ORDER NOW
        </Button>
      </CardFooter>
    </Card>
  );
}
