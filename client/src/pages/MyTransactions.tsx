import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, ShieldCheck, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction } from '@shared/schema';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  initiated: { label: 'Initiated', variant: 'secondary' },
  awaiting_admin_approval: { label: 'Pending Review', variant: 'secondary' },
  awaiting_payment_confirmation: { label: 'Awaiting Payment', variant: 'default' },
  in_transit: { label: 'In Transit', variant: 'default' },
  inspection: { label: 'Inspection', variant: 'default' },
  approved: { label: 'Approved', variant: 'default' },
  released: { label: 'Released', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function MyTransactions() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

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
            <h1 className="text-3xl font-heading font-bold" data-testid="text-dashboard-title">My Transactions</h1>
            <p className="text-muted-foreground mt-1">
              {user ? `Welcome back, ${user.name}` : ''}
            </p>
          </div>
          <Button asChild data-testid="button-new-escrow">
            <Link href="/escrow">
              <Plus className="w-4 h-4 mr-2" />
              Start New Escrow
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
              <p className="text-destructive font-medium" data-testid="text-error">Failed to load your transactions.</p>
              <p className="text-sm text-muted-foreground mt-1">Please refresh the page or try again later.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <ShieldCheck className="w-12 h-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No transactions yet</h3>
                <p className="text-muted-foreground mt-1">
                  When you start an escrow transaction, it'll show up here.
                </p>
              </div>
              <Button asChild data-testid="button-start-first">
                <Link href="/escrow">Start Your First Escrow</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <div className="space-y-4">
            {transactions.map((tx) => {
              const status = statusLabels[tx.status] || { label: tx.status, variant: 'secondary' as const };
              return (
                <Card key={tx.id} data-testid={`card-transaction-${tx.id}`} className="hover-elevate">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-transaction-id-${tx.id}`}>
                        Transaction #{tx.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tx.customVehicleDescription
                          ? tx.customVehicleDescription.substring(0, 80) + (tx.customVehicleDescription.length > 80 ? '...' : '')
                          : `Vehicle #${tx.vehicleId}`}
                      </p>
                    </div>
                    <Badge variant={status.variant} data-testid={`badge-status-${tx.id}`}>{status.label}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span><span className="text-muted-foreground">Amount:</span> <span className="font-semibold" data-testid={`text-amount-${tx.id}`}>${parseFloat(tx.amount).toLocaleString()}</span></span>
                      <span><span className="text-muted-foreground">Created:</span> {new Date(tx.createdAt).toLocaleDateString()}</span>
                      {tx.sellerEmail && (
                        <span><span className="text-muted-foreground">Seller:</span> {tx.sellerName || tx.sellerEmail}</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild data-testid={`button-view-${tx.id}`}>
                      <Link href={`/track/${tx.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
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
