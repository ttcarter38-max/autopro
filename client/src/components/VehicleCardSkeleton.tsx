import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function VehicleCardSkeleton() {
  return (
    <Card className="overflow-hidden" data-testid="skeleton-vehicle-card">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/40 via-muted/20 to-background p-8 shimmer-block">
        <div className="w-full h-full rounded-md bg-gradient-to-br from-muted/60 to-muted/30" />
      </div>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-sm bg-muted/60 shimmer-block" />
          ))}
          <div className="ml-2 h-3 w-10 rounded-sm bg-muted/60 shimmer-block" />
        </div>
        <div className="h-6 w-3/4 rounded-sm bg-muted/70 shimmer-block" />
        <div className="h-7 w-1/2 rounded-sm bg-muted/70 shimmer-block" />
        <div className="space-y-2 pt-1">
          <div className="h-3 w-full rounded-sm bg-muted/50 shimmer-block" />
          <div className="h-3 w-2/3 rounded-sm bg-muted/50 shimmer-block" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-4 rounded-sm bg-muted/50 shimmer-block" />
          <div className="h-4 rounded-sm bg-muted/50 shimmer-block" />
          <div className="h-4 rounded-sm bg-muted/50 shimmer-block" />
          <div className="h-4 rounded-sm bg-muted/50 shimmer-block" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="h-10 w-full rounded-md bg-muted/60 shimmer-block" />
      </CardFooter>
    </Card>
  );
}
