import { Car, Users, Wrench, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function StatisticsSection() {
  const { t } = useTranslation();
  const stats = [
    { icon: Car, value: '1886', label: t('stats.newCars') },
    { icon: Car, value: '1248', label: t('stats.usedCars') },
    { icon: Users, value: '12,481', label: t('stats.happyClients') },
    { icon: Wrench, value: '28,681', label: t('stats.spareParts') },
  ];

  return (
    <div className="bg-muted py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold tracking-widest mb-2" data-testid="text-about-eyebrow">
            {t('stats.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-about-title">
            {t('stats.title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-5xl md:text-6xl font-heading font-bold mb-2" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-muted-foreground" data-testid={`text-stat-label-${index}`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-card-border rounded-md p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Award className="w-16 h-16 text-primary" />
            <div>
              <p className="text-sm font-semibold mb-1" data-testid="text-question">{t('stats.haveQuestion')}</p>
              <p className="text-2xl font-bold" data-testid="text-call-us">{t('stats.callUs')}</p>
            </div>
          </div>
          <Button size="lg" variant="default" data-testid="button-learn-more">
            {t('stats.learnMore')}
          </Button>
        </div>
      </div>
    </div>
  );
}
