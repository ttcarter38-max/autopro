import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@assets/generated_images/Red_luxury_sports_car_hero_5badd28f.png';

interface Slide {
  id: number;
  image: string;
  eyebrow: string;
  model: string;
  year: string;
  price: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: heroImage,
    eyebrow: 'FIND YOUR DREAM CAR',
    model: 'LAMBORGHINI AVENTADOR',
    year: 'MODEL 2015',
    price: '$486,868',
  },
  {
    id: 2,
    image: heroImage,
    eyebrow: 'LUXURY REDEFINED',
    model: 'PORSCHE 911 CARRERA',
    year: 'MODEL 2024',
    price: '$125,000',
  },
  {
    id: 3,
    image: heroImage,
    eyebrow: 'PERFORMANCE UNLEASHED',
    model: 'FERRARI 488 GTB',
    year: 'MODEL 2023',
    price: '$330,000',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toast } = useToast();

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

  const handleOrderNow = () => {
    toast({
      title: "Order Inquiry",
      description: `Thank you for your interest in the ${slides[currentSlide].model}! Our sales team will contact you shortly.`,
    });
  };

  const handleTestDrive = () => {
    toast({
      title: "Test Drive Request",
      description: `Test drive scheduled for the ${slides[currentSlide].model}. We'll call you to confirm the time.`,
    });
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
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <p className="text-sm font-semibold tracking-widest mb-4 text-primary" data-testid={`text-eyebrow-${index}`}>
                  {slide.eyebrow}
                </p>
                <h2 className="text-5xl md:text-7xl font-heading font-extrabold tracking-wide mb-4" data-testid={`text-model-${index}`}>
                  {slide.model}
                </h2>
                <p className="text-lg mb-2" data-testid={`text-year-${index}`}>{slide.year}</p>
                <p className="text-3xl md:text-4xl font-bold mb-8 bg-primary inline-block px-4 py-2" data-testid={`text-price-${index}`}>
                  {slide.price}
                </p>
                <div className="flex gap-4">
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={handleOrderNow}
                    data-testid={`button-order-${index}`}
                  >
                    ORDER NOW
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20" 
                    onClick={handleTestDrive}
                    data-testid={`button-testdrive-${index}`}
                  >
                    TEST DRIVE
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
