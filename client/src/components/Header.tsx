import { useState } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleNavClick = (section: string) => {
    toast({
      title: `${section}`,
      description: `Contact us at 1-800-CAR-DEAL for assistance.`,
    });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <h1 className="text-2xl font-heading font-bold tracking-wider cursor-pointer" data-testid="text-logo">
                AUTOPRO
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-home-menu">
                  HOME
                </span>
              </Link>
              <Link href="/inventory">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-vehicles-menu">
                  VEHICLES
                </span>
              </Link>
              <Link href="/escrow">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-escrow-menu">
                  ESCROW
                </span>
              </Link>
              <button 
                className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" 
                onClick={() => handleNavClick('Contact')}
                data-testid="button-contact-menu"
              >
                CONTACT
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="default" size="sm" asChild data-testid="button-search">
              <Link href="/inventory">Browse All</Link>
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="font-semibold" data-testid="text-phone">1-800-CAR-DEAL</span>
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <nav className="px-4 py-4 space-y-2">
            <Link href="/">
              <span 
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-home"
              >
                HOME
              </span>
            </Link>
            <Link href="/inventory">
              <span 
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-vehicles"
              >
                VEHICLES
              </span>
            </Link>
            <Link href="/escrow">
              <span 
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-escrow"
              >
                ESCROW
              </span>
            </Link>
            <button 
              className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
              onClick={() => handleNavClick('Contact')}
              data-testid="button-mobile-contact"
            >
              CONTACT
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
