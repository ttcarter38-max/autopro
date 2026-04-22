import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation, Link } from 'wouter';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleCard from '@/components/VehicleCard';
import PaymentMethodPicker, { type PaymentMethodValue } from '@/components/PaymentMethodPicker';
import { useSeo } from '@/hooks/useSeo';

export default function VehicleDetail() {
  const [, params] = useRoute('/vehicle/:id');
  const vehicleId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [inspectionDays, setInspectionDays] = useState('3');
  const [paymentPref, setPaymentPref] = useState<PaymentMethodValue>({ buyerPaymentMethod: 'bank' });

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
  });

  const v = data?.vehicle;
  const seoTitle = v
    ? `${v.year ?? ''} ${v.make ?? ''} ${v.model ?? ''}`.trim() || 'Vehicle Detail'
    : 'Vehicle Detail';
  const seoDescription = v
    ? `${seoTitle} — ${v.price ? `$${Number(v.price).toLocaleString()}` : 'Price on request'}. Verified, inspection-backed, escrow-protected at AutoPro.`
    : 'A curated vehicle listing at AutoPro — verified, inspection-backed, escrow-protected.';
  const seoImage =
    data?.images?.find((i: any) => i.isPrimary)?.imageUrl ||
    data?.images?.[0]?.imageUrl;

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage,
    type: 'product',
  });

  const { data: similarData } = useQuery<{ vehicles: any[] }>({
    queryKey: [`/api/vehicles?category=${encodeURIComponent(v?.category ?? '')}`],
    enabled: !!v?.category,
  });

  const similarVehicles = (similarData?.vehicles || [])
    .filter((sv: any) => sv.id !== vehicleId && sv.available)
    .slice(0, 3);

  // Sticky reserve bar appears once user scrolls past hero
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lightbox keyboard nav
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, data?.images]);

  const purchaseMutation = useMutation({
    mutationFn: async (purchaseData: any) => {
      const response = await apiRequest('POST', '/api/transactions', purchaseData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('vehicleDetail.purchase.successTitle'),
        description: t('vehicleDetail.purchase.successDesc'),
      });
      setPurchaseDialogOpen(false);
      if (data.guestToken) setLocation(`/track/${data.guestToken}`);
      else if (data.transaction?.id) setLocation(`/track/${data.transaction.id}`);
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const handlePurchase = () => {
    if (!vehicleId || !buyerName || !buyerEmail || !buyerPhone || !shippingAddress) {
      toast({
        title: t('vehicleDetail.purchase.missingTitle'),
        description: t('vehicleDetail.purchase.missingDesc'),
        variant: 'destructive',
      });
      return;
    }
    purchaseMutation.mutate({
      vehicleId,
      buyerName,
      buyerEmail,
      buyerPhone,
      shippingAddress,
      amount: data?.vehicle?.price || '0',
      inspectionDays: parseInt(inspectionDays),
      buyerPaymentMethod: paymentPref.buyerPaymentMethod,
      buyerPreferredCoin: paymentPref.buyerPreferredCoin || null,
      buyerPreferredNetwork: paymentPref.buyerPreferredNetwork || null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">{t('vehicleDetail.loading')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.vehicle) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground mb-4">{t('vehicleDetail.notFound')}</p>
          <Button onClick={() => setLocation('/')}>{t('vehicleDetail.backHome')}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const vehicle = data.vehicle;
  const images: any[] = data.images || [];
  const offer = data.offer;
  const sortedImages = [...images].sort((a, b) =>
    a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
  );
  const activeImage = sortedImages[activeImageIdx] || sortedImages[0];

  const nextImage = () =>
    setActiveImageIdx((i) => (sortedImages.length ? (i + 1) % sortedImages.length : 0));
  const prevImage = () =>
    setActiveImageIdx((i) =>
      sortedImages.length ? (i - 1 + sortedImages.length) % sortedImages.length : 0
    );

  const displayedPrice = offer
    ? parseFloat(offer.discountedPrice)
    : parseFloat(vehicle.price);

  const specs: { label: string; key: string; value: string | number | null | undefined }[] = [
    { label: t('vehicleDetail.specs.year'), key: 'year', value: vehicle.year },
    { label: t('vehicleDetail.specs.condition'), key: 'condition', value: vehicle.condition },
    { label: t('vehicleDetail.specs.make'), key: 'make', value: vehicle.make },
    { label: t('vehicleDetail.specs.model'), key: 'model', value: vehicle.model },
    { label: t('vehicleDetail.specs.color'), key: 'color', value: vehicle.color },
    { label: t('vehicleDetail.specs.transmission'), key: 'transmission', value: vehicle.transmission },
    { label: t('vehicleDetail.specs.mileage'), key: 'mileage', value: vehicle.mileage ? t('vehicleDetail.specs.miles', { count: vehicle.mileage }) : null },
    { label: t('vehicleDetail.specs.topSpeed'), key: 'topSpeed', value: vehicle.topSpeed },
  ].filter((s) => s.value !== null && s.value !== undefined && s.value !== '');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation('/inventory')}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('vehicleDetail.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Left: Gallery */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => sortedImages.length && setLightboxOpen(true)}
              className="block w-full aspect-square bg-white rounded-md p-6 border overflow-hidden group relative"
              data-testid="button-open-lightbox"
              aria-label={t('vehicleDetail.openGallery')}
            >
              <img
                src={activeImage?.imageUrl || '/placeholder-car.png'}
                alt={vehicle.name}
                className="w-full h-full object-contain transition-transform group-hover:scale-[1.02]"
                data-testid="img-vehicle"
              />
              {sortedImages.length > 1 && (
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-xs font-medium px-2.5 py-1">
                  {activeImageIdx + 1} / {sortedImages.length}
                </span>
              )}
            </button>

            {sortedImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {sortedImages.map((image: any, idx: number) => (
                  <button
                    key={image.id ?? idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square bg-white rounded-md p-1 border overflow-hidden ${
                      idx === activeImageIdx
                        ? 'ring-2 ring-primary'
                        : 'hover-elevate'
                    }`}
                    data-testid={`button-thumb-${idx}`}
                    aria-label={t('vehicleDetail.showImage', { n: idx + 1 })}
                  >
                    <img
                      src={image.imageUrl}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant={vehicle.condition === 'new' ? 'default' : 'secondary'}>
                  {vehicle.condition}
                </Badge>
                {vehicle.featured && <Badge variant="default">{t('vehicleDetail.featured')}</Badge>}
                {!vehicle.available && <Badge variant="destructive">{t('vehicleDetail.sold')}</Badge>}
                <Badge variant="secondary" className="gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {t('vehicleDetail.escrowProtected')}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-1" data-testid="text-name">
                {vehicle.name}
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-make-model">
                {vehicle.make} {vehicle.model} • {vehicle.year}
              </p>
            </div>

            <div className="border-t border-border pt-5">
              {offer ? (
                <div>
                  <p className="text-xl text-muted-foreground line-through">
                    ${parseFloat(offer.originalPrice).toLocaleString()}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-primary" data-testid="text-price">
                      ${displayedPrice.toLocaleString()}
                    </p>
                    <Badge variant="destructive">{t('vehicleDetail.sale')}</Badge>
                  </div>
                  {offer.offerText && (
                    <p className="text-sm text-muted-foreground mt-2">{offer.offerText}</p>
                  )}
                </div>
              ) : (
                <p className="text-4xl font-bold" data-testid="text-price">
                  ${displayedPrice.toLocaleString()}
                </p>
              )}
            </div>

            {/* Spec table */}
            <Card>
              <CardContent className="p-0">
                <div className="px-6 pt-5 pb-3">
                  <h3 className="font-semibold text-base">{t('vehicleDetail.specifications')}</h3>
                </div>
                <dl className="divide-y divide-border border-t border-border" data-testid="spec-table">
                  {specs.map((s) => (
                    <div
                      key={s.label}
                      className="grid grid-cols-3 gap-4 px-6 py-3 text-sm"
                      data-testid={`spec-row-${s.key}`}
                    >
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="col-span-2 font-medium capitalize">{String(s.value)}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {vehicle.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">{t('vehicleDetail.description')}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {vehicle.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reassurance row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { Icon: ShieldCheck, label: t('vehicleDetail.reassurance.escrow') },
                { Icon: ClipboardCheck, label: t('vehicleDetail.reassurance.inspection') },
                { Icon: Truck, label: t('vehicleDetail.reassurance.transport') },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setPurchaseDialogOpen(true)}
                disabled={!vehicle.available}
                data-testid="button-purchase"
              >
                {vehicle.available ? t('vehicleDetail.reserve') : t('vehicleDetail.soldOut')}
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-contact">
                <Link href="/contact">{t('vehicleDetail.askQuestion')}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Similar vehicles */}
        {similarVehicles.length > 0 && (
          <section className="mt-16" data-testid="section-similar">
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                  {t('vehicleDetail.continueBrowsing')}
                </p>
                <h2 className="text-2xl md:text-3xl font-heading font-bold">
                  {t('vehicleDetail.similarVehicles')}
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/inventory?category=${vehicle.category}`}>{t('vehicleDetail.viewAll')}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarVehicles.map((sv: any) => {
                const img = sv.image || sv.imageUrl || '/placeholder-car.png';
                return (
                  <VehicleCard
                    key={sv.id}
                    id={sv.id}
                    name={sv.name}
                    image={img}
                    price={parseFloat(sv.price)}
                    rating={5}
                    ratingCount={0}
                    condition={sv.condition === 'new' ? 'New' : 'Used'}
                    year={sv.year}
                    transmission={sv.transmission}
                    color={sv.color}
                    topSpeed={sv.topSpeed || ''}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />

      {/* Sticky Reserve Bar */}
      {showStickyBar && vehicle.available && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg"
          data-testid="sticky-reserve-bar"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{vehicle.name}</p>
              <p className="text-base font-bold text-primary">
                ${displayedPrice.toLocaleString()}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setPurchaseDialogOpen(true)}
              data-testid="button-sticky-reserve"
            >
              {t('vehicleDetail.reserve')}
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-5xl p-0 bg-black border-0"
          data-testid="lightbox"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{vehicle.name} — {t('vehicleDetail.imageOf', { a: activeImageIdx + 1, b: sortedImages.length })}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            <img
              src={activeImage?.imageUrl || '/placeholder-car.png'}
              alt={vehicle.name}
              className="max-w-full max-h-full object-contain"
              data-testid="img-lightbox"
            />
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white hover:bg-white/25"
              aria-label={t('vehicleDetail.close')}
              data-testid="button-lightbox-close"
            >
              <X className="w-5 h-5" />
            </button>
            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                  aria-label={t('vehicleDetail.previousImage')}
                  data-testid="button-lightbox-prev"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                  aria-label={t('vehicleDetail.nextImage')}
                  data-testid="button-lightbox-next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-white/15 text-white text-xs font-medium px-3 py-1">
                  {t('vehicleDetail.imageOf', { a: activeImageIdx + 1, b: sortedImages.length })}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('vehicleDetail.purchase.title', { name: vehicle.name })}</DialogTitle>
            <DialogDescription>
              {t('vehicleDetail.purchase.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {t('vehicleDetail.purchase.howItWorks')}
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>{t('vehicleDetail.purchase.step1')}</li>
                <li>{t('vehicleDetail.purchase.step2')}</li>
                <li>{t('vehicleDetail.purchase.step3')}</li>
                <li>{t('vehicleDetail.purchase.step4')}</li>
                <li>{t('vehicleDetail.purchase.step5')}</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">{t('vehicleDetail.purchase.fullName')}</Label>
                <Input
                  id="buyerName"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder={t('vehicleDetail.purchase.fullNamePh')}
                  data-testid="input-buyer-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerPhone">{t('vehicleDetail.purchase.phone')}</Label>
                <Input
                  id="buyerPhone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder={t('vehicleDetail.purchase.phonePh')}
                  data-testid="input-buyer-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">{t('vehicleDetail.purchase.email')}</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder={t('vehicleDetail.purchase.emailPh')}
                data-testid="input-buyer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">{t('vehicleDetail.purchase.shippingAddress')}</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder={t('vehicleDetail.purchase.shippingAddressPh')}
                data-testid="input-shipping-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspectionDays">{t('vehicleDetail.purchase.inspectionPeriod')}</Label>
              <Select value={inspectionDays} onValueChange={setInspectionDays}>
                <SelectTrigger data-testid="select-inspection-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('vehicleDetail.purchase.day1')}</SelectItem>
                  <SelectItem value="2">{t('vehicleDetail.purchase.day2')}</SelectItem>
                  <SelectItem value="3">{t('vehicleDetail.purchase.day3')}</SelectItem>
                  <SelectItem value="4">{t('vehicleDetail.purchase.day4')}</SelectItem>
                  <SelectItem value="5">{t('vehicleDetail.purchase.day5')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <PaymentMethodPicker value={paymentPref} onChange={setPaymentPref} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
              data-testid="button-cancel-purchase"
            >
              {t('vehicleDetail.purchase.cancel')}
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              data-testid="button-submit-purchase"
            >
              {purchaseMutation.isPending ? t('vehicleDetail.purchase.processing') : t('vehicleDetail.purchase.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
