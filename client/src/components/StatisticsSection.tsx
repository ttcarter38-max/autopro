import { Car, Users, Wrench, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import conciergeAvatar from '@assets/generated_images/chat_concierge.png';

export default function StatisticsSection() {
  const stats = [
    { icon: Car, value: '1,886', label: 'NEW VEHICLES IN STOCK' },
    { icon: ShieldCheck, value: '1,248', label: 'ESCROW-PROTECTED DEALS' },
    { icon: Users, value: '12,481', label: 'HAPPY CLIENTS' },
    { icon: Wrench, value: '28,681', label: 'DELIVERIES NATIONWIDE' },
  ];

  const header = useScrollReveal<HTMLDivElement>();
  const grid = useScrollReveal<HTMLDivElement>();
  const cta = useScrollReveal<HTMLDivElement>();

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('autopro:open-chat'));
  };

  return (
    <div className="relative bg-muted py-20 sm:py-28 overflow-hidden">
      {/* subtle background accents */}
      <div className="pointer-events-none absolute inset-0 premium-halo opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <div
          ref={header.ref}
          className={`text-center mb-14 sm:mb-20 reveal ${header.visible ? 'is-visible' : ''}`}
        >
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary font-semibold tracking-[0.32em] mb-4 uppercase" data-testid="text-about-eyebrow">
            <Sparkles className="w-3.5 h-3.5" />
            The AutoPro Way
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-display leading-[1.05] mb-6" data-testid="text-about-title">
            Your dream car,
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/70"> delivered home.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-about-sub">
            Hand-picked, escrow-protected, inspection-backed. Try it on your driveway —
            if it&rsquo;s not the one, send it back. <span className="font-semibold text-foreground">Free.</span>
          </p>
        </div>

        {/* Stats */}
        <div
          ref={grid.ref}
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20 stagger`}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`text-center reveal ${grid.visible ? 'is-visible' : ''}`}
                data-testid={`stat-${index}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-display mb-2 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-[0.18em]" data-testid={`text-stat-label-${index}`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium chat CTA card */}
        <div
          ref={cta.ref}
          className={`reveal-zoom ${cta.visible ? 'is-visible' : ''}`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-card via-card to-card/80 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
            {/* Glow accent */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

            <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-10 p-6 sm:p-10">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/40 blur-2xl scale-110" aria-hidden="true" />
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl ring-4 ring-primary/20">
                  <img
                    src={conciergeAvatar}
                    alt="AutoPro concierge"
                    className="w-full h-full object-cover img-zoom"
                    data-testid="img-concierge"
                  />
                </div>
                {/* Online dot */}
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex items-center justify-center">
                  <span className="absolute w-4 h-4 rounded-full bg-emerald-400/60 animate-ping" />
                  <span className="relative w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 text-center md:text-left">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-600 dark:text-emerald-400 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Concierge Online
                </p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-display mb-2" data-testid="text-chat-cta-title">
                  Talk to a real human, instantly.
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0" data-testid="text-chat-cta-sub">
                  Have questions about a vehicle, escrow, or delivery? Our concierge team replies in seconds.
                </p>
              </div>

              {/* CTA */}
              <div className="shrink-0 w-full md:w-auto">
                <Button
                  size="lg"
                  variant="default"
                  onClick={openChat}
                  className="w-full md:w-auto gap-2 shadow-[0_15px_40px_-12px_hsl(var(--primary)/0.7)]"
                  data-testid="button-open-chat"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start a Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
