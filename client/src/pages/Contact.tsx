import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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

export default function Contact() {
  const { t } = useTranslation();
  useSeo({
    title: 'Contact AutoPro',
    description:
      'Reach the AutoPro team about a specific vehicle, a custom escrow deal, or any question about our invitation-only marketplace.',
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const contactSchema = z.object({
    name: z.string().min(2, t('contact.errors.name')),
    email: z.string().email(t('contact.errors.email')),
    phone: z.string().optional(),
    subject: z.string().min(1, t('contact.errors.subject')),
    message: z.string().min(10, t('contact.errors.message')),
  });

  type ContactForm = z.infer<typeof contactSchema>;

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
        title: t('contact.errorTitle'),
        description: t('contact.errorText'),
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
          <p className="text-xs font-bold tracking-[0.25em] text-primary uppercase mb-4">{t('contact.eyebrow')}</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4" data-testid="text-contact-title">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact Info */}
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6 tracking-display">{t('contact.infoTitle')}</h2>
              </div>

              {[
                {
                  Icon: MapPin,
                  title: t('contact.locationTitle'),
                  lines: [t('contact.locationText')],
                  testid: 'card-contact-location',
                },
                {
                  Icon: Phone,
                  title: t('contact.phoneTitle'),
                  lines: [t('contact.phoneNumber'), t('contact.phoneHours')],
                  testid: 'card-contact-phone',
                },
                {
                  Icon: Mail,
                  title: t('contact.emailTitle'),
                  lines: ['info@autopro.com', 'support@autopro.com'],
                  testid: 'card-contact-email',
                },
                {
                  Icon: Clock,
                  title: t('contact.hoursTitle'),
                  lines: [t('contact.hoursWeekdays'), t('contact.hoursSaturday'), t('contact.hoursSunday')],
                  testid: 'card-contact-hours',
                },
              ].map(({ Icon, title, lines, testid }) => (
                <div
                  key={testid}
                  className="group relative rounded-md border border-card-border bg-gradient-to-br from-card via-card to-background p-6 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1 overflow-hidden flex gap-5 items-start"
                  data-testid={testid}
                >
                  <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden="true" />
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                    <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-[0_15px_35px_-12px_hsl(var(--primary)/0.5)] transition-transform duration-500 group-hover:scale-105">
                      <Icon className="w-6 h-6 text-primary" strokeWidth={1.6} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold mb-1.5 tracking-display">{title}</h3>
                    {lines.map((line, i) => (
                      <p key={i} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <Card>
                  <CardContent className="pt-12 pb-12 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold" data-testid="text-contact-success">{t('contact.successTitle')}</h2>
                    <p className="text-muted-foreground max-w-md">
                      {t('contact.successText')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      data-testid="button-send-another"
                    >
                      {t('contact.sendAnother')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-8">
                    <h2 className="text-2xl font-heading font-bold mb-6">{t('contact.formTitle')}</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('contact.fullName')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('contact.fullNamePh')} data-testid="input-contact-name" {...field} />
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
                                <FormLabel>{t('contact.email')}</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder={t('contact.emailPh')} data-testid="input-contact-email" {...field} />
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
                                <FormLabel>{t('contact.phone')}</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder={t('contact.phonePh')} data-testid="input-contact-phone" {...field} />
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
                                <FormLabel>{t('contact.subject')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-contact-subject">
                                      <SelectValue placeholder={t('contact.subjectPh')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="vehicle-inquiry">{t('contact.subjects.vehicleInquiry')}</SelectItem>
                                    <SelectItem value="escrow-question">{t('contact.subjects.escrowQuestion')}</SelectItem>
                                    <SelectItem value="test-drive">{t('contact.subjects.testDrive')}</SelectItem>
                                    <SelectItem value="financing">{t('contact.subjects.financing')}</SelectItem>
                                    <SelectItem value="sell-vehicle">{t('contact.subjects.sellVehicle')}</SelectItem>
                                    <SelectItem value="other">{t('contact.subjects.other')}</SelectItem>
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
                              <FormLabel>{t('contact.message')}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t('contact.messagePh')}
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
                            t('contact.sending')
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              {t('contact.send')}
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
