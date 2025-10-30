import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Receipt, DollarSign, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  const { data: vehicles } = useQuery({
    queryKey: ['/api/admin/vehicles'],
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/admin/transactions'],
  });

  const stats = {
    totalVehicles: vehicles?.vehicles?.length || 0,
    availableVehicles: vehicles?.vehicles?.filter((v: any) => v.available).length || 0,
    totalTransactions: transactions?.transactions?.length || 0,
    activeTransactions: transactions?.transactions?.filter(
      (t: any) => !['released', 'cancelled'].includes(t.status)
    ).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your dealership</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.availableVehicles} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTransactions} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+0%</div>
              <p className="text-xs text-muted-foreground">From last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions?.transactions?.slice(0, 5).length > 0 ? (
                <div className="space-y-4">
                  {transactions.transactions.slice(0, 5).map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{transaction.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{transaction.status}</p>
                      </div>
                      <p className="font-semibold">${parseFloat(transaction.amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No transactions yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/admin/vehicles/new"
                className="block p-3 rounded-md border hover-elevate transition-all"
              >
                <p className="font-medium">Add New Vehicle</p>
                <p className="text-sm text-muted-foreground">List a new car for sale</p>
              </a>
              <a
                href="/admin/transactions"
                className="block p-3 rounded-md border hover-elevate transition-all"
              >
                <p className="font-medium">Manage Transactions</p>
                <p className="text-sm text-muted-foreground">View and process escrow payments</p>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
