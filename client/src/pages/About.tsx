import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Lock,
  Globe,
  HeartHandshake,
  CheckCircle2,
  Award,
  Truck,
  Users,
  ArrowRight,
  Quote,
  MessageCircle,
  TrendingUp,
  MapPin,
  Banknote,
  Smile,
} from 'lucide-react';
import iconCar from '@assets/generated_images/cat_car.png';
import iconRv from '@assets/generated_images/cat_rv.png';
import iconBoat from '@assets/generated_images/cat_boat.png';
import iconBike from '@assets/generated_images/cat_bike.png';
import iconTractor from '@assets/generated_images/cat_tractor.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSeo } from '@/hooks/useSeo';

interface Testimonial {
  id: number;
  customerName: string;
  vehicle: string | null;
  location: string | null;
  quote: string;
  photoUrl: string;
}

const VALUES_META = [
  { Icon: Shield, key: 'trust' },
  { Icon: HeartHandshake, key: 'fair' },
  { Icon: Lock, key: 'secure' },
  { Icon: Globe, key: 'global' },
];

const STATS_META = [
  { Icon: TrendingUp, value: '10K+', key: 'transactions' },
  { Icon: MapPin, value: '50+', key: 'countries' },
  { Icon: Banknote, value: '$250M+', key: 'volume' },
  { Icon: Smile, value: '99.8%', key: 'satisfaction' },
];

const STEPS_META = [
  { n: '01', key: 's1' },
  { n: '02', key: 's2' },
  { n: '03', key: 's3' },
];

const CATEGORIES = [
  { img: iconCar, key: 'car', slug: 'car' },
  { img: iconRv, key: 'rv', slug: 'rv' },
  { img: iconBoat, key: 'boat', slug: 'boat' },
  { img: iconBike, key: 'bike', slug: 'bike' },
  { img: iconTractor, key: 'tractor', slug: 'tractor' },
];

const STORY_BADGES = [
  { Icon: Award, key: 'licensed' },
  { Icon: Users, key: 'team' },
  { Icon: Truck, key: 'logistics' },
  { Icon: CheckCircle2, key: 'verified' },
];

export default function About() {
  const { t } = useTranslation();
  useSeo({
    title: 'About AutoPro — Why We Built a Curated Marketplace',
    description:
      'Why AutoPro exists: a small, curated, invitation-only marketplace for cars, RVs, boats, motorcycles, and tractors — with escrow protection on every deal.',
  });
  const { data: tData } = useQuery<{ testimonials: Testimonial[] }>({
    queryKey: ['/api/testimonials'],
  });
  const testimonials = tData?.testimonials || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-primary/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4" data-testid="text-about-eyebrow">
              {t('about.eyebrow')}
            </p>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight" data-testid="text-about-title">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8" data-testid="text-about-subtitle">
              {t('about.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" data-testid="button-about-browse">
                <Link href="/inventory">{t('about.browseInventory')}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                data-testid="button-about-escrow"
              >
                <Link href="/escrow">{t('about.howEscrowWorks')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-b bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 premium-halo opacity-30" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {STATS_META.map(({ Icon, value, key }) => (
              <div
                key={key}
                className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 sm:p-7 shadow-[0_20px_50px_-22px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1.5 overflow-hidden text-center sm:text-left"
                data-testid={`stat-${key}`}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
                <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_30px_-12px_hsl(var(--primary)/0.5)] mb-4 mx-auto sm:mx-0">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.6} />
                </div>
                <div
                  className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold tracking-display mb-1 bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary to-primary/60"
                  data-testid={`stat-value-${key}`}
                >
                  {value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-[0.14em] uppercase">
                  {t(`about.stats.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">{t('about.story.eyebrow')}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6" data-testid="text-story-title">
              {t('about.story.title')}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>{t('about.story.p1')}</p>
              <p>{t('about.story.p2')}</p>
              <p>{t('about.story.p3')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STORY_BADGES.map((b) => (
              <div
                key={b.key}
                className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-500 group-hover:scale-105">
                    <b.Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                  </div>
                </div>
                <div className="font-heading font-semibold mb-1 tracking-display" data-testid={`badge-${b.key}`}>
                  {t(`about.story.badges.${b.key}Title`)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`about.story.badges.${b.key}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Carousel */}
      {testimonials.length > 0 && (
        <section className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
                {t('about.testimonials.eyebrow')}
              </p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-testimonials-title">
                {t('about.testimonials.title')}
              </h2>
              <p className="text-gray-400 mt-3">
                {t('about.testimonials.sub')}
              </p>
            </div>

            <Carousel
              opts={{ align: 'start', loop: testimonials.length > 1 }}
              className="w-full"
              data-testid="carousel-testimonials"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((tItem) => (
                  <CarouselItem
                    key={tItem.id}
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                    data-testid={`testimonial-item-${tItem.id}`}
                  >
                    <Card className="overflow-hidden h-full bg-zinc-900 border-zinc-800 text-white">
                      <div className="aspect-[4/3] overflow-hidden bg-zinc-800">
                        <img
                          src={tItem.photoUrl}
                          alt={`${tItem.customerName} with their ${tItem.vehicle || ''}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <Quote className="w-6 h-6 text-primary" />
                        <p className="text-sm leading-relaxed text-gray-200 italic">
                          "{tItem.quote}"
                        </p>
                        <div className="pt-3 border-t border-zinc-800">
                          <div className="font-heading font-semibold" data-testid={`testimonial-name-${tItem.id}`}>
                            {tItem.customerName}
                          </div>
                          {(tItem.vehicle || tItem.location) && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {[tItem.vehicle, tItem.location].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {testimonials.length > 1 && (
                <>
                  <CarouselPrevious className="hidden sm:flex -left-4 bg-white text-black border-0 hover:bg-white/90" data-testid="button-carousel-prev" />
                  <CarouselNext className="hidden sm:flex -right-4 bg-white text-black border-0 hover:bg-white/90" data-testid="button-carousel-next" />
                </>
              )}
            </Carousel>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">{t('about.values.eyebrow')}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-values-title">
              {t('about.values.title')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES_META.map((v) => (
              <div
                key={v.key}
                className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-7 shadow-[0_20px_50px_-22px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-1.5 overflow-hidden"
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-500 group-hover:scale-105">
                    <v.Icon className="w-7 h-7 text-primary" strokeWidth={1.6} />
                  </div>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 tracking-display" data-testid={`value-${v.key}`}>
                  {t(`about.values.${v.key}Title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`about.values.${v.key}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">{t('about.how.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-how-title">
            {t('about.how.title')}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS_META.map((s) => (
            <div
              key={s.n}
              className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-8 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-2 overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/25 shadow-[0_20px_40px_-12px_hsl(var(--primary)/0.55)] transition-transform duration-500 group-hover:scale-105">
                  <span className="text-2xl font-heading font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{s.n}</span>
                </div>
              </div>
              <h3 className="font-heading font-semibold text-xl mb-3 tracking-display" data-testid={`step-${s.n}`}>
                {t(`about.how.${s.key}Title`)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t(`about.how.${s.key}Text`)}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" data-testid="button-learn-escrow">
            <Link href="/escrow">
              {t('about.how.learnMore')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">{t('about.categories.eyebrow')}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-categories-title">
              {t('about.categories.title')}
            </h2>
            <p className="text-muted-foreground mt-3">
              {t('about.categories.sub')}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {CATEGORIES.map(({ img, key, slug }) => (
              <Link key={slug} href={`/inventory?category=${slug}`}>
                <div
                  className="group relative h-full rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 shadow-[0_20px_50px_-22px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-1.5 overflow-hidden cursor-pointer flex flex-col items-center text-center"
                  data-testid={`about-cat-${slug}`}
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                    <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-card via-card to-background border border-card-border shadow-[0_15px_40px_-12px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:-translate-y-1 overflow-hidden">
                      <img
                        src={img}
                        alt={key}
                        className="w-[78%] h-[78%] object-contain drop-shadow-md transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="font-heading font-semibold text-sm tracking-[0.18em] uppercase">
                    {t(`inventory.categories.${key}`)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" data-testid="text-cta-title">
            {t('about.cta.title')}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            {t('about.cta.sub')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" data-testid="button-cta-browse">
              <Link href="/inventory">{t('about.cta.browse')}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={() => window.dispatchEvent(new CustomEvent('autopro:open-chat'))}
              data-testid="button-cta-contact"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t('about.cta.contact')}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
