import { HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useSeo } from '@/hooks/useSeo';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

interface FAQGroup {
  title: string;
  items: { q: string; a: string }[];
}

const FAQS: FAQGroup[] = [
  {
    title: 'About AutoPro',
    items: [
      {
        q: 'What is AutoPro?',
        a: 'AutoPro is a curated, invitation-only marketplace for cars, RVs, boats, motorcycles, and tractors. We list a maximum of 10 vehicles per category at any time so every listing receives proper attention. Every transaction is protected by our built-in escrow service.',
      },
      {
        q: 'Why “invitation-only”?',
        a: 'We hand-pick sellers and verify each vehicle so the listings you see are real, accurately described, and ready to ship. This keeps the inventory small, but the quality consistently high.',
      },
      {
        q: 'Where are you located?',
        a: 'AutoPro operates online and serves buyers and sellers across the United States. Our company is headquartered in California and our agreements are governed by California law.',
      },
    ],
  },
  {
    title: 'Buying a Vehicle',
    items: [
      {
        q: 'Is my money safe?',
        a: 'Yes. When you start a purchase, your funds are held in escrow and never released to the seller until you have inspected the vehicle and approved the release. If the deal does not go through, your funds are returned in full according to our refund policy.',
      },
      {
        q: 'How does the inspection period work?',
        a: 'After the vehicle is delivered to you, you choose an inspection window of 1 to 5 days (3 days is the default). During that time you can verify the vehicle matches its listing. If it does, you approve the release; if not, you can open a dispute.',
      },
      {
        q: 'What payment methods can I use?',
        a: 'We accept bank transfer and supported cryptocurrencies (BTC, ETH, USDT, BNB, SOL). You select your preferred method during checkout and our team will reply with secure payment instructions.',
      },
      {
        q: 'Are listed prices negotiable?',
        a: 'Some are. If you would like to make an offer, contact us through the vehicle page or the Contact form and we will relay it to the seller.',
      },
      {
        q: 'Can I see the vehicle before buying?',
        a: 'In many cases yes. We can arrange in-person viewings or third-party pre-purchase inspections at the vehicle’s current location. Get in touch and we will coordinate.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        q: 'How is the vehicle delivered?',
        a: 'We arrange door-to-door insured transport. You will receive a tracking link as soon as the carrier has picked the vehicle up.',
      },
      {
        q: 'Who pays for shipping?',
        a: 'Unless otherwise stated on the listing, shipping is paid by the buyer and quoted up front. The cost depends on the route and vehicle type.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Most U.S. routes take 5 to 10 business days from the moment the vehicle is picked up. Long-distance and oversize loads (RVs, boats, tractors) may take longer.',
      },
    ],
  },
  {
    title: 'Selling a Vehicle',
    items: [
      {
        q: 'Can I list my vehicle on AutoPro?',
        a: 'Listings are by invitation. If you have a vehicle that fits one of our categories and the curated standard, contact us with the details and photos and we will respond.',
      },
      {
        q: 'How are sellers paid?',
        a: 'Once the buyer approves release after the inspection period, we transfer the funds to the seller via bank transfer or the agreed crypto wallet, typically within one business day.',
      },
    ],
  },
  {
    title: 'Disputes & Refunds',
    items: [
      {
        q: 'What if the vehicle isn’t as described?',
        a: 'Open a dispute within your inspection window. Funds remain in escrow while we mediate between you and the seller. Outcomes can include a partial refund, return of the vehicle for a full refund, or release of funds, depending on the facts.',
      },
      {
        q: 'How do I get a refund?',
        a: 'Read the full Refund & Cancellation Policy for details. In short: if you cancel before funds are released or open a valid dispute, your money is returned to your original payment method.',
      },
    ],
  },
];

export default function FAQ() {
  useSeo({
    title: 'Frequently Asked Questions',
    description:
      'Answers about how AutoPro works: escrow protection, inspection windows, shipping, payment methods, refunds, and selling on our invitation-only marketplace.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 mb-5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold tracking-widest uppercase">
              Help Center
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3" data-testid="text-faq-title">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Everything you need to know about buying, selling, and using escrow on AutoPro.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {FAQS.map((group) => (
          <section key={group.title} data-testid={`faq-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <h2 className="text-2xl font-heading font-bold mb-4">{group.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {group.items.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`${group.title}-${idx}`}
                  data-testid={`faq-item-${group.title.toLowerCase().replace(/\s+/g, '-')}-${idx}`}
                >
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        <section className="rounded-md border border-border bg-card p-6 text-center">
          <h3 className="text-xl font-heading font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our team responds within one business day.
          </p>
          <Button asChild size="lg">
            <Link href="/contact" data-testid="link-faq-contact">Contact Us</Link>
          </Button>
        </section>
      </div>

      <Footer />
    </div>
  );
}
