import { useState } from 'react';
import { Phone, Search, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Search",
      description: "Search functionality coming soon! Use the vehicle search bar below to find your dream car.",
    });
  };

  const handleNavClick = (section: string) => {
    toast({
      title: `Navigate to ${section}`,
      description: `The ${section} page is under construction. Please contact us at 1-800-CAR-DEAL for assistance.`,
    });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-heading font-bold tracking-wider" data-testid="text-logo">
              AUTOPRO
            </h1>

            <nav className="hidden md:flex items-center gap-6">
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 text-sm font-medium hover-elevate px-3 py-2 rounded-md" 
                  onClick={() => handleNavClick('Home')}
                  data-testid="button-home-menu"
                >
                  HOME <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 text-sm font-medium hover-elevate px-3 py-2 rounded-md" 
                  onClick={() => handleNavClick('Vehicles')}
                  data-testid="button-vehicles-menu"
                >
                  VEHICLES <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 text-sm font-medium hover-elevate px-3 py-2 rounded-md" 
                  onClick={() => handleNavClick('Blogs')}
                  data-testid="button-blogs-menu"
                >
                  BLOGS <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 text-sm font-medium hover-elevate px-3 py-2 rounded-md" 
                  onClick={() => handleNavClick('Pages')}
                  data-testid="button-pages-menu"
                >
                  PAGES <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSearch}
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
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
            <button 
              className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
              onClick={() => handleNavClick('Home')}
              data-testid="button-mobile-home"
            >
              HOME
            </button>
            <button 
              className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
              onClick={() => handleNavClick('Vehicles')}
              data-testid="button-mobile-vehicles"
            >
              VEHICLES
            </button>
            <button 
              className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
              onClick={() => handleNavClick('Blogs')}
              data-testid="button-mobile-blogs"
            >
              BLOGS
            </button>
            <button 
              className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md" 
              onClick={() => handleNavClick('Pages')}
              data-testid="button-mobile-pages"
            >
              PAGES
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
