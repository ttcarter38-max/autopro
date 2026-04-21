import { ShieldCheck, ClipboardCheck, BadgeCheck, Truck } from 'lucide-react';

const items = [
  { icon: ShieldCheck, label: 'Escrow Protected', sub: 'Funds released only on delivery' },
  { icon: ClipboardCheck, label: 'Inspection Backed', sub: 'Independent pre-purchase report' },
  { icon: BadgeCheck, label: 'Verified Sellers', sub: 'Title & ownership confirmed' },
  { icon: Truck, label: 'Insured Transport', sub: 'Door-to-door, fully covered' },
];

export default function TrustStrip() {
  return (
    <section className="bg-background border-b border-border" data-testid="section-trust-strip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-start gap-3"
              data-testid={`trust-item-${label.toLowerCase().replace(/\s+/g, '-')}`}
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
