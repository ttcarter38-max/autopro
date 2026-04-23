import { useTranslation } from 'react-i18next';
import { ShieldCheck, Truck, ClipboardCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WhyAutoPro() {
  const { t } = useTranslation();

  const pillars = [
    {
      key: 'escrow',
      icon: ShieldCheck,
      title: t('whyAutoPro.escrow.title'),
      body: t('whyAutoPro.escrow.body'),
    },
    {
      key: 'delivery',
      icon: Truck,
      title: t('whyAutoPro.delivery.title'),
      body: t('whyAutoPro.delivery.body'),
    },
    {
      key: 'inspection',
      icon: ClipboardCheck,
      title: t('whyAutoPro.inspection.title'),
      body: t('whyAutoPro.inspection.body'),
    },
  ];

  return (
    <div className="bg-muted py-20" data-testid="section-why-autopro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold tracking-widest mb-2" data-testid="text-why-eyebrow">
            {t('whyAutoPro.eyebrow')}
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-why-title">
            {t('whyAutoPro.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-why-subtitle">
            {t('whyAutoPro.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <Card
              key={p.key}
              className="p-8 flex flex-col items-start gap-4"
              data-testid={`card-why-${p.key}`}
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <p.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold" data-testid={`text-why-title-${p.key}`}>
                {p.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-why-body-${p.key}`}>
                {p.body}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
