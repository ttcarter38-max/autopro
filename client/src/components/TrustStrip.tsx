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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, key, label, sub }) => (
            <div
              key={key}
              className="flex items-start gap-3"
              data-testid={`trust-item-${key}`}
            >
              <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground leading-tight">{label}</div>
                <div className="text-xs text-muted-foreground leading-tight mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
