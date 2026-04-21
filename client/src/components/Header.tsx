import { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Car, Caravan, Sailboat, Bike, Tractor, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const VEHICLE_CATEGORIES = [
  { slug: 'car', label: 'Cars', icon: Car },
  { slug: 'rv', label: 'RVs', icon: Caravan },
  { slug: 'boat', label: 'Boats', icon: Sailboat },
  { slug: 'bike', label: 'Motorcycles', icon: Bike },
  { slug: 'tractor', label: 'Tractors', icon: Tractor },
] as const;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Logout failed');
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.removeQueries({ queryKey: ['/api/transactions'] });
      toast({ title: 'Signed out' });
      setLocation('/');
    } catch {
      toast({ title: 'Logout failed', description: 'Please try again', variant: 'destructive' });
    }
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer flex items-center gap-1" data-testid="button-vehicles-menu">
                    VEHICLES
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem asChild data-testid="link-category-all">
                    <Link href="/inventory">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      All Vehicles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {VEHICLE_CATEGORIES.map(({ slug, label, icon: Icon }) => (
                    <DropdownMenuItem key={slug} asChild data-testid={`link-category-${slug}`}>
                      <Link href={`/inventory?category=${slug}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/escrow">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-escrow-menu">
                  ESCROW
                </span>
              </Link>
              <Link href="/about">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-about-menu">
                  ABOUT
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-contact-menu">
                  CONTACT
                </span>
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent border-white/30 text-white hover:bg-white/10" data-testid="button-account-menu">
                    <User className="w-4 h-4" />
                    {user.name.split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' ? (
                    <DropdownMenuItem asChild data-testid="link-admin-dashboard">
                      <Link href="/admin/dashboard">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild data-testid="link-my-transactions">
                      <Link href="/my-transactions">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Transactions
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10" data-testid="button-signin">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="default" size="sm" asChild data-testid="button-register">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
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
            <div className="text-xs font-semibold text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wider">Vehicles</div>
            <Link href="/inventory">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-vehicles"
              >
                All Vehicles
              </span>
            </Link>
            {VEHICLE_CATEGORIES.map(({ slug, label, icon: Icon }) => (
              <Link key={slug} href={`/inventory?category=${slug}`}>
                <span
                  className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`button-mobile-category-${slug}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
              </Link>
            ))}
            <Link href="/escrow">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-escrow"
              >
                ESCROW
              </span>
            </Link>
            <Link href="/about">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-about"
              >
                ABOUT
              </span>
            </Link>
            <Link href="/contact">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-contact"
              >
                CONTACT
              </span>
            </Link>

            <div className="border-t border-gray-800 pt-2 mt-2 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <Link href={user.role === 'admin' ? '/admin/dashboard' : '/my-transactions'}>
                    <span
                      className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-mobile-dashboard"
                    >
                      {user.role === 'admin' ? 'ADMIN DASHBOARD' : 'MY TRANSACTIONS'}
                    </span>
                  </Link>
                  <button
                    className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md"
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    data-testid="button-mobile-logout"
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span
                      className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-mobile-signin"
                    >
                      SIGN IN
                    </span>
                  </Link>
                  <Link href="/register">
                    <span
                      className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-mobile-register"
                    >
                      REGISTER
                    </span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
