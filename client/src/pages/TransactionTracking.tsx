import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, CheckCircle, Clock, Package, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const STATUS_STEPS = [
  { key: 'initiated', label: 'Purchase Initiated', icon: CheckCircle },
  { key: 'awaiting_admin_approval', label: 'Awaiting Approval', icon: Clock },
  { key: 'awaiting_payment_confirmation', label: 'Payment Instructions Sent', icon: DollarSign },
  { key: 'in_transit', label: 'Vehicle Shipping', icon: Package },
  { key: 'inspection', label: 'Inspection Period', icon: Eye },
  { key: 'approved', label: 'Purchase Approved', icon: CheckCircle },
  { key: 'released', label: 'Payment Released', icon: CheckCircle },
];

export default function TransactionTracking() {
  const [, params] = useRoute('/track/:idOrToken');
  const idOrToken = params?.idOrToken;
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/transactions', idOrToken],
    enabled: !!idOrToken,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading transaction details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data?.transaction) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground mb-4">Transaction not found</p>
          <Button onClick={() => setLocation('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const transaction = data.transaction;
  const vehicle = data.vehicle;
  const events = data.events || [];

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === transaction.status);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Track Your Purchase</h1>
            <p className="text-muted-foreground">
              Transaction ID: <span className="font-mono font-semibold">{transaction.id}</span>
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{vehicle.name}</p>
                    <p className="text-muted-foreground">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
                    <p className="text-xl font-bold text-primary mt-2">
                      ${parseFloat(transaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={transaction.status === 'released' ? 'default' : 'secondary'}>
                    {transaction.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              ) : (
                <p className="text-muted-foreground">Vehicle information not available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? 'bg-primary border-primary text-white'
                              : 'bg-background border-muted-foreground text-muted-foreground'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute left-5 top-10 w-0.5 h-12 -ml-px ${
                              isCompleted ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                          {step.label}
                        </p>
                        {isCurrent && transaction.status === 'awaiting_payment_confirmation' && transaction.bankInfo && (
                          <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                              Bank Information for Payment:
                            </p>
                            <pre className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                              {transaction.bankInfo}
                            </pre>
                          </div>
                        )}
                        {isCurrent && transaction.status === 'inspection' && (
                          <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <p className="text-sm text-yellow-900 dark:text-yellow-100">
                              You have <strong>{transaction.inspectionDays} days</strong> to inspect the vehicle.
                              Contact us at 1-800-CAR-DEAL to approve or report any issues.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {transaction.status === 'cancelled' && (
                  <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      This transaction has been cancelled. Contact us for more information.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{transaction.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{transaction.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{transaction.buyerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inspection Period</p>
                  <p className="font-medium">{transaction.inspectionDays} days</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Shipping Address</p>
                  <p className="font-medium">{transaction.shippingAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event: any) => (
                    <div key={event.id} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium">{event.status.replace(/_/g, ' ').toUpperCase()}</p>
                        {event.notes && (
                          <p className="text-sm text-muted-foreground">{event.notes}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Need Help?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
              If you have any questions about your purchase or the escrow process,
              our team is here to assist you.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">
                Call: 1-800-CAR-DEAL
              </Button>
              <Button variant="outline" size="sm">
                Email: info@autopro.com
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
