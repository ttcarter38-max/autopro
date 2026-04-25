import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Car, Caravan, Sailboat, Bike, Tractor } from 'lucide-react';
import { formatDistanceToNowI18n } from '@/lib/dateLocale';

interface CompletedItem {
  completedAt: string;
  vehicleLabel: string;
  category: string | null;
}

const CATEGORY_ICON: Record<string, any> = {
  car: Car,
  rv: Caravan,
  boat: Sailboat,
  bike: Bike,
  tractor: Tractor,
};

export default function RecentTransactions() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery<{ items: CompletedItem[] }>({
    queryKey: ['/api/transactions/recent-completed'],
  });

  const items = data?.items ?? [];

  // Hide the section entirely if there are not enough completed sales
  if (isLoading || items.length < 3) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30 border-y border-border" data-testid="section-recent-transactions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
            {t('recentTransactions.eyebrow')}
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
            {t('recentTransactions.title')}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {t('recentTransactions.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {items.map((item, idx) => {
            const Icon = (item.category && CATEGORY_ICON[item.category]) || Car;
            const completedAt = new Date(item.completedAt);
            const ago = formatDistanceToNowI18n(completedAt, i18n.language);

            return (
              <div
                key={`${item.completedAt}-${idx}`}
                className="flex items-start gap-3 p-4 rounded-md border border-border bg-background"
                data-testid={`recent-tx-${idx}`}
              >
                <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('recentTransactions.delivered')}</span>
                  </div>
                  <p className="font-semibold text-sm truncate" data-testid={`recent-tx-label-${idx}`}>
                    {item.vehicleLabel}
                  </p>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground" data-testid={`recent-tx-ago-${idx}`}>
                      {ago}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
