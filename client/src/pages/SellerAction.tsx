import { useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
      return apiRequest('POST', `/api/seller/${token}/accept`, { password, nonce: data?.nonce });
    },
    onSuccess: () => {
      setDone(true);
      setDoneMessage(t('seller.doneAcceptMsg'));
      toast({ title: t('seller.acceptedToastTitle'), description: t('seller.acceptedToastDesc') });
    },
    onError: (err: any) => {
      toast({ title: t('seller.errorTitle'), description: err.message || t('seller.errorDesc'), variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/seller/${token}/reject`, { password, reason, nonce: data?.nonce });
    },
    onSuccess: () => {
      setDone(true);
      setDoneMessage(t('seller.doneRejectMsg'));
      toast({ title: t('seller.rejectedToastTitle'), description: t('seller.rejectedToastDesc') });
    },
    onError: (err: any) => {
      toast({ title: t('seller.errorTitle'), description: err.message || t('seller.errorDesc'), variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!password) {
      toast({ title: t('seller.passwordRequiredTitle'), description: t('seller.passwordRequiredDesc'), variant: 'destructive' });
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
            <p className="text-muted-foreground">{t('seller.loading')}</p>
          </div>
        )}

        {(error || (!isLoading && !data)) && (
          <Card className="border-destructive">
            <CardContent className="pt-8 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t('seller.notFoundTitle')}</h2>
              <p className="text-muted-foreground">{t('seller.notFoundText')}</p>
            </CardContent>
          </Card>
        )}

        {data && (data.sellerStatus === 'accepted' || data.sellerStatus === 'rejected') && !done && (
          <Card>
            <CardContent className="pt-8 text-center">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t('seller.alreadyTitle')}</h2>
              <p className="text-muted-foreground">
                {t('seller.alreadyText', { status: data.sellerStatus })}
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
                {action === 'accept' ? t('seller.doneAcceptTitle') : t('seller.doneRejectTitle')}
              </h2>
              <p className="text-muted-foreground">{doneMessage}</p>
            </CardContent>
          </Card>
        )}

        {data && data.sellerStatus === 'pending' && !done && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-heading font-bold mb-1">{t('seller.title')}</h1>
              <p className="text-muted-foreground">{t('seller.subtitle')}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('seller.txDetails')}</CardTitle>
                <CardDescription>{t('seller.txDetailsSub')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('seller.txId')}</p>
                    <p className="font-mono font-semibold">#{data.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('seller.amount')}</p>
                    <p className="font-bold text-lg text-primary">
                      ${parseFloat(data.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('seller.buyer')}</p>
                    <p className="font-medium">{data.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('seller.inspectionPeriod')}</p>
                    <p className="font-medium">{t('seller.days', { n: data.inspectionDays })}</p>
                  </div>
                  {data.customVehicleDescription && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">{t('seller.vehicle')}</p>
                      <p className="font-medium">{data.customVehicleDescription}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!action && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('seller.howRespond')}</CardTitle>
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
                    {t('seller.accept')}
                  </Button>
                  <Button
                    className="flex-1 h-16 text-base"
                    variant="destructive"
                    onClick={() => setAction('reject')}
                    data-testid="button-choose-reject"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {t('seller.reject')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {action && (
              <Card className={action === 'accept' ? 'border-green-400' : 'border-destructive'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {action === 'accept' ? t('seller.confirmAcceptTitle') : t('seller.confirmRejectTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('seller.confirmDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('seller.passwordLabel')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('seller.passwordPh')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-seller-password"
                    />
                  </div>

                  {action === 'reject' && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">{t('seller.reasonLabel')}</Label>
                      <Textarea
                        id="reason"
                        placeholder={t('seller.reasonPh')}
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
                      {t('seller.back')}
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
                        ? t('seller.processing')
                        : action === 'accept'
                          ? t('seller.confirmAccept')
                          : t('seller.confirmReject')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              {t('seller.footerNote')}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
