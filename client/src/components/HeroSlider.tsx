import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import escrowBanner from '@assets/Design_a_realistic_banner_photo_for_the_Auto_Pro_automotive_es_1776236879324.png';
import truckBanner from '@assets/banner_auto_pro_1776236891031.png';

interface Slide {
  id: number;
  image: string;
  eyebrow: string;
  heading: string;
  sub: string;
  cta: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: truckBanner,
    eyebrow: 'NATIONWIDE VEHICLE TRANSPORT',
    heading: 'YOUR CAR. DELIVERED.',
    sub: 'Secure door-to-door auto transport across the country',
    cta: 'START ESCROW',
  },
  {
    id: 2,
    image: escrowBanner,
    eyebrow: 'TRUSTED ESCROW SERVICE',
    heading: 'BUY & SELL WITH CONFIDENCE',
    sub: 'Our escrow protects both buyer and seller every step of the way',
    cta: 'HOW IT WORKS',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
    eyebrow: 'PREMIUM INVENTORY',
    heading: 'FIND YOUR DREAM CAR',
    sub: 'Browse our curated selection of luxury and performance vehicles',
    cta: 'VIEW INVENTORY',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const ctaLinks: Record<string, string> = {
    'START ESCROW': '/escrow',
    'HOW IT WORKS': '/escrow',
    'VIEW INVENTORY': '/inventory',
  };

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: index < 2
                ? `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.82)), url(${slide.image})`
                : `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%), url(${slide.image})`,
              backgroundPosition: index === 0 ? 'center right' : 'center center',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <p className="text-xs font-bold tracking-[0.25em] mb-4 text-primary uppercase" data-testid={`text-eyebrow-${index}`}>
                  {slide.eyebrow}
                </p>
                <h2 className="text-5xl md:text-7xl font-heading font-extrabold tracking-wide mb-4 leading-tight" data-testid={`text-heading-${index}`}>
                  {slide.heading}
                </h2>
                <p className="text-lg text-white/80 mb-8" data-testid={`text-sub-${index}`}>{slide.sub}</p>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    variant="default"
                    size="lg"
                    asChild
                    data-testid={`button-cta-${index}`}
                  >
                    <a href={ctaLinks[slide.cta] || '/'}>{slide.cta}</a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white/40 text-white"
                    asChild
                    data-testid={`button-inventory-${index}`}
                  >
                    <a href="/inventory">BROWSE VEHICLES</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 rounded-full hover-elevate text-white"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm p-3 rounded-full hover-elevate text-white"
        data-testid="button-next-slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
            data-testid={`button-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
