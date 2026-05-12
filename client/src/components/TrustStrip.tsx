import { ShieldCheck, ClipboardCheck, BadgeCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TrustStrip() {
  const { t } = useTranslation();
  const items = [
    { icon: ShieldCheck, key: 'escrowProtected', label: t('trust.escrowProtected'), sub: t('trust.escrowProtectedSub') },
    { icon: ClipboardCheck, key: 'inspectionBacked', label: t('trust.inspectionBacked'), sub: t('trust.inspectionBackedSub') },
    { icon: BadgeCheck, key: 'verifiedSellers', label: t('trust.verifiedSellers'), sub: t('trust.verifiedSellersSub') },
    { icon: Truck, key: 'insuredTransport', label: t('trust.insuredTransport'), sub: t('trust.insuredTransportSub') },
  ];

  return (
    <section className="bg-background border-b border-border" data-testid="section-trust-strip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, key, label, sub }) => (
            <div
              key={key}
              className="group relative flex items-start gap-3 rounded-md p-2 transition-all duration-300"
              data-testid={`trust-item-${key}`}
            >
              <div className="relative shrink-0">
                <div
                  className="absolute inset-0 rounded-full bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  aria-hidden="true"
                />
                <div className="relative inline-flex w-11 h-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/25 shadow-[0_10px_25px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-300 group-hover:scale-105">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground leading-tight">{label}</div>
                <div className="text-xs text-muted-foreground leading-snug mt-1">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
