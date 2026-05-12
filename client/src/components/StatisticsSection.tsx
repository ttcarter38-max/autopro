import { MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import conciergeAvatar from '@assets/generated_images/chat_concierge.png';
import iconCar from '@assets/generated_images/cat_car.png';
import iconRv from '@assets/generated_images/cat_rv.png';
import iconBoat from '@assets/generated_images/cat_boat.png';
import iconBike from '@assets/generated_images/cat_bike.png';
import iconTractor from '@assets/generated_images/cat_tractor.png';

export default function StatisticsSection() {
  const categories = [
    { img: iconCar, label: 'CARS' },
    { img: iconRv, label: 'RVS' },
    { img: iconBoat, label: 'BOATS' },
    { img: iconBike, label: 'MOTORCYCLES' },
    { img: iconTractor, label: 'TRACTORS' },
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
            Whatever moves you,
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/70"> delivered home.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-about-sub">
            Hand-picked, escrow-protected, inspection-backed. Try it on your driveway —
            if it&rsquo;s not the one, send it back. <span className="font-semibold text-foreground">Free.</span>
          </p>
        </div>

        {/* Categories — icons only, no numbers */}
        <div
          ref={grid.ref}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-16 sm:mb-20 stagger"
        >
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`group flex flex-col items-center text-center reveal ${grid.visible ? 'is-visible' : ''}`}
              data-testid={`category-${cat.label.toLowerCase()}`}
            >
              <div className="relative mb-5">
                {/* glow */}
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                {/* icon plate */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-card via-card to-background border border-card-border shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:-translate-y-1.5 overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="w-[78%] h-[78%] object-contain drop-shadow-md transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    data-testid={`img-category-${index}`}
                  />
                </div>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-foreground tracking-[0.22em]" data-testid={`text-category-label-${index}`}>
                {cat.label}
              </div>
            </div>
          ))}
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
