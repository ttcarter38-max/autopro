import { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Car, Caravan, Sailboat, Bike, Tractor, ChevronDown, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
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
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const VEHICLE_CATEGORIES = [
    { slug: 'car', label: t('nav.cars'), icon: Car },
    { slug: 'rv', label: t('nav.rvs'), icon: Caravan },
    { slug: 'boat', label: t('nav.boats'), icon: Sailboat },
    { slug: 'bike', label: t('nav.motorcycles'), icon: Bike },
    { slug: 'tractor', label: t('nav.tractors'), icon: Tractor },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Logout failed');
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.removeQueries({ queryKey: ['/api/transactions'] });
      toast({ title: t('common.signedOut') });
      setLocation('/');
    } catch {
      toast({ title: t('common.logoutFailed'), description: t('common.tryAgain'), variant: 'destructive' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Link href="/">
                <h1 className="text-2xl font-heading font-bold tracking-wider cursor-pointer" data-testid="text-logo">
                  AUTOPRO
                </h1>
              </Link>
              <Link href="/escrow">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium p-1 md:px-2 md:py-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover-elevate cursor-pointer"
                  data-testid="badge-escrow-protected"
                  title={t('trust.escrowBadge')}
                  aria-label={t('trust.escrowBadge')}
                >
                  <ShieldCheck className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  <span className="hidden md:inline">{t('trust.escrowBadge')}</span>
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-home-menu">
                  {t('nav.home')}
                </span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer flex items-center gap-1" data-testid="button-vehicles-menu">
                    {t('nav.vehicles')}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem asChild data-testid="link-category-all">
                    <Link href="/inventory">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t('nav.allVehicles')}
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
                  {t('nav.escrow')}
                </span>
              </Link>
              <Link href="/about">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-about-menu">
                  {t('nav.about')}
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-sm font-medium hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="button-contact-menu">
                  {t('nav.contact')}
                </span>
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant="header" />
            <ThemeToggle />
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
                        {t('nav.adminDashboard')}
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild data-testid="link-my-transactions">
                      <Link href="/my-transactions">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        {t('nav.myTransactions')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10" data-testid="button-signin">
                  <Link href="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button variant="default" size="sm" asChild data-testid="button-register">
                  <Link href="/register">{t('nav.register')}</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher variant="header" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
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
                {t('nav.home')}
              </span>
            </Link>
            <div className="text-xs font-semibold text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wider">{t('nav.vehicles')}</div>
            <Link href="/inventory">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-vehicles"
              >
                {t('nav.allVehicles')}
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
                {t('nav.escrow')}
              </span>
            </Link>
            <Link href="/about">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-about"
              >
                {t('nav.about')}
              </span>
            </Link>
            <Link href="/contact">
              <span
                className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="button-mobile-contact"
              >
                {t('nav.contact')}
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
                      {user.role === 'admin' ? t('nav.adminDashboard') : t('nav.myTransactions')}
                    </span>
                  </Link>
                  <button
                    className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md"
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    data-testid="button-mobile-logout"
                  >
                    {t('nav.signOut')}
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
                      {t('nav.signIn')}
                    </span>
                  </Link>
                  <Link href="/register">
                    <span
                      className="block w-full text-left py-2 text-sm font-medium hover-elevate px-3 rounded-md cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="button-mobile-register"
                    >
                      {t('nav.register')}
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
