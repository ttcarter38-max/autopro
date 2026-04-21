import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Car,
  Caravan,
  Sailboat,
  Bike,
  Tractor,
  ShieldCheck,
  Wallet,
  Inbox,
  Sparkles,
  Plus,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const STATUS_LABELS: Record<string, string> = {
  initiated: 'Initiated',
  awaiting_admin_approval: 'Awaiting Admin Approval',
  awaiting_payment_confirmation: 'Awaiting Payment',
  in_transit: 'In Transit',
  inspection: 'In Inspection',
  approved: 'Approved',
  released: 'Released',
  cancelled: 'Cancelled',
};

const ACTIVE_STATUSES = new Set([
  'initiated',
  'awaiting_admin_approval',
  'awaiting_payment_confirmation',
  'in_transit',
  'inspection',
  'approved',
]);

const ESCROW_STATUSES = new Set([
  'awaiting_payment_confirmation',
  'in_transit',
  'inspection',
  'approved',
]);

const ACTION_NEEDED_STATUSES = new Set([
  'initiated',
  'awaiting_admin_approval',
  'awaiting_payment_confirmation',
]);

const CATEGORY_META: Record<string, { label: string; Icon: any }> = {
  car: { label: 'Cars', Icon: Car },
  rv: { label: 'RVs', Icon: Caravan },
  boat: { label: 'Boats', Icon: Sailboat },
  bike: { label: 'Motorcycles', Icon: Bike },
  tractor: { label: 'Tractors', Icon: Tractor },
};

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function timeAgo(date: string | Date): string {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function AdminDashboard() {
  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery<any>({
    queryKey: ['/api/admin/vehicles'],
  });
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<any>({
    queryKey: ['/api/admin/transactions'],
  });
  const isLoading = vehiclesLoading || transactionsLoading;

  const vehicles: any[] = vehiclesData?.vehicles || [];
  const transactions: any[] = transactionsData?.transactions || [];

  const totalListings = vehicles.length;
  const activeListings = vehicles.filter((v) => v.available).length;

  const fundsInEscrow = transactions
    .filter((t) => ESCROW_STATUSES.has(t.status))
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

  const actionNeeded = transactions.filter((t) =>
    ACTION_NEEDED_STATUSES.has(t.status)
  ).length;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newLeads = transactions.filter(
    (t) => new Date(t.createdAt).getTime() >= sevenDaysAgo
  ).length;

  const activeTotal = transactions.filter((t) => ACTIVE_STATUSES.has(t.status)).length;
  const releasedTotal = transactions.filter((t) => t.status === 'released').length;

  // Category breakdown
  const byCategory: Record<string, { total: number; available: number }> = {};
  for (const slug of Object.keys(CATEGORY_META)) {
    byCategory[slug] = { total: 0, available: 0 };
  }
  for (const v of vehicles) {
    const slug = (v.category || 'car') as string;
    if (!byCategory[slug]) byCategory[slug] = { total: 0, available: 0 };
    byCategory[slug].total += 1;
    if (v.available) byCategory[slug].available += 1;
  }

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const t of transactions) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  }

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Dashboard</h2>
          <p className="text-muted-foreground">At-a-glance overview of AutoPro operations</p>
        </div>

        {/* Headline KPIs */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-skeleton">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-active-listings">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Listings
              </CardTitle>
              <ListChecks className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeListings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalListings} total · max 50 (10 / category)
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-funds-in-escrow">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Funds in Escrow
              </CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatMoney(fundsInEscrow)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTotal} active · {releasedTotal} released
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-action-needed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Awaiting Action
              </CardTitle>
              <Inbox className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{actionNeeded}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Transactions waiting on you
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-new-leads">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Leads (7d)
              </CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{newLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">Transactions started this week</p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Inventory by category */}
        <Card data-testid="card-inventory-breakdown">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Inventory by Category</CardTitle>
              <Link
                href="/admin/vehicles"
                className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
                data-testid="link-manage-inventory"
              >
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(CATEGORY_META).map(([slug, { label, Icon }]) => {
                const c = byCategory[slug] || { total: 0, available: 0 };
                const remaining = Math.max(0, 10 - c.total);
                return (
                  <div
                    key={slug}
                    className="rounded-md border border-border bg-card p-4"
                    data-testid={`category-tile-${slug}`}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{c.total}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {c.available} available · {remaining} slot{remaining === 1 ? '' : 's'} left
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <Card className="lg:col-span-2" data-testid="card-recent-transactions">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Recent Transactions</CardTitle>
                <Link
                  href="/admin/transactions"
                  className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
                  data-testid="link-view-all-transactions"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No transactions yet</p>
              ) : (
                <ul className="divide-y divide-border" data-testid="list-recent-transactions">
                  {recentTransactions.map((t: any) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 py-3"
                      data-testid={`row-transaction-${t.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.buyerName}</p>
                        <p className="text-xs text-muted-foreground">
                          #{t.id} · {timeAgo(t.createdAt)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {STATUS_LABELS[t.status] || t.status}
                      </Badge>
                      <p className="text-sm font-semibold shrink-0 w-24 text-right">
                        ${parseFloat(t.amount || '0').toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Quick actions + status snapshot */}
          <div className="space-y-6">
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/admin/vehicles/new"
                  className="block p-3 rounded-md border border-border hover-elevate"
                  data-testid="link-add-vehicle"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    <p className="font-medium text-sm">Add New Vehicle</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    List a new vehicle for sale
                  </p>
                </Link>
                <Link
                  href="/admin/transactions"
                  className="block p-3 rounded-md border border-border hover-elevate"
                  data-testid="link-manage-transactions"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <p className="font-medium text-sm">Manage Transactions</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review escrow & approvals
                  </p>
                </Link>
                <Link
                  href="/admin/testimonials"
                  className="block p-3 rounded-md border border-border hover-elevate"
                  data-testid="link-manage-testimonials"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="font-medium text-sm">Manage Testimonials</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Edit social proof on About
                  </p>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-status-snapshot">
              <CardHeader>
                <CardTitle>Status Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(statusCounts).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data</p>
                ) : (
                  <ul className="space-y-2">
                    {Object.entries(statusCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([status, count]) => (
                        <li
                          key={status}
                          className="flex items-center justify-between text-sm"
                          data-testid={`status-row-${status}`}
                        >
                          <span className="text-muted-foreground">
                            {STATUS_LABELS[status] || status}
                          </span>
                          <span className="font-semibold">{count}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
