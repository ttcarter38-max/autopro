import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import truckBanner from '@assets/8872a0c0-1aeb-4ad3-a144-7f94de3ad2d5_1776239408426.png';
import escrowBanner from '@assets/be14b73b-d8b1-4252-8d28-cacc0d9b235e_1776239412239.png';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();

  const slides = [
    { id: 1, image: truckBanner, key: 'slide1', ctaHref: '/escrow' },
    { id: 2, image: escrowBanner, key: 'slide2', ctaHref: '/escrow' },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
      key: 'slide3',
      ctaHref: '/inventory',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative h-[640px] sm:h-[720px] md:h-[780px] overflow-hidden bg-black">
      {slides.map((slide, index) => {
        const overlay =
          index === 0
            ? 'linear-gradient(100deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0) 100%)'
            : index === 1
            ? 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.65) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.75) 100%)';
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Image layer with Ken Burns zoom */}
            <div
              className={`absolute inset-0 bg-cover bg-center ${isActive ? 'ken-burns' : ''}`}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundPosition: 'center center',
              }}
              aria-hidden="true"
            />
            {/* Cinematic overlay */}
            <div
              className="absolute inset-0"
              style={{ backgroundImage: overlay }}
              aria-hidden="true"
            />
            {/* Bottom fade-to-bg for seamless transition into next section */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" aria-hidden="true" />

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-full flex items-center">
              <div
                className={`text-white max-w-2xl transition-all duration-[1100ms] ease-out ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-3.5 py-1.5 mb-5 float-soft"
                  data-testid={`badge-exclusive-${index}`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white">
                    {t('hero.badge')}
                  </span>
                </div>
                <p
                  className="text-[11px] sm:text-xs font-bold tracking-[0.32em] mb-4 text-primary uppercase"
                  data-testid={`text-eyebrow-${index}`}
                >
                  {t(`hero.${slide.key}.eyebrow`)}
                </p>
                <h2
                  className="text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-heading font-extrabold tracking-display mb-5 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-primary drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)]"
                  data-testid={`text-heading-${index}`}
                >
                  {t(`hero.${slide.key}.heading`)}
                </h2>
                <p
                  className="text-base sm:text-lg md:text-xl text-white/85 mb-8 max-w-xl leading-relaxed"
                  data-testid={`text-sub-${index}`}
                >
                  {t(`hero.${slide.key}.sub`)}
                </p>
                <div className="flex gap-3 sm:gap-4 flex-wrap">
                  <Button
                    variant="default"
                    size="lg"
                    asChild
                    className="shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.8)]"
                    data-testid={`button-cta-${index}`}
                  >
                    <a href={slide.ctaHref}>{t(`hero.${slide.key}.cta`)}</a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20"
                    asChild
                    data-testid={`button-inventory-${index}`}
                  >
                    <a href="/inventory">{t('hero.browseVehicles')}</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Side controls — hidden on small mobile to keep hero clean */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full hover-elevate text-white border border-white/20"
        data-testid="button-prev-slide"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-3 rounded-full hover-elevate text-white border border-white/20"
        data-testid="button-next-slide"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'bg-primary w-10' : 'bg-white/40 hover:bg-white/70 w-5'
            }`}
            data-testid={`button-dot-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
