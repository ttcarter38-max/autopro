import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, ShieldCheck, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction } from '@shared/schema';

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  initiated: 'secondary',
  awaiting_admin_approval: 'secondary',
  awaiting_payment_confirmation: 'default',
  in_transit: 'default',
  inspection: 'default',
  approved: 'default',
  released: 'default',
  cancelled: 'destructive',
};

export default function MyTransactions() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data, isLoading, error } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ['/api/transactions'],
    enabled: isAuthenticated,
  });

  const transactions = data?.transactions ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-dashboard-title">{t('myTransactions.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {user ? t('myTransactions.welcome', { name: user.name }) : ''}
            </p>
          </div>
          <Button asChild data-testid="button-new-escrow">
            <Link href="/escrow">
              <Plus className="w-4 h-4 mr-2" />
              {t('myTransactions.newEscrow')}
            </Link>
          </Button>
        </div>

        {(authLoading || isLoading) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive font-medium" data-testid="text-error">{t('myTransactions.errorTitle')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('myTransactions.errorSub')}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <ShieldCheck className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">{t('myTransactions.emptyTitle')}</h3>
                <p className="text-muted-foreground mt-1">
                  {t('myTransactions.emptyDesc')}
                </p>
              </div>
              <Button asChild data-testid="button-start-first">
                <Link href="/escrow">{t('myTransactions.startFirst')}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const statusLabel = t(`myTransactions.status.${tx.status}`, { defaultValue: tx.status });
              const variant = statusVariants[tx.status] || 'secondary';
              return (
                <Card key={tx.id} data-testid={`card-transaction-${tx.id}`} className="hover-elevate">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-transaction-id-${tx.id}`}>
                        {t('myTransactions.transactionN', { id: tx.id })}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tx.customVehicleDescription
                          ? tx.customVehicleDescription.substring(0, 80) + (tx.customVehicleDescription.length > 80 ? '...' : '')
                          : t('myTransactions.vehicleN', { id: tx.vehicleId })}
                      </p>
                    </div>
                    <Badge variant={variant} data-testid={`badge-status-${tx.id}`}>{statusLabel}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span><span className="text-muted-foreground">{t('myTransactions.amount')}</span> <span className="font-semibold" data-testid={`text-amount-${tx.id}`}>${parseFloat(tx.amount).toLocaleString()}</span></span>
                      <span><span className="text-muted-foreground">{t('myTransactions.created')}</span> {new Date(tx.createdAt).toLocaleDateString()}</span>
                      {tx.sellerEmail && (
                        <span><span className="text-muted-foreground">{t('myTransactions.seller')}</span> {tx.sellerName || tx.sellerEmail}</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild data-testid={`button-view-${tx.id}`}>
                      <Link href={`/track/${tx.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('myTransactions.viewDetails')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
