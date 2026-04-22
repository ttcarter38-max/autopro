import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

const GROUP_KEYS = ['about', 'buying', 'shipping', 'selling', 'disputes'] as const;

export default function FAQ() {
  const { t } = useTranslation();
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
              {t('faq.badge')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3" data-testid="text-faq-title">
            {t('faq.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl">
            {t('faq.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {GROUP_KEYS.map((groupKey) => {
          const items = t(`faq.groups.${groupKey}.items`, { returnObjects: true }) as { q: string; a: string }[];
          const groupTitle = t(`faq.groups.${groupKey}.title`);
          return (
            <section key={groupKey} data-testid={`faq-group-${groupKey}`}>
              <h2 className="text-2xl font-heading font-bold mb-4">{groupTitle}</h2>
              <Accordion type="single" collapsible className="w-full">
                {items.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`${groupKey}-${idx}`}
                    data-testid={`faq-item-${groupKey}-${idx}`}
                  >
                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          );
        })}

        <section className="rounded-md border border-border bg-card p-6 text-center">
          <h3 className="text-xl font-heading font-bold mb-2">{t('faq.stillHave')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('faq.stillHaveDesc')}
          </p>
          <Button asChild size="lg">
            <Link href="/contact" data-testid="link-faq-contact">{t('faq.contactUs')}</Link>
          </Button>
        </section>
      </div>

      <Footer />
    </div>
  );
}
