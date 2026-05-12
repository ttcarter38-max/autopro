import { Facebook, Twitter, Instagram, Youtube, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const { t } = useTranslation();

  // Test address — Empire State Building, multi-tenant office tower
  const officeLabel = '350 5th Ave, New York, NY 10118';
  const mapsEmbedSrc =
    'https://www.google.com/maps?q=Empire+State+Building,+350+5th+Ave,+New+York,+NY+10118&z=16&output=embed';
  const mapsLinkHref =
    'https://www.google.com/maps/place/Empire+State+Building/@40.7484405,-73.9856644,17z';

  return (
    <footer className="bg-black text-white">
      {/* Full-width map */}
      <div className="relative w-full h-[420px] sm:h-[460px] md:h-[520px]">
        <iframe
          src={mapsEmbedSrc}
          title="AutoPro headquarters location"
          className="absolute inset-0 w-full h-full border-0 grayscale-[15%] contrast-105"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          data-testid="iframe-map"
        />
        {/* Floating address card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-8 flex justify-center px-4">
          <a
            href={mapsLinkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-black/80 backdrop-blur-md border border-white/15 px-4 py-2.5 sm:px-5 sm:py-3 shadow-2xl hover-elevate"
            data-testid="link-address-pill"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30">
              <MapPin className="w-4 h-4 text-primary" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-white">{officeLabel}</span>
          </a>
        </div>
      </div>

      {/* Footer body */}
      <div className="pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
            <div>
              <h3 className="text-2xl font-heading font-bold tracking-[0.18em] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary/80" data-testid="text-footer-logo">
                AUTOPRO
              </h3>
              <p className="text-gray-400 mb-6 max-w-md" data-testid="text-footer-description">
                {t('footer.description')}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="hover:text-primary" data-testid="button-facebook">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary" data-testid="button-twitter">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary" data-testid="button-instagram">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary" data-testid="button-youtube">
                  <Youtube className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-heading font-bold mb-4" data-testid="text-footer-links">
                {t('footer.quickLinks')}
              </h4>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-6">
                <li><a href="/inventory" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-inventory">{t('footer.inventory')}</a></li>
                <li><a href="/escrow" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-escrow-footer">{t('footer.escrow')}</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-about-footer">{t('footer.about')}</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-contact-footer">{t('footer.contact')}</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-faq-footer">{t('footer.faq')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm" data-testid="text-copyright">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex gap-6 text-sm flex-wrap justify-center">
              <a href="/privacy" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-privacy">{t('footer.privacy')}</a>
              <a href="/terms" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-terms">{t('footer.terms')}</a>
              <a href="/refunds" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-refunds">{t('footer.refunds')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
