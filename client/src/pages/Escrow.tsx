import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, CheckCircle, Clock, Lock, FileText, Search, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import PaymentMethodPicker, { type PaymentMethodValue } from '@/components/PaymentMethodPicker';

const customEscrowSchema = z.object({
  vehicleDescription: z.string().min(10, 'Please provide a detailed vehicle description (at least 10 characters)'),
  price: z.string().min(1, 'Price is required'),
  buyerName: z.string().min(2, 'Your name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerPhone: z.string().min(10, 'Valid phone number is required'),
  shippingAddress: z.string().min(10, 'Complete shipping address is required'),
  inspectionDays: z.string().min(1, 'Please select an inspection period'),
  sellerEmail: z.string().email('Valid seller email is required').optional().or(z.literal('')),
  sellerName: z.string().optional(),
});

type CustomEscrowForm = z.infer<typeof customEscrowSchema>;

export default function Escrow() {
  const [trackingInput, setTrackingInput] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentPref, setPaymentPref] = useState<PaymentMethodValue>({ buyerPaymentMethod: 'bank' });

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
        title: 'Escrow Transaction Initiated!',
        description: `Your transaction ID is ${data.id}. Check your email for details.`,
      });
      form.reset();
      // Redirect to tracking page
      setLocation(`/track/${data.guestToken}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create escrow transaction',
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
              Secure Vehicle Escrow Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Buy with confidence. Our escrow service protects both buyers and sellers throughout the entire vehicle transaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-browse-vehicles">
                <Link href="/">Browse Dealership Vehicles</Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-start-custom-escrow">
                <a href="#start-escrow">Start Custom Escrow</a>
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
              How Escrow Works
            </h2>
            <p className="text-xl text-muted-foreground">
              A simple, secure 7-step process that protects your purchase
            </p>
          </div>

          <Tabs defaultValue="buyer" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="buyer" data-testid="tab-buyer">For Buyers</TabsTrigger>
              <TabsTrigger value="seller" data-testid="tab-seller">For Sellers</TabsTrigger>
            </TabsList>

            <TabsContent value="buyer">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Start Escrow</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse dealership inventory or start a custom escrow for private sales.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Submit Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out vehicle description, price, delivery details, and inspection period.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Admin Approval</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team reviews and approves your transaction within 24 hours.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">4</span>
                    </div>
                    <h3 className="font-semibold mb-2">Secure Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive bank details via email and transfer funds to our escrow account.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">5</span>
                    </div>
                    <h3 className="font-semibold mb-2">Vehicle Shipping</h3>
                    <p className="text-sm text-muted-foreground">
                      Once payment is confirmed, the vehicle is shipped to your address.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">6</span>
                    </div>
                    <h3 className="font-semibold mb-2">Inspection Period</h3>
                    <p className="text-sm text-muted-foreground">
                      Inspect the vehicle for your selected period (1-5 days) to ensure satisfaction.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Approve Purchase</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact us to approve the purchase if you're satisfied with the vehicle.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Payment Released</h3>
                    <p className="text-sm text-muted-foreground">
                      We release payment to the seller and the transaction is complete.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seller">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">1. List Your Vehicle</h3>
                          <p className="text-sm text-muted-foreground">
                            Contact our admin team to list your vehicle in our inventory, or the buyer can create a custom escrow with your details.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">2. Buyer Initiates Escrow</h3>
                          <p className="text-sm text-muted-foreground">
                            When a buyer starts escrow, you'll receive an email notification. Funds are held securely.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">3. Vehicle Inspection</h3>
                          <p className="text-sm text-muted-foreground">
                            After shipping, the buyer inspects the vehicle. Your payment is protected in escrow during this time.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">4. Receive Payment</h3>
                          <p className="text-sm text-muted-foreground">
                            Once the buyer approves, we release the full payment to you via email notification. Safe, secure, guaranteed.
                          </p>
                        </div>
                      </div>
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
              Start a Custom Escrow Transaction
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Buying or selling a vehicle privately? Use our secure escrow service to protect both parties.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Escrow Transaction Details</CardTitle>
              <CardDescription>
                Fill out this form to initiate a secure escrow transaction. Both buyer and seller will receive email notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Vehicle Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Vehicle Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="vehicleDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 2020 Honda Civic EX, Blue, 45,000 miles, automatic transmission..."
                              className="min-h-24"
                              data-testid="input-vehicle-description"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide detailed information about the vehicle being purchased
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
                          <FormLabel>Purchase Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="25000"
                              data-testid="input-price"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Buyer Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Buyer Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="buyerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Smith"
                              data-testid="input-buyer-name"
                              {...field}
                            />
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
                            <FormLabel>Your Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                data-testid="input-buyer-email"
                                {...field}
                              />
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
                            <FormLabel>Your Phone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="(555) 123-4567"
                                data-testid="input-buyer-phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Seller Information (Optional) */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Seller Information (Optional)</h3>
                    <p className="text-sm text-muted-foreground">
                      If you're buying from a private seller, provide their contact information. They'll be notified via email.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sellerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seller Name (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jane Doe"
                                data-testid="input-seller-name"
                                {...field}
                              />
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
                            <FormLabel>Seller Email (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="seller@example.com"
                                data-testid="input-seller-email"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Seller will receive email notifications about the transaction
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Delivery Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Main St, Apt 4B, New York, NY 10001"
                              className="min-h-20"
                              data-testid="input-shipping-address"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Complete address where the vehicle will be delivered
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
                          <FormLabel>Inspection Period</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-inspection-days">
                                <SelectValue placeholder="Select inspection period" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 Day</SelectItem>
                              <SelectItem value="2">2 Days</SelectItem>
                              <SelectItem value="3">3 Days (Recommended)</SelectItem>
                              <SelectItem value="4">4 Days</SelectItem>
                              <SelectItem value="5">5 Days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Time period to inspect the vehicle after delivery
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Payment Method Preference */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Payment Preference</h3>
                    <PaymentMethodPicker value={paymentPref} onChange={setPaymentPref} />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={createCustomEscrowMutation.isPending}
                    data-testid="button-submit-escrow"
                  >
                    {createCustomEscrowMutation.isPending ? 'Creating Transaction...' : 'Start Secure Escrow Transaction'}
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
                Track Your Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Enter your transaction ID or tracking token to view the status of your escrow purchase.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Transaction ID or Token"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrackTransaction()}
                  data-testid="input-track-transaction"
                />
                <Button onClick={handleTrackTransaction} data-testid="button-track">
                  Track
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
              Why Choose Our Escrow Service?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>100% Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your funds are held in a secure escrow account until you approve the vehicle. No risk, complete protection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Flexible Inspection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose 1-5 day inspection period based on your needs. Take your time to ensure the vehicle is perfect.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Simple Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No complicated paperwork. We handle everything from payment processing to transaction tracking.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Start Your Secure Purchase?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our premium vehicle inventory or start a custom escrow transaction for private sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-start-browsing">
              <Link href="/">Browse Dealership Vehicles</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
              <a href="#start-escrow">Start Custom Escrow</a>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is escrow?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Escrow is a secure third-party service that holds your payment until you receive and approve the vehicle. 
                  This protects both buyers and sellers by ensuring the transaction is fair and secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I use escrow for private sales?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can start a custom escrow transaction for any vehicle purchase, whether from our dealership or a private seller. 
                  Both parties will receive email notifications throughout the process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does the process take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Typically 5-10 business days from payment to delivery, plus your chosen inspection period (1-5 days). 
                  We'll keep you updated at every step of the process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if I'm not satisfied with the vehicle?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  During your inspection period, you can report any issues. If the vehicle doesn't match the description or has undisclosed problems, 
                  we can cancel the transaction and return your payment in full.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">
            Have Questions?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our escrow specialists are here to help you through every step of the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              Call: 1-800-CAR-DEAL
            </Button>
            <Button variant="outline" size="lg">
              Email: escrow@autopro.com
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
