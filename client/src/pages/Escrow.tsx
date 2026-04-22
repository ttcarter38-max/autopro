import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, CheckCircle, Clock, Lock, FileText, Search, Plus } from 'lucide-react';
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
      return result as { id: number; guestToken: string };
    },
    onSuccess: (data) => {
      toast({
        title: t('escrow.form.successTitle'),
        description: t('escrow.form.successDesc', { id: data.id }),
      });
      form.reset();
      setLocation(`/track/${data.guestToken}`);
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

  const buyerSteps = [
    { num: '1', titleKey: 's1t', descKey: 's1d' },
    { num: '2', titleKey: 's2t', descKey: 's2d' },
    { num: '3', titleKey: 's3t', descKey: 's3d' },
    { num: '4', titleKey: 's4t', descKey: 's4d' },
    { num: '5', titleKey: 's5t', descKey: 's5d' },
    { num: '6', titleKey: 's6t', descKey: 's6d' },
    { num: 'check', titleKey: 's7t', descKey: 's7d' },
    { num: 'lock', titleKey: 's8t', descKey: 's8d' },
  ];

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {buyerSteps.map((step) => (
                  <Card key={step.titleKey}>
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {step.num === 'check' ? (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        ) : step.num === 'lock' ? (
                          <Lock className="w-6 h-6 text-primary" />
                        ) : (
                          <span className="text-xl font-bold text-primary">{step.num}</span>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2">{t(`escrow.buyer.${step.titleKey}`)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`escrow.buyer.${step.descKey}`)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="seller">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {([
                        { Icon: FileText, key: 's1' },
                        { Icon: Clock, key: 's2' },
                        { Icon: Shield, key: 's3' },
                        { Icon: CheckCircle, key: 's4' },
                      ]).map(({ Icon, key }) => (
                        <div key={key} className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">{t(`escrow.seller.${key}t`)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {t(`escrow.seller.${key}d`)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
            {([
              { Icon: Shield, key: 'secure' },
              { Icon: Clock, key: 'flex' },
              { Icon: CheckCircle, key: 'simple' },
            ]).map(({ Icon, key }) => (
              <Card key={key}>
                <CardHeader>
                  <Icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{t(`escrow.why.${key}Title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t(`escrow.why.${key}Desc`)}
                  </p>
                </CardContent>
              </Card>
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

      {/* Contact Section */}
      <div className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">
            {t('escrow.contact.title')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {t('escrow.contact.sub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              {t('escrow.contact.call')}
            </Button>
            <Button variant="outline" size="lg">
              {t('escrow.contact.email')}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
