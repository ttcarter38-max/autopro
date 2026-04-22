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
  Car,
  Caravan,
  Sailboat,
  Bike,
  Tractor,
  ArrowRight,
  Quote,
} from 'lucide-react';
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
  { value: '10K+', key: 'transactions' },
  { value: '50+', key: 'countries' },
  { value: '$250M+', key: 'volume' },
  { value: '99.8%', key: 'satisfaction' },
];

const STEPS_META = [
  { n: '01', key: 's1' },
  { n: '02', key: 's2' },
  { n: '03', key: 's3' },
];

const CATEGORIES = [
  { Icon: Car, key: 'car', slug: 'car' },
  { Icon: Caravan, key: 'rv', slug: 'rv' },
  { Icon: Sailboat, key: 'boat', slug: 'boat' },
  { Icon: Bike, key: 'bike', slug: 'bike' },
  { Icon: Tractor, key: 'tractor', slug: 'tractor' },
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
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS_META.map((s) => (
              <div key={s.key} className="text-center" data-testid={`stat-${s.key}`}>
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{t(`about.stats.${s.key}`)}</div>
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
              <Card key={b.key}>
                <CardContent className="p-6">
                  <b.Icon className="w-8 h-8 text-primary mb-3" />
                  <div className="font-heading font-semibold mb-1" data-testid={`badge-${b.key}`}>
                    {t(`about.story.badges.${b.key}Title`)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`about.story.badges.${b.key}Text`)}</p>
                </CardContent>
              </Card>
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
              <Card key={v.key} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <v.Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2" data-testid={`value-${v.key}`}>
                    {t(`about.values.${v.key}Title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t(`about.values.${v.key}Text`)}</p>
                </CardContent>
              </Card>
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
            <Card key={s.n}>
              <CardContent className="p-8">
                <div className="text-5xl font-heading font-bold text-primary/30 mb-4">{s.n}</div>
                <h3 className="font-heading font-semibold text-xl mb-3" data-testid={`step-${s.n}`}>
                  {t(`about.how.${s.key}Title`)}
                </h3>
                <p className="text-muted-foreground">{t(`about.how.${s.key}Text`)}</p>
              </CardContent>
            </Card>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(({ Icon, key, slug }) => (
              <Link key={slug} href={`/inventory?category=${slug}`}>
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Icon className="w-10 h-10 text-primary mb-3" />
                    <div className="font-heading font-semibold" data-testid={`about-cat-${slug}`}>
                      {t(`inventory.categories.${key}`)}
                    </div>
                  </CardContent>
                </Card>
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
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              data-testid="button-cta-contact"
            >
              <Link href="/contact">{t('about.cta.contact')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
