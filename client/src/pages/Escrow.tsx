import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Shield,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Clock,
  Lock,
  FileText,
  Search,
  Plus,
  ClipboardList,
  ClipboardEdit,
  CreditCard,
  Truck,
  Eye,
  KeyRound,
  BellRing,
  Wallet,
  Sparkles,
  Timer,
  MessageCircle,
} from 'lucide-react';
import conciergeAvatar from '@assets/generated_images/chat_concierge.png';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useSeo } from '@/hooks/useSeo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import PaymentMethodPicker, { type PaymentMethodValue } from '@/components/PaymentMethodPicker';

export default function Escrow() {
  const { t } = useTranslation();
  useSeo({
    title: t('escrow.seoTitle'),
    description:
      'AutoPro escrow holds your funds safely from purchase through delivery. Track transactions, fund with bank or card, release on inspection.',
  });
  const [trackingInput, setTrackingInput] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentPref, setPaymentPref] = useState<PaymentMethodValue>({ buyerPaymentMethod: 'bank' });

  const customEscrowSchema = z.object({
    vehicleDescription: z.string().min(10, t('escrow.form.errors.vehicleDesc')),
    price: z.string().min(1, t('escrow.form.errors.priceReq')),
    buyerName: z.string().min(2, t('escrow.form.errors.nameReq')),
    buyerEmail: z.string().email(t('escrow.form.errors.emailReq')),
    buyerPhone: z.string().min(10, t('escrow.form.errors.phoneReq')),
    shippingAddress: z.string().min(10, t('escrow.form.errors.shippingReq')),
    inspectionDays: z.string().min(1, t('escrow.form.errors.inspectionReq')),
    sellerEmail: z.string().email(t('escrow.form.errors.sellerEmail')).optional().or(z.literal('')),
    sellerName: z.string().optional(),
  });

  type CustomEscrowForm = z.infer<typeof customEscrowSchema>;

  const form = useForm<CustomEscrowForm>({
    resolver: zodResolver(customEscrowSchema),
    defaultValues: {
      vehicleDescription: '',
      price: '',
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      shippingAddress: '',
      inspectionDays: '3',
      sellerEmail: '',
      sellerName: '',
    },
  });

  useEffect(() => {
    if (user && user.role === 'customer') {
      if (!form.getValues('buyerName')) form.setValue('buyerName', user.name);
      if (!form.getValues('buyerEmail')) form.setValue('buyerEmail', user.email);
      if (!form.getValues('buyerPhone') && user.phone) form.setValue('buyerPhone', user.phone);
    }
  }, [user, form]);

  const createCustomEscrowMutation = useMutation({
    mutationFn: async (data: CustomEscrowForm) => {
      const response = await apiRequest('POST', '/api/transactions/custom', {
        customVehicleDescription: data.vehicleDescription,
        amount: data.price,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        shippingAddress: data.shippingAddress,
        inspectionDays: parseInt(data.inspectionDays),
        sellerEmail: data.sellerEmail || null,
        sellerName: data.sellerName || null,
        buyerPaymentMethod: paymentPref.buyerPaymentMethod,
        buyerPreferredCoin: paymentPref.buyerPreferredCoin || null,
        buyerPreferredNetwork: paymentPref.buyerPreferredNetwork || null,
      });
      const result = await response.json();
      return result as { id?: number; guestToken?: string | null; transaction?: { id: number; guestToken?: string | null } };
    },
    onSuccess: (data) => {
      const txId = data.transaction?.id ?? data.id;
      const token = data.guestToken ?? data.transaction?.guestToken;
      toast({
        title: t('escrow.form.successTitle'),
        description: t('escrow.form.successDesc', { id: txId }),
      });
      form.reset();
      setLocation(`/track/${token || txId}`);
    },
    onError: (error: Error) => {
      toast({
        title: t('escrow.form.errorTitle'),
        description: error.message || t('escrow.form.errorDesc'),
        variant: 'destructive',
      });
    },
  });

  const handleTrackTransaction = () => {
    if (trackingInput.trim()) {
      setLocation(`/track/${trackingInput.trim()}`);
    }
  };

  const onSubmit = (data: CustomEscrowForm) => {
    createCustomEscrowMutation.mutate(data);
  };

  const buyerSteps: { Icon: typeof Shield; titleKey: string; descKey: string }[] = [
    { Icon: Search, titleKey: 's1t', descKey: 's1d' },
    { Icon: ClipboardEdit, titleKey: 's2t', descKey: 's2d' },
    { Icon: ShieldCheck, titleKey: 's3t', descKey: 's3d' },
    { Icon: CreditCard, titleKey: 's4t', descKey: 's4d' },
    { Icon: Truck, titleKey: 's5t', descKey: 's5d' },
    { Icon: Eye, titleKey: 's6t', descKey: 's6d' },
    { Icon: CheckCircle2, titleKey: 's7t', descKey: 's7d' },
    { Icon: KeyRound, titleKey: 's8t', descKey: 's8d' },
  ];

  const sellerSteps: { Icon: typeof Shield; key: string }[] = [
    { Icon: ClipboardList, key: 's1' },
    { Icon: BellRing, key: 's2' },
    { Icon: Eye, key: 's3' },
    { Icon: Wallet, key: 's4' },
  ];

  const whyItems: { Icon: typeof Shield; key: string }[] = [
    { Icon: ShieldCheck, key: 'secure' },
    { Icon: Timer, key: 'flex' },
    { Icon: Sparkles, key: 'simple' },
  ];

  const openChat = () => window.dispatchEvent(new CustomEvent('autopro:open-chat'));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4" data-testid="text-escrow-title">
              {t('escrow.heroTitle')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('escrow.heroSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-browse-vehicles">
                <Link href="/">{t('escrow.browseVehicles')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-start-custom-escrow">
                <a href="#start-escrow">{t('escrow.startCustom')}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t('escrow.howTitle')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('escrow.howSub')}
            </p>
          </div>

          <Tabs defaultValue="buyer" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="buyer" data-testid="tab-buyer">{t('escrow.tabBuyer')}</TabsTrigger>
              <TabsTrigger value="seller" data-testid="tab-seller">{t('escrow.tabSeller')}</TabsTrigger>
            </TabsList>

            <TabsContent value="buyer">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {buyerSteps.map((step, idx) => {
                  const { Icon } = step;
                  return (
                    <div
                      key={step.titleKey}
                      className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1.5 overflow-hidden"
                      data-testid={`buyer-step-${idx + 1}`}
                    >
                      <span className="absolute top-3 right-4 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground/70">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="relative mb-5">
                        <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-500 group-hover:scale-105">
                          <Icon className="w-7 h-7 text-primary" strokeWidth={1.6} />
                        </div>
                      </div>
                      <h3 className="font-heading font-bold text-lg mb-2 tracking-display">
                        {t(`escrow.buyer.${step.titleKey}`)}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(`escrow.buyer.${step.descKey}`)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="seller">
              <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sellerSteps.map(({ Icon, key }, idx) => (
                  <div
                    key={key}
                    className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1.5 overflow-hidden"
                    data-testid={`seller-step-${idx + 1}`}
                  >
                    <span className="absolute top-3 right-4 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground/70">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex gap-5 items-start">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-500 group-hover:scale-105">
                          <Icon className="w-7 h-7 text-primary" strokeWidth={1.6} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg mb-2 tracking-display">
                          {t(`escrow.seller.${key}t`)}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(`escrow.seller.${key}d`)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Start Custom Escrow Form */}
      <div id="start-escrow" className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t('escrow.form.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('escrow.form.subtitle')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('escrow.form.cardTitle')}</CardTitle>
              <CardDescription>
                {t('escrow.form.cardDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('escrow.form.vehicleInfo')}</h3>

                    <FormField
                      control={form.control}
                      name="vehicleDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('escrow.form.vehicleDescription')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('escrow.form.vehicleDescriptionPh')}
                              className="min-h-24"
                              data-testid="input-vehicle-description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('escrow.form.vehicleDescriptionHelp')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('escrow.form.price')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25000" data-testid="input-price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('escrow.form.buyerInfo')}</h3>

                    <FormField
                      control={form.control}
                      name="buyerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('escrow.form.yourName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('escrow.form.yourNamePh')} data-testid="input-buyer-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="buyerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('escrow.form.yourEmail')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('escrow.form.yourEmailPh')} data-testid="input-buyer-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="buyerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('escrow.form.yourPhone')}</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder={t('escrow.form.yourPhonePh')} data-testid="input-buyer-phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('escrow.form.sellerInfoTitle')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('escrow.form.sellerInfoSub')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sellerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('escrow.form.sellerName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('escrow.form.sellerNamePh')} data-testid="input-seller-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sellerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('escrow.form.sellerEmail')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('escrow.form.sellerEmailPh')} data-testid="input-seller-email" {...field} />
                            </FormControl>
                            <FormDescription>
                              {t('escrow.form.sellerEmailHelp')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('escrow.form.delivery')}</h3>

                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('escrow.form.shippingAddress')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('escrow.form.shippingAddressPh')}
                              className="min-h-20"
                              data-testid="input-shipping-address"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('escrow.form.shippingAddressHelp')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inspectionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('escrow.form.inspectionPeriod')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-inspection-days">
                                <SelectValue placeholder={t('escrow.form.inspectionPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">{t('escrow.form.day1')}</SelectItem>
                              <SelectItem value="2">{t('escrow.form.day2')}</SelectItem>
                              <SelectItem value="3">{t('escrow.form.day3')}</SelectItem>
                              <SelectItem value="4">{t('escrow.form.day4')}</SelectItem>
                              <SelectItem value="5">{t('escrow.form.day5')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t('escrow.form.inspectionHelp')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('escrow.form.paymentPref')}</h3>
                    <PaymentMethodPicker value={paymentPref} onChange={setPaymentPref} />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={createCustomEscrowMutation.isPending}
                    data-testid="button-submit-escrow"
                  >
                    {createCustomEscrowMutation.isPending ? t('escrow.form.submitting') : t('escrow.form.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Track Transaction Section */}
      <div className="py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {t('escrow.track.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('escrow.track.desc')}
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={t('escrow.track.placeholder')}
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackTransaction()}
                  data-testid="input-track-transaction"
                />
                <Button onClick={handleTrackTransaction} data-testid="button-track">
                  {t('escrow.track.button')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Our Escrow Section */}
      <div className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {t('escrow.why.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map(({ Icon, key }) => (
              <div
                key={key}
                className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-8 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-2 overflow-hidden"
                data-testid={`why-${key}`}
              >
                <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/25 shadow-[0_20px_40px_-12px_hsl(var(--primary)/0.55)] transition-transform duration-500 group-hover:scale-105">
                    <Icon className="w-9 h-9 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-heading font-bold text-2xl mb-3 tracking-display">
                  {t(`escrow.why.${key}Title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`escrow.why.${key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {t('escrow.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('escrow.cta.sub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-start-browsing">
              <Link href="/">{t('escrow.browseVehicles')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
              <a href="#start-escrow">{t('escrow.startCustom')}</a>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('escrow.faq.title')}
          </h2>

          <div className="space-y-6">
            {(['1', '2', '3', '4'] as const).map((n) => (
              <Card key={n}>
                <CardHeader>
                  <CardTitle className="text-lg">{t(`escrow.faq.q${n}`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t(`escrow.faq.a${n}`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact / Chat CTA */}
      <div className="py-16 sm:py-20 bg-muted">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 sm:p-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
            <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-10">
              {/* Concierge avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110" aria-hidden="true" />
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.6)]">
                  <img
                    src={conciergeAvatar}
                    alt="AutoPro concierge"
                    className="w-full h-full object-cover"
                    data-testid="img-escrow-concierge"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-card border border-card-border shadow-md">
                  <span className="relative w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
              </div>

              {/* Copy */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-display mb-2" data-testid="text-escrow-chat-title">
                  {t('escrow.contact.title')}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                  {t('escrow.contact.sub')}
                </p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 w-full md:w-auto">
                <Button
                  size="lg"
                  onClick={openChat}
                  className="w-full md:w-auto shadow-[0_15px_40px_-12px_hsl(var(--primary)/0.6)]"
                  data-testid="button-escrow-open-chat"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start a Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
