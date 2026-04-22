import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'autopro-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-xs z-50 rounded-md border bg-card text-card-foreground shadow-lg"
      data-testid="banner-cookie"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <Cookie className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground flex-1 leading-snug">
            {t('cookies.text')}{' '}
            <a href="/privacy" className="text-primary hover:underline">
              {t('cookies.learnMore')}
            </a>
            .
          </p>
          <button
            onClick={() => decide('declined')}
            aria-label={t('cookies.dismiss')}
            className="text-muted-foreground hover-elevate rounded-md p-0.5 shrink-0"
            data-testid="button-cookie-close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => decide('declined')}
            data-testid="button-cookie-decline"
          >
            {t('cookies.decline')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => decide('accepted')}
            data-testid="button-cookie-accept"
          >
            {t('cookies.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
