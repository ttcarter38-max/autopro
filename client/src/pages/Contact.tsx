import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useSeo } from '@/hooks/useSeo';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  useSeo({
    title: 'Contact AutoPro',
    description:
      'Reach the AutoPro team about a specific vehicle, a custom escrow deal, or any question about our invitation-only marketplace.',
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const res = await apiRequest('POST', '/api/contact', data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send your message. Please try again or reach us via WhatsApp.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <div className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase mb-4">GET IN TOUCH</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4" data-testid="text-contact-title">
            Contact Us
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Have a question about a vehicle, our escrow service, or anything else? We're here to help.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6">Our Information</h2>
              </div>

              <Card>
                <CardContent className="pt-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-sm text-muted-foreground">123 Auto Drive<br />Los Angeles, CA 90001<br />United States</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Mon–Fri, 9am–6pm PST</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">info@autopro.com</p>
                    <p className="text-sm text-muted-foreground">support@autopro.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-sm text-muted-foreground">Monday – Friday: 9am – 6pm</p>
                    <p className="text-sm text-muted-foreground">Saturday: 10am – 4pm</p>
                    <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <Card>
                  <CardContent className="pt-12 pb-12 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold" data-testid="text-contact-success">Message Sent!</h2>
                    <p className="text-muted-foreground max-w-md">
                      Thank you for reaching out. We've received your message and will get back to you within 1 business day.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      data-testid="button-send-another"
                    >
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-8">
                    <h2 className="text-2xl font-heading font-bold mb-6">Send Us a Message</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Smith" data-testid="input-contact-name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" data-testid="input-contact-email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+1 (555) 123-4567" data-testid="input-contact-phone" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-contact-subject">
                                      <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="vehicle-inquiry">Vehicle Inquiry</SelectItem>
                                    <SelectItem value="escrow-question">Escrow Question</SelectItem>
                                    <SelectItem value="test-drive">Schedule a Test Drive</SelectItem>
                                    <SelectItem value="financing">Financing Options</SelectItem>
                                    <SelectItem value="sell-vehicle">Sell My Vehicle</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us how we can help you..."
                                  className="min-h-36"
                                  data-testid="input-contact-message"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={contactMutation.isPending}
                          data-testid="button-contact-submit"
                        >
                          {contactMutation.isPending ? (
                            'Sending...'
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
