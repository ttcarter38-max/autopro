import { Link } from 'wouter';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const VALUES = [
  {
    Icon: Shield,
    title: 'Trust First',
    text: 'Every transaction is protected end-to-end by our escrow service. Funds never move until both buyer and seller are satisfied.',
  },
  {
    Icon: HeartHandshake,
    title: 'Buyer & Seller Equal',
    text: 'We work for both sides. Clear communication, fair process, and full transparency from listing to delivery.',
  },
  {
    Icon: Lock,
    title: 'Secure by Design',
    text: 'Bank transfers and crypto options, encrypted communications, identity verification, and a full audit trail on every deal.',
  },
  {
    Icon: Globe,
    title: 'Worldwide Reach',
    text: 'We ship across borders and handle the paperwork, customs, and logistics so your purchase arrives smoothly.',
  },
];

const STATS = [
  { value: '10K+', label: 'Successful Transactions' },
  { value: '50+', label: 'Countries Served' },
  { value: '$250M+', label: 'In Escrow Volume' },
  { value: '99.8%', label: 'Customer Satisfaction' },
];

const STEPS = [
  {
    n: '01',
    title: 'Browse & Select',
    text: 'Pick from our verified inventory of cars, RVs, boats, motorcycles, and tractors — or send us a custom request.',
  },
  {
    n: '02',
    title: 'Open Escrow',
    text: 'Funds are placed in our protected escrow account. The seller is notified and prepares the vehicle for shipment.',
  },
  {
    n: '03',
    title: 'Inspect & Receive',
    text: 'You inspect on arrival. Only when you confirm everything is as agreed, we release payment to the seller.',
  },
];

const CATEGORIES = [
  { Icon: Car, label: 'Cars', slug: 'car' },
  { Icon: Caravan, label: 'RVs', slug: 'rv' },
  { Icon: Sailboat, label: 'Boats', slug: 'boat' },
  { Icon: Bike, label: 'Motorcycles', slug: 'bike' },
  { Icon: Tractor, label: 'Tractors', slug: 'tractor' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-primary/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4" data-testid="text-about-eyebrow">
              About AutoPro
            </p>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight" data-testid="text-about-title">
              Buying vehicles across borders shouldn't be scary.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8" data-testid="text-about-subtitle">
              AutoPro is a global marketplace and escrow service for cars, RVs, boats, motorcycles, and
              tractors. We hold the funds, verify the deal, and only release payment when you're satisfied —
              so you can buy with confidence from anywhere in the world.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" data-testid="button-about-browse">
                <Link href="/inventory">Browse Inventory</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                data-testid="button-about-escrow"
              >
                <Link href="/escrow">How Escrow Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center" data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">Our Story</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6" data-testid="text-story-title">
              Built by people who got burned buying online.
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                AutoPro started after our founders watched too many friends lose deposits on vehicles they
                never received. The pattern was always the same — wire the money, then silence.
              </p>
              <p>
                We built AutoPro to fix that. Every deal on our platform runs through a regulated escrow
                process. The seller can't disappear with your money, and you can't reject a vehicle without
                cause. Both sides are protected.
              </p>
              <p>
                Today we're trusted by thousands of buyers and sellers across more than fifty countries to
                handle everything from a daily-driver sedan to a 60-foot yacht.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { Icon: Award, title: 'Licensed Dealer', text: 'Fully licensed and insured.' },
              { Icon: Users, title: 'Dedicated Team', text: 'Concierge support on every deal.' },
              { Icon: Truck, title: 'Global Logistics', text: 'Door-to-door, anywhere.' },
              { Icon: CheckCircle2, title: 'Verified Listings', text: 'Every vehicle checked.' },
            ].map((b) => (
              <Card key={b.title}>
                <CardContent className="p-6">
                  <b.Icon className="w-8 h-8 text-primary mb-3" />
                  <div className="font-heading font-semibold mb-1" data-testid={`badge-${b.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {b.title}
                  </div>
                  <p className="text-sm text-muted-foreground">{b.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-values-title">
              Four principles guide every transaction.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <Card key={v.title} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <v.Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2" data-testid={`value-${v.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {v.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{v.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-how-title">
            Three simple steps. Zero guesswork.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <CardContent className="p-8">
                <div className="text-5xl font-heading font-bold text-primary/30 mb-4">{s.n}</div>
                <h3 className="font-heading font-semibold text-xl mb-3" data-testid={`step-${s.n}`}>
                  {s.title}
                </h3>
                <p className="text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" data-testid="button-learn-escrow">
            <Link href="/escrow">
              Learn more about our escrow service
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">What We Sell</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold" data-testid="text-categories-title">
              From daily drivers to weekend toys.
            </h2>
            <p className="text-muted-foreground mt-3">
              Same secure process across every category we offer.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(({ Icon, label, slug }) => (
              <Link key={slug} href={`/inventory?category=${slug}`}>
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Icon className="w-10 h-10 text-primary mb-3" />
                    <div className="font-heading font-semibold" data-testid={`about-cat-${slug}`}>
                      {label}
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
            Ready to buy with confidence?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Browse our inventory or talk to our team about a custom search. We're here to make your next
            purchase the easiest one yet.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" data-testid="button-cta-browse">
              <Link href="/inventory">View Inventory</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              data-testid="button-cta-contact"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
