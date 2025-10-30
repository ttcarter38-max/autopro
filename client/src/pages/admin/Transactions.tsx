import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive"> = {
  initiated: 'secondary',
  awaiting_admin_approval: 'secondary',
  awaiting_payment_confirmation: 'default',
  in_transit: 'default',
  inspection: 'default',
  approved: 'default',
  released: 'default',
  cancelled: 'destructive',
};

export default function AdminTransactions() {
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [notes, setNotes] = useState('');

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; bankInfo?: string; notes?: string }) => {
      return await apiRequest(`/api/admin/transactions/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: data.status,
          bankInfo: data.bankInfo,
          notes: data.notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      toast({
        title: 'Transaction updated',
        description: 'The transaction status has been updated successfully.',
      });
      setDialogOpen(false);
      setSelectedTransaction(null);
      setBankInfo('');
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUpdateTransaction = () => {
    if (!selectedTransaction || !newStatus) return;

    updateMutation.mutate({
      id: selectedTransaction.id,
      status: newStatus,
      bankInfo: bankInfo || undefined,
      notes: notes || undefined,
    });
  };

  const openDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setBankInfo(transaction.bankInfo || '');
    setNotes('');
    setDialogOpen(true);
  };

  const transactions = transactionsData?.transactions || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-heading font-bold">Transactions</h2>
          <p className="text-muted-foreground">Manage escrow transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
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
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inspection Days</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono">{transaction.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.buyerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.vehicleId}</TableCell>
                      <TableCell className="font-semibold">
                        ${parseFloat(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[transaction.status] || 'default'}>
                          {transaction.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.inspectionDays} days</TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(transaction)}
                          data-testid={`button-manage-${transaction.id}`}
                        >
                          Manage
                        </Button>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Transaction #{selectedTransaction?.id}</DialogTitle>
            <DialogDescription>
              Update transaction status and provide bank information to buyer
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="font-medium">{selectedTransaction.buyerName}</p>
                  <p className="text-sm">{selectedTransaction.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold text-lg">
                    ${parseFloat(selectedTransaction.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge variant={STATUS_COLORS[selectedTransaction.status] || 'default'}>
                    {selectedTransaction.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inspection Period</p>
                  <p className="font-medium">{selectedTransaction.inspectionDays} days</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankInfo">Bank Information (Password Protected)</Label>
                <Textarea
                  id="bankInfo"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  placeholder="Enter bank account details for buyer payment..."
                  className="min-h-[100px]"
                  data-testid="input-bank-info"
                />
                <p className="text-sm text-muted-foreground">
                  This information will be securely shared with the buyer for escrow payment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                  data-testid="input-notes"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Escrow Process Flow:
                </p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Buyer initiates transaction</li>
                  <li>Admin approves and sends bank details</li>
                  <li>Buyer sends payment confirmation</li>
                  <li>Vehicle ships to buyer</li>
                  <li>Buyer inspects vehicle (1-5 days)</li>
                  <li>Buyer approves purchase</li>
                  <li>Admin releases payment to seller</li>
                </ol>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTransaction}
              disabled={updateMutation.isPending}
              data-testid="button-update"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
