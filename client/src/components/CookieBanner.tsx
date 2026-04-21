import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'autopro-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 rounded-md border bg-card text-card-foreground shadow-lg"
      data-testid="banner-cookie"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold mb-1">We use cookies</p>
            <p className="text-sm text-muted-foreground">
              We use essential cookies to keep you signed in and a few analytics cookies to improve
              the site. See our{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
          <button
            onClick={() => decide('declined')}
            aria-label="Dismiss"
            className="text-muted-foreground hover-elevate rounded-md p-1"
            data-testid="button-cookie-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => decide('declined')}
            data-testid="button-cookie-decline"
          >
            Decline
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => decide('accepted')}
            data-testid="button-cookie-accept"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
