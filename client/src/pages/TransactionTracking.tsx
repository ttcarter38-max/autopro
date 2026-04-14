import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import {
  ArrowLeft, CheckCircle, Clock, Package, Eye, DollarSign,
  Upload, Copy, Bitcoin, Building2, FileText, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { queryClient } from '@/lib/queryClient';

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
  const { toast } = useToast();

  const [bankRef, setBankRef] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/transactions', idOrToken],
    enabled: !!idOrToken,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied to clipboard' });
    });
  };

  const handleProofUpload = async () => {
    if (!proofFile && !bankRef) {
      toast({ title: 'Please provide a bank reference or upload a proof file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (bankRef) formData.append('bankRef', bankRef);
    if (proofFile) formData.append('proof', proofFile);

    try {
      const res = await fetch(`/api/transactions/${idOrToken}/payment-proof`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      toast({ title: 'Payment proof submitted!', description: 'Our team will verify your payment shortly.' });
      setBankRef('');
      setProofFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', idOrToken] });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

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
  const isPaymentStep = transaction.status === 'awaiting_payment_confirmation';
  const hasPaymentDetails = transaction.bankInfo || transaction.cryptoAddress;
  const alreadySubmittedProof = !!transaction.paymentProofFile || !!transaction.bankRef;

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
              Transaction ID: <span className="font-mono font-semibold">#{transaction.id}</span>
            </p>
          </div>

          {/* Vehicle / Transaction summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
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
              ) : transaction.customVehicleDescription ? (
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{transaction.customVehicleDescription}</p>
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

          {/* Progress Steps */}
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
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-muted-foreground text-muted-foreground'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div className={`absolute left-5 top-10 w-0.5 h-12 -ml-px ${
                            isCompleted ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>{step.label}</p>

                        {/* Payment instructions when awaiting payment */}
                        {isCurrent && isPaymentStep && hasPaymentDetails && (
                          <div className="mt-3 space-y-3">
                            {transaction.paymentMethod === 'crypto' && transaction.cryptoAddress ? (
                              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bitcoin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                                    Send {transaction.cryptoCoin || 'Crypto'} Payment
                                  </p>
                                </div>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mb-1">
                                  Amount: <strong>${parseFloat(transaction.amount).toLocaleString()}</strong> equivalent in {transaction.cryptoCoin}
                                </p>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">Wallet Address:</p>
                                <div className="flex items-center gap-2 bg-white dark:bg-black/30 rounded p-2 border border-amber-200 dark:border-amber-700">
                                  <code className="text-xs font-mono flex-1 break-all">{transaction.cryptoAddress}</code>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(transaction.cryptoAddress)}
                                    data-testid="button-copy-address"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                                  After sending, upload a screenshot or transaction hash as proof below.
                                </p>
                              </div>
                            ) : transaction.bankInfo ? (
                              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  <p className="font-semibold text-blue-900 dark:text-blue-100">Bank Transfer Details</p>
                                </div>
                                <pre className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-mono bg-white dark:bg-black/30 p-3 rounded border border-blue-200 dark:border-blue-700">
                                  {transaction.bankInfo}
                                </pre>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                                  After transferring, upload your receipt or provide a reference number below.
                                </p>
                              </div>
                            ) : null}
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
                  <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-100">Transaction Cancelled</p>
                      {transaction.notes && (
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">{transaction.notes}</p>
                      )}
                      <p className="text-sm text-red-800 dark:text-red-200 mt-1">Contact us for more information.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Proof Upload — only when awaiting payment confirmation */}
          {isPaymentStep && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Submit Payment Proof
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alreadySubmittedProof ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">Payment proof submitted</p>
                      {transaction.bankRef && (
                        <p className="text-sm text-green-800 dark:text-green-200">Ref: {transaction.bankRef}</p>
                      )}
                      {transaction.paymentProofFile && (
                        <a
                          href={transaction.paymentProofFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                        >
                          <FileText className="w-3 h-3" /> View uploaded proof
                        </a>
                      )}
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">Our team is verifying your payment.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      After making your payment, provide your transaction reference and/or upload a screenshot or PDF receipt.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="bankRef">Bank Reference / Transaction Hash (optional)</Label>
                      <Input
                        id="bankRef"
                        placeholder="e.g. TRX-1234567 or 0x123abc..."
                        value={bankRef}
                        onChange={(e) => setBankRef(e.target.value)}
                        data-testid="input-bank-ref"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proofFile">Upload Proof File (image or PDF, max 16MB)</Label>
                      <input
                        ref={fileInputRef}
                        id="proofFile"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        data-testid="input-proof-file"
                      />
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-choose-file"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {proofFile ? proofFile.name : 'Choose File'}
                        </Button>
                        {proofFile && (
                          <span className="text-sm text-muted-foreground">
                            {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={handleProofUpload}
                      disabled={uploading || (!proofFile && !bankRef)}
                      className="w-full"
                      data-testid="button-submit-proof"
                    >
                      {uploading ? 'Uploading...' : 'Submit Payment Proof'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Buyer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{transaction.buyerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{transaction.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{transaction.buyerPhone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inspection Period</p>
                  <p className="font-medium">{transaction.inspectionDays} days</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Shipping Address</p>
                  <p className="font-medium">{transaction.shippingAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event history */}
          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event: any) => (
                    <div key={event.id} className="flex flex-wrap justify-between items-start gap-2 border-b pb-3 last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{event.status.replace(/_/g, ' ').toUpperCase()}</p>
                        {event.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{event.notes}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <div className="bg-muted/50 p-6 rounded-md">
            <p className="font-semibold mb-2">Need Help?</p>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your purchase or the escrow process, our team is here to assist you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" data-testid="button-call">
                Call: 1-800-CAR-DEAL
              </Button>
              <Button variant="outline" size="sm" data-testid="button-email">
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
