import { useState } from 'react';
import { Link } from 'wouter';
import { Shield, CheckCircle, Clock, Lock, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Escrow() {
  const [trackingInput, setTrackingInput] = useState('');

  const handleTrackTransaction = () => {
    if (trackingInput.trim()) {
      window.location.href = `/track/${trackingInput.trim()}`;
    }
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
                <Link href="/">Browse Vehicles</Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <a href="#how-it-works">Learn How It Works</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Track Transaction Section */}
      <div className="py-12 bg-muted">
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
                    <h3 className="font-semibold mb-2">Select Vehicle</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse our inventory and select the vehicle you want to purchase.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Initiate Escrow</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill out the purchase form with your details and inspection period preference.
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
                      Receive bank details and transfer funds to our secure escrow account.
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
                      Inspect the vehicle for 1-5 days (your choice) to ensure it meets expectations.
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
                            Contact our admin team to list your vehicle in our inventory with photos and details.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">2. Wait for Buyer</h3>
                          <p className="text-sm text-muted-foreground">
                            When a buyer initiates escrow for your vehicle, we'll notify you and hold the funds securely.
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
                            Once the buyer approves, we release the full payment to you. Safe, secure, guaranteed.
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
            Browse our premium vehicle inventory and buy with complete confidence using our escrow service.
          </p>
          <Button size="lg" variant="secondary" asChild data-testid="button-start-browsing">
            <Link href="/">Start Browsing Vehicles</Link>
          </Button>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my payment information secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! We use bank-level security and never store your payment information. 
                  All bank details are password-protected and encrypted.
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
