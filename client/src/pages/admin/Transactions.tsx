import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, ExternalLink, Bitcoin, Building2, CheckCircle, XCircle, Clock, Trash2, AlertTriangle } from 'lucide-react';

const ALLOWED_NEXT: Record<string, string[]> = {
  initiated:                     ['awaiting_admin_approval', 'cancelled'],
  awaiting_admin_approval:       ['awaiting_payment_confirmation', 'cancelled'],
  awaiting_payment_confirmation: ['in_transit', 'cancelled'],
  in_transit:                    ['inspection', 'cancelled'],
  inspection:                    ['approved', 'cancelled'],
  approved:                      ['released', 'cancelled'],
  released:                      [],
  cancelled:                     [],
};

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  initiated: 'secondary',
  awaiting_admin_approval: 'secondary',
  awaiting_payment_confirmation: 'default',
  in_transit: 'default',
  inspection: 'default',
  approved: 'default',
  released: 'default',
  cancelled: 'destructive',
};

const SELLER_STATUS_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  pending:   { icon: Clock,        label: 'Pending',   color: 'text-yellow-600 dark:text-yellow-400' },
  accepted:  { icon: CheckCircle,  label: 'Accepted',  color: 'text-green-600 dark:text-green-400' },
  rejected:  { icon: XCircle,      label: 'Rejected',  color: 'text-red-600 dark:text-red-400' },
};

const CRYPTO_COINS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'LTC', 'XRP'];

export default function AdminTransactions() {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [bankInfo, setBankInfo] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoCoin, setCryptoCoin] = useState('BTC');
  const [notes, setNotes] = useState('');
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: number; status: string; paymentMethod?: string; bankInfo?: string;
      cryptoAddress?: string; cryptoCoin?: string; notes?: string;
      override?: boolean; overrideReason?: string;
    }) => {
      return await apiRequest('PATCH', `/api/admin/transactions/${data.id}`, {
        status: data.status,
        paymentMethod: data.paymentMethod,
        bankInfo: data.bankInfo,
        cryptoAddress: data.cryptoAddress,
        cryptoCoin: data.cryptoCoin,
        notes: data.notes,
        override: data.override,
        overrideReason: data.overrideReason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      toast({ title: 'Transaction updated', description: 'The transaction has been updated successfully.' });
      setDialogOpen(false);
      setSelectedTransaction(null);
      setBankInfo('');
      setCryptoAddress('');
      setNotes('');
      setOverrideEnabled(false);
      setOverrideReason('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      toast({ title: 'Transaction deleted', description: 'The transaction has been permanently deleted.' });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const currentStatus = selectedTransaction?.status as string | undefined;
  const allowedNext = currentStatus ? ALLOWED_NEXT[currentStatus] || [] : [];
  const isSameState = !!currentStatus && newStatus === currentStatus;
  const needsOverride = !!currentStatus && !isSameState && !allowedNext.includes(newStatus);

  const handleUpdateTransaction = () => {
    if (!selectedTransaction || !newStatus) return;

    if (needsOverride) {
      if (!overrideEnabled) {
        toast({
          title: 'Override required',
          description: `"${currentStatus}" → "${newStatus}" is not a normal step. Enable Admin Override below to proceed.`,
          variant: 'destructive',
        });
        return;
      }
      if (overrideReason.trim().length < 5) {
        toast({
          title: 'Override reason required',
          description: 'Please describe why this manual override is needed (at least 5 characters).',
          variant: 'destructive',
        });
        return;
      }
      const ok = window.confirm(
        `ADMIN OVERRIDE\n\nYou are about to force a state change that bypasses the normal flow:\n\n${currentStatus}  →  ${newStatus}\n\nThis will be permanently logged in the audit history. Continue?`
      );
      if (!ok) return;
    }

    updateMutation.mutate({
      id: selectedTransaction.id,
      status: newStatus,
      paymentMethod,
      bankInfo: paymentMethod === 'bank' ? bankInfo : undefined,
      cryptoAddress: paymentMethod === 'crypto' ? cryptoAddress : undefined,
      cryptoCoin: paymentMethod === 'crypto' ? cryptoCoin : undefined,
      notes: notes || undefined,
      override: needsOverride ? true : undefined,
      overrideReason: needsOverride ? overrideReason.trim() : undefined,
    });
  };

  const openDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    // Prefer admin's already-configured method (when bankInfo/cryptoAddress is set);
    // otherwise honor the buyer's preference; fall back to 'bank'.
    const adminAlreadyConfigured = !!(transaction.bankInfo || transaction.cryptoAddress);
    const initialMethod = adminAlreadyConfigured
      ? (transaction.paymentMethod || 'bank')
      : (transaction.buyerPaymentMethod || transaction.paymentMethod || 'bank');
    setPaymentMethod(initialMethod);
    setBankInfo(transaction.bankInfo || '');
    setCryptoAddress(transaction.cryptoAddress || '');
    setCryptoCoin(transaction.cryptoCoin || transaction.buyerPreferredCoin || 'BTC');
    setNotes('');
    setDialogOpen(true);
  };

  const transactions = transactionsData?.transactions || [];

  const SellerBadge = ({ sellerStatus }: { sellerStatus?: string }) => {
    const cfg = SELLER_STATUS_CONFIG[sellerStatus || 'pending'];
    const Icon = cfg.icon;
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
        <Icon className="w-3 h-3" /> {cfg.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Transactions</h2>
          <p className="text-muted-foreground">Manage escrow transactions and payment details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center">Loading...</p>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">#{transaction.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.buyerName}</p>
                          <p className="text-xs text-muted-foreground">{transaction.buyerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${parseFloat(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[transaction.status] || 'default'}>
                          {transaction.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.sellerEmail ? (
                          <div>
                            <p className="text-xs">{transaction.sellerEmail}</p>
                            <SellerBadge sellerStatus={transaction.sellerStatus} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Dealership</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.paymentMethod === 'crypto' ? (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Bitcoin className="w-3 h-3" /> {transaction.cryptoCoin || 'Crypto'}
                          </span>
                        ) : transaction.bankInfo ? (
                          <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            <Building2 className="w-3 h-3" /> Bank
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.paymentProofFile ? (
                          <a
                            href={transaction.paymentProofFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileText className="w-3 h-3" /> View
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : transaction.bankRef ? (
                          <span className="text-xs text-muted-foreground font-mono">{transaction.bankRef.slice(0, 12)}…</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(transaction)}
                            data-testid={`button-manage-${transaction.id}`}
                          >
                            Manage
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setDeleteTarget(transaction); setDeleteDialogOpen(true); }}
                            data-testid={`button-delete-${transaction.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Transaction #{selectedTransaction?.id}</DialogTitle>
            <DialogDescription>
              Update status and configure payment details for the buyer
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md text-sm">
                <div>
                  <p className="text-muted-foreground">Buyer</p>
                  <p className="font-medium">{selectedTransaction.buyerName}</p>
                  <p className="text-muted-foreground text-xs">{selectedTransaction.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold text-lg">${parseFloat(selectedTransaction.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Status</p>
                  <Badge variant={STATUS_COLORS[selectedTransaction.status] || 'default'}>
                    {selectedTransaction.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Seller Status</p>
                  {selectedTransaction.sellerEmail ? (
                    <div>
                      <p className="text-xs text-muted-foreground">{selectedTransaction.sellerEmail}</p>
                      <span className={`text-xs font-medium ${SELLER_STATUS_CONFIG[selectedTransaction.sellerStatus || 'pending'].color}`}>
                        {SELLER_STATUS_CONFIG[selectedTransaction.sellerStatus || 'pending'].label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Dealership vehicle</span>
                  )}
                </div>

                {/* Payment proof */}
                {(selectedTransaction.paymentProofFile || selectedTransaction.bankRef) && (
                  <div className="col-span-2 border-t pt-3">
                    <p className="text-muted-foreground font-medium mb-1">Buyer Payment Confirmation</p>
                    {selectedTransaction.bankRef && (
                      <p className="text-xs">Ref / TX Hash: <span className="font-mono">{selectedTransaction.bankRef}</span></p>
                    )}
                    {selectedTransaction.paymentProofFile && (
                      <a
                        href={selectedTransaction.paymentProofFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <FileText className="w-3 h-3" /> View Payment Proof
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Buyer's preferred payment method */}
              {selectedTransaction.buyerPaymentMethod && (
                <div className="flex items-start gap-2 p-3 rounded-md border bg-primary/5 text-sm">
                  {selectedTransaction.buyerPaymentMethod === 'crypto' ? (
                    <Bitcoin className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  ) : (
                    <Building2 className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      Buyer prefers: <span className="capitalize">{selectedTransaction.buyerPaymentMethod}</span>
                      {selectedTransaction.buyerPaymentMethod === 'crypto' && selectedTransaction.buyerPreferredCoin && (
                        <> — {selectedTransaction.buyerPreferredCoin}</>
                      )}
                      {selectedTransaction.buyerPaymentMethod === 'crypto' && selectedTransaction.buyerPreferredNetwork && (
                        <> ({selectedTransaction.buyerPreferredNetwork})</>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You can honor or override this preference below.
                    </p>
                  </div>
                </div>
              )}

              {/* Status selector */}
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initiated">Initiated</SelectItem>
                    <SelectItem value="awaiting_admin_approval">Awaiting Admin Approval</SelectItem>
                    <SelectItem value="awaiting_payment_confirmation">Awaiting Payment Confirmation</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="inspection">Inspection Period</SelectItem>
                    <SelectItem value="approved">Buyer Approved</SelectItem>
                    <SelectItem value="released">Payment Released</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {currentStatus && !isSameState && (
                  <p className="text-xs text-muted-foreground">
                    Allowed next steps: {allowedNext.length ? allowedNext.join(', ') : '(none — final state)'}
                  </p>
                )}
              </div>

              {/* Admin Override block — appears only when transition is non-standard */}
              {needsOverride && (
                <div className="border border-destructive/50 bg-destructive/5 rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold text-destructive">Admin override required</p>
                      <p className="text-sm text-muted-foreground">
                        Moving from <strong>{currentStatus}</strong> to <strong>{newStatus}</strong> is not part of the
                        normal flow. This will be permanently logged in the transaction history.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="override-toggle"
                      checked={overrideEnabled}
                      onChange={(e) => setOverrideEnabled(e.target.checked)}
                      data-testid="checkbox-override"
                    />
                    <Label htmlFor="override-toggle" className="cursor-pointer">
                      I understand — enable Admin Override
                    </Label>
                  </div>
                  {overrideEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="override-reason">Reason for override (required, min. 5 chars)</Label>
                      <Textarea
                        id="override-reason"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Buyer paid out-of-band; jumping straight to in_transit"
                        data-testid="input-override-reason"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Payment Method Toggle */}
              <div className="space-y-3">
                <Label>Payment Method for Buyer</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setPaymentMethod('bank')}
                    data-testid="button-payment-bank"
                  >
                    <Building2 className="w-4 h-4" /> Bank Transfer
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setPaymentMethod('crypto')}
                    data-testid="button-payment-crypto"
                  >
                    <Bitcoin className="w-4 h-4" /> Cryptocurrency
                  </Button>
                </div>

                {paymentMethod === 'bank' ? (
                  <div className="space-y-2">
                    <Label htmlFor="bankInfo">Bank Account Details</Label>
                    <Textarea
                      id="bankInfo"
                      value={bankInfo}
                      onChange={(e) => setBankInfo(e.target.value)}
                      placeholder="Bank Name: XYZ Bank&#10;Account Name: AutoPro Escrow&#10;Account Number: 123456789&#10;Routing Number: 987654321&#10;Reference: TXN-1234"
                      className="min-h-[120px] font-mono text-sm"
                      data-testid="input-bank-info"
                    />
                    <p className="text-xs text-muted-foreground">
                      These details will be securely shared with the buyer via the tracking page and email.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Cryptocurrency</Label>
                      <Select value={cryptoCoin} onValueChange={setCryptoCoin}>
                        <SelectTrigger data-testid="select-crypto-coin">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CRYPTO_COINS.map(coin => (
                            <SelectItem key={coin} value={coin}>{coin}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cryptoAddress">Wallet Address</Label>
                      <Input
                        id="cryptoAddress"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        placeholder="Enter wallet address..."
                        className="font-mono text-sm"
                        data-testid="input-crypto-address"
                      />
                      <p className="text-xs text-muted-foreground">
                        Buyer will send the equivalent amount in {cryptoCoin} to this address.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes about this update..."
                  data-testid="input-notes"
                />
              </div>

              {/* Info box when setting payment confirmation */}
              {newStatus === 'awaiting_payment_confirmation' && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    Email Alert: Setting this status will send payment instructions to the buyer.
                  </p>
                  <p className="text-amber-800 dark:text-amber-200 mt-1">
                    Make sure you have filled in the {paymentMethod === 'crypto' ? 'wallet address and coin type' : 'bank details'} above before saving.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleUpdateTransaction} disabled={updateMutation.isPending} data-testid="button-update">
              {updateMutation.isPending ? 'Updating...' : 'Update Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Transaction
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The transaction and all its history will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="p-4 bg-muted rounded-md text-sm space-y-1">
              <p><strong>ID:</strong> #{deleteTarget.id}</p>
              <p><strong>Buyer:</strong> {deleteTarget.buyerName} ({deleteTarget.buyerEmail})</p>
              <p><strong>Amount:</strong> ${parseFloat(deleteTarget.amount).toLocaleString()}</p>
              <p><strong>Status:</strong> {deleteTarget.status.replace(/_/g, ' ')}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
