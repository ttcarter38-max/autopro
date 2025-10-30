import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function VehicleDetail() {
  const [, params] = useRoute('/vehicle/:id');
  const vehicleId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [inspectionDays, setInspectionDays] = useState('3');

  const { data, isLoading } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (purchaseData: any) => {
      const response = await apiRequest('POST', '/api/transactions', purchaseData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Purchase Initiated!',
        description: 'We have received your request. You will be contacted shortly with payment details.',
      });
      setPurchaseDialogOpen(false);
      
      // Redirect to tracking page
      if (data.guestToken) {
        setLocation(`/track/${data.guestToken}`);
      } else if (data.transaction?.id) {
        setLocation(`/track/${data.transaction.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePurchase = () => {
    if (!vehicleId || !buyerName || !buyerEmail || !buyerPhone || !shippingAddress) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
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
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading vehicle details...</p>
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
          <p className="text-muted-foreground mb-4">Vehicle not found</p>
          <Button onClick={() => setLocation('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const vehicle = data.vehicle;
  const images = data.images || [];
  const offer = data.offer;
  const primaryImage = images.find((img: any) => img.isPrimary) || images[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-md p-8 border">
              <img
                src={primaryImage?.imageUrl || '/placeholder-car.png'}
                alt={vehicle.name}
                className="w-full h-full object-contain"
                data-testid="img-vehicle"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((image: any) => (
                  <div key={image.id} className="aspect-square bg-white rounded-md p-2 border">
                    <img
                      src={image.imageUrl}
                      alt="Vehicle"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={vehicle.condition === 'new' ? 'default' : 'secondary'}>
                  {vehicle.condition}
                </Badge>
                {vehicle.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {!vehicle.available && (
                  <Badge variant="destructive">Sold</Badge>
                )}
              </div>
              <h1 className="text-4xl font-heading font-bold mb-2" data-testid="text-name">
                {vehicle.name}
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-make-model">
                {vehicle.make} {vehicle.model} • {vehicle.year}
              </p>
            </div>

            <div className="border-t pt-6">
              {offer && (
                <div className="mb-4">
                  <p className="text-2xl text-muted-foreground line-through">
                    ${parseFloat(offer.originalPrice).toLocaleString()}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-primary" data-testid="text-price">
                      ${parseFloat(offer.discountedPrice).toLocaleString()}
                    </p>
                    <Badge variant="destructive">SALE</Badge>
                  </div>
                  {offer.offerText && (
                    <p className="text-sm text-muted-foreground mt-2">{offer.offerText}</p>
                  )}
                </div>
              )}
              {!offer && (
                <p className="text-4xl font-bold" data-testid="text-price">
                  ${parseFloat(vehicle.price).toLocaleString()}
                </p>
              )}
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-medium">{vehicle.transmission}</p>
                  </div>
                  {vehicle.mileage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-medium">{vehicle.mileage.toLocaleString()} miles</p>
                    </div>
                  )}
                  {vehicle.topSpeed && (
                    <div>
                      <p className="text-sm text-muted-foreground">Top Speed</p>
                      <p className="font-medium">{vehicle.topSpeed}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {vehicle.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{vehicle.description}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => setPurchaseDialogOpen(true)}
                disabled={!vehicle.available}
                data-testid="button-purchase"
              >
                {vehicle.available ? 'Purchase with Escrow' : 'Sold Out'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Contact Us",
                    description: "Call us at 1-800-CAR-DEAL or email info@autopro.com for more information.",
                  });
                }}
                data-testid="button-contact"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase {vehicle.name}</DialogTitle>
            <DialogDescription>
              Complete this form to initiate the secure escrow purchase process
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How Escrow Works:
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Submit your information below</li>
                <li>We'll send you secure payment instructions</li>
                <li>Vehicle ships after payment confirmation</li>
                <li>You inspect the vehicle (1-5 days of your choice)</li>
                <li>Approve purchase, and we release payment to seller</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Full Name *</Label>
                <Input
                  id="buyerName"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Doe"
                  data-testid="input-buyer-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerPhone">Phone *</Label>
                <Input
                  id="buyerPhone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  data-testid="input-buyer-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email *</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="john@example.com"
                data-testid="input-buyer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address *</Label>
              <Textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
                data-testid="input-shipping-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspectionDays">Inspection Period</Label>
              <Select value={inspectionDays} onValueChange={setInspectionDays}>
                <SelectTrigger data-testid="select-inspection-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="2">2 Days</SelectItem>
                  <SelectItem value="3">3 Days (Recommended)</SelectItem>
                  <SelectItem value="4">4 Days</SelectItem>
                  <SelectItem value="5">5 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPurchaseDialogOpen(false)}
              data-testid="button-cancel-purchase"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              data-testid="button-submit-purchase"
            >
              {purchaseMutation.isPending ? 'Processing...' : 'Initiate Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
