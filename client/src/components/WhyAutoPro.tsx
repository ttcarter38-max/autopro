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
              className="group relative overflow-hidden p-8 flex flex-col items-start gap-5 border-card-border bg-gradient-to-br from-card via-card to-background transition-all duration-500 hover:border-primary/30 hover:shadow-[0_30px_60px_-25px_hsl(var(--primary)/0.45)] hover:-translate-y-1"
              data-testid={`card-why-${p.key}`}
            >
              <div
                className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                aria-hidden="true"
              />
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full bg-primary/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  aria-hidden="true"
                />
                <div className="relative inline-flex w-16 h-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/25 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-500 group-hover:scale-110">
                  <p.icon className="w-7 h-7 text-primary" strokeWidth={1.6} />
                </div>
              </div>
              <h3 className="relative text-xl font-heading font-bold tracking-display" data-testid={`text-why-title-${p.key}`}>
                {p.title}
              </h3>
              <p className="relative text-muted-foreground text-sm leading-relaxed" data-testid={`text-why-body-${p.key}`}>
                {p.body}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
