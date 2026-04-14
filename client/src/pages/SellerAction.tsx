import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type ActionType = 'accept' | 'reject' | null;

export default function SellerAction() {
  const [, params] = useRoute('/seller/:token');
  const token = params?.token;
  const { toast } = useToast();

  // Read ?action= from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialAction = (urlParams.get('action') as ActionType) || null;

  const [action, setAction] = useState<ActionType>(initialAction);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/seller', token],
    queryFn: async () => {
      const res = await fetch(`/api/seller/${token}`);
      if (!res.ok) throw new Error('Transaction not found');
      return res.json();
    },
    enabled: !!token,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/seller/${token}/accept`, { password });
    },
    onSuccess: () => {
      setDone(true);
      setDoneMessage('You have successfully accepted this transaction. The buyer will be notified and payment instructions will be shared shortly.');
      toast({ title: 'Transaction Accepted', description: 'The escrow transaction has been accepted.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Incorrect password or transaction error', variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/seller/${token}/reject`, { password, reason });
    },
    onSuccess: () => {
      setDone(true);
      setDoneMessage('You have rejected this transaction. The buyer will be notified.');
      toast({ title: 'Transaction Rejected', description: 'The transaction has been declined.' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message || 'Incorrect password or transaction error', variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!password) {
      toast({ title: 'Password required', description: 'Please enter the access password.', variant: 'destructive' });
      return;
    }
    if (action === 'accept') acceptMutation.mutate();
    else if (action === 'reject') rejectMutation.mutate();
  };

  const isPending = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16">
        {isLoading && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading transaction details...</p>
          </div>
        )}

        {(error || (!isLoading && !data)) && (
          <Card className="border-destructive">
            <CardContent className="pt-8 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Transaction Not Found</h2>
              <p className="text-muted-foreground">This link is invalid or has expired. Please contact the buyer or AutoPro support.</p>
            </CardContent>
          </Card>
        )}

        {data && (data.sellerStatus === 'accepted' || data.sellerStatus === 'rejected') && !done && (
          <Card>
            <CardContent className="pt-8 text-center">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Already Responded</h2>
              <p className="text-muted-foreground">
                You have already {data.sellerStatus} this transaction. No further action is needed.
              </p>
              <Badge className="mt-4" variant={data.sellerStatus === 'accepted' ? 'default' : 'destructive'}>
                {data.sellerStatus}
              </Badge>
            </CardContent>
          </Card>
        )}

        {done && (
          <Card className={action === 'accept' ? 'border-green-500' : 'border-destructive'}>
            <CardContent className="pt-8 text-center">
              {action === 'accept'
                ? <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                : <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              }
              <h2 className="text-2xl font-bold mb-3">
                {action === 'accept' ? 'Transaction Accepted!' : 'Transaction Rejected'}
              </h2>
              <p className="text-muted-foreground">{doneMessage}</p>
            </CardContent>
          </Card>
        )}

        {data && data.sellerStatus === 'pending' && !done && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-1">Escrow Transaction Response</h1>
              <p className="text-muted-foreground">A buyer has initiated an escrow transaction for your vehicle. Please review and respond.</p>
            </div>

            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>Review before responding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono font-semibold">#{data.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-bold text-lg text-primary">
                      ${parseFloat(data.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                    <p className="font-medium">{data.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inspection Period</p>
                    <p className="font-medium">{data.inspectionDays} days</p>
                  </div>
                  {data.customVehicleDescription && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{data.customVehicleDescription}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Selection */}
            {!action && (
              <Card>
                <CardHeader>
                  <CardTitle>How would you like to respond?</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button
                    className="flex-1 h-16 text-base"
                    variant="default"
                    style={{ backgroundColor: '#16a34a' }}
                    onClick={() => setAction('accept')}
                    data-testid="button-choose-accept"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Accept Transaction
                  </Button>
                  <Button
                    className="flex-1 h-16 text-base"
                    variant="destructive"
                    onClick={() => setAction('reject')}
                    data-testid="button-choose-reject"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Transaction
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Password + Confirm Form */}
            {action && (
              <Card className={action === 'accept' ? 'border-green-400' : 'border-destructive'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {action === 'accept' ? 'Confirm Acceptance' : 'Confirm Rejection'}
                  </CardTitle>
                  <CardDescription>
                    Enter the access password provided by the buyer to confirm your response.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Access Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter access password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-seller-password"
                    />
                  </div>

                  {action === 'reject' && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for rejection (optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Explain why you are rejecting this transaction..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        data-testid="input-reject-reason"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setAction(null)}
                      disabled={isPending}
                      data-testid="button-back-action"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      variant={action === 'accept' ? 'default' : 'destructive'}
                      style={action === 'accept' ? { backgroundColor: '#16a34a' } : {}}
                      onClick={handleSubmit}
                      disabled={isPending}
                      data-testid="button-confirm-action"
                    >
                      {isPending
                        ? 'Processing...'
                        : action === 'accept'
                          ? 'Confirm — Accept Transaction'
                          : 'Confirm — Reject Transaction'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              AutoPro Escrow protects both buyers and sellers. Your payment will only be released after the buyer confirms receipt and approves the vehicle.
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
