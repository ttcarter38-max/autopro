import { useState } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubscribe = () => {
    if (!email) {
      toast({
        title: t('footer.emailRequired'),
        description: t('footer.emailRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t('footer.subscribed'),
      description: t('footer.subscribedDesc'),
    });
    setEmail('');
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-heading font-bold mb-4" data-testid="text-footer-logo">AUTOPRO</h3>
            <p className="text-gray-400 mb-6" data-testid="text-footer-description">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
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
            <h4 className="text-lg font-heading font-bold mb-4" data-testid="text-footer-links">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li><a href="/inventory" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-inventory">{t('footer.inventory')}</a></li>
              <li><a href="/escrow" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-escrow-footer">{t('footer.escrow')}</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-about-footer">{t('footer.about')}</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-contact-footer">{t('footer.contact')}</a></li>
              <li><a href="/faq" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-faq-footer">{t('footer.faq')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-heading font-bold mb-4" data-testid="text-footer-contact">{t('footer.contactInfo')}</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span data-testid="text-address">123 Auto Drive, Car City, CA 90210</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span data-testid="text-phone">1-800-CAR-DEAL</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span data-testid="text-email">info@autopro.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-heading font-bold mb-4" data-testid="text-footer-newsletter">{t('footer.newsletter')}</h4>
            <p className="text-gray-400 mb-4">
              {t('footer.newsletterText')}
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="bg-gray-900 border-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                data-testid="input-email"
              />
              <Button variant="default" onClick={handleSubscribe} data-testid="button-subscribe">{t('footer.subscribe')}</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm" data-testid="text-copyright">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6 text-sm">
            <a href="/privacy" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-privacy">{t('footer.privacy')}</a>
            <a href="/terms" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-terms">{t('footer.terms')}</a>
            <a href="/refunds" className="text-gray-400 hover:text-primary transition-colors" data-testid="link-refunds">{t('footer.refunds')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
