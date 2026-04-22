import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, Info } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { useTranslation } from 'react-i18next';

const LAST_UPDATED = 'April 21, 2026';

function EnglishOnlyBanner() {
  const { t, i18n } = useTranslation();
  if (i18n.language?.startsWith('en')) return null;
  return (
    <div className="bg-muted border-y border-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-2 text-sm text-muted-foreground" data-testid="banner-english-only">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>{t('legal.englishOnlyNote')}</p>
      </div>
    </div>
  );
}

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'overview',
    title: '1. Overview',
    body: (
      <>
        <p>
          AutoPro ("AutoPro", "we", "us", or "our") operates a curated, invitation-only vehicle
          marketplace and escrow service for cars, RVs, boats, motorcycles, and tractors. This
          Privacy Policy explains what information we collect, how we use it, and the choices you
          have. It applies to our website, dashboards, and any related services (the "Services").
        </p>
        <p>
          By using the Services you agree to the practices described here. If you do not agree,
          please do not use the Services.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    body: (
      <>
        <p>We collect the following categories of information:</p>
        <ul>
          <li>
            <strong>Account information.</strong> Name, email address, phone number, password
            (stored hashed), and account role (buyer, seller, admin).
          </li>
          <li>
            <strong>Transaction information.</strong> Vehicle details, purchase price, shipping
            address, escrow status, payment method selection, and timeline events related to each
            transaction.
          </li>
          <li>
            <strong>Communications.</strong> Messages you send through our contact forms,
            WhatsApp, email, or in-app chat with our team.
          </li>
          <li>
            <strong>Uploaded content.</strong> Photos of vehicles, identity or ownership documents,
            and customer testimonials submitted through admin tools.
          </li>
          <li>
            <strong>Technical data.</strong> IP address, browser type, device identifiers, pages
            visited, and approximate location, collected automatically through cookies and similar
            technologies.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> store full payment card numbers on our servers. Card and bank
          details are processed by our payment partners under their own privacy policies.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Operate the marketplace and process escrow transactions;</li>
          <li>Verify identity and prevent fraud, money laundering, and abuse;</li>
          <li>Communicate transaction updates, receipts, and important notices;</li>
          <li>Provide customer support and respond to your requests;</li>
          <li>Improve and personalize the Services;</li>
          <li>Comply with legal obligations and enforce our Terms of Service.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'sharing',
    title: '4. How We Share Information',
    body: (
      <>
        <p>We share information only when necessary, including with:</p>
        <ul>
          <li>
            <strong>Counterparties.</strong> Buyers and sellers see the information needed to
            complete the transaction (e.g. shipping address, contact details).
          </li>
          <li>
            <strong>Service providers.</strong> Payment processors, email delivery, cloud hosting,
            analytics, and shipping partners who act on our behalf.
          </li>
          <li>
            <strong>Legal &amp; safety.</strong> Law enforcement, regulators, or other parties when
            required by law, subpoena, or to protect rights, property, or safety.
          </li>
          <li>
            <strong>Business transfers.</strong> In connection with a merger, acquisition, or sale
            of assets, your information may be transferred to a successor entity.
          </li>
        </ul>
        <p>We do not sell your personal information.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking',
    body: (
      <p>
        We use cookies and similar technologies to keep you signed in, remember preferences, and
        understand how the Services are used. You can control cookies through your browser
        settings; disabling them may affect parts of the Services.
      </p>
    ),
  },
  {
    id: 'security',
    title: '6. Data Security',
    body: (
      <p>
        We use administrative, technical, and physical safeguards designed to protect your
        information, including encrypted connections (HTTPS), hashed passwords, role-based access
        controls for staff, and isolated escrow accounting. No system is perfectly secure; we
        cannot guarantee absolute security and you use the Services at your own risk.
      </p>
    ),
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    body: (
      <p>
        We retain personal information for as long as your account is active and as required to
        provide the Services, comply with our legal obligations (such as tax, accounting, and
        anti-fraud rules), resolve disputes, and enforce our agreements. Transaction records are
        typically retained for a minimum of seven (7) years.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: '8. Your Rights & Choices',
    body: (
      <>
        <p>Depending on where you live, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete the personal information we hold about you;</li>
          <li>Object to or restrict certain processing;</li>
          <li>Request a portable copy of your data;</li>
          <li>Withdraw consent (where processing is based on consent);</li>
          <li>Lodge a complaint with your local data-protection authority.</li>
        </ul>
        <p>
          To exercise these rights, email us at{' '}
          <a href="mailto:privacy@autopro.com" className="text-primary hover:underline">
            privacy@autopro.com
          </a>
          . We may need to verify your identity before responding.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: '9. Children',
    body: (
      <p>
        The Services are not directed to children under 18. We do not knowingly collect personal
        information from children. If you believe a child has provided us with personal
        information, please contact us so we can delete it.
      </p>
    ),
  },
  {
    id: 'international',
    title: '10. International Users',
    body: (
      <p>
        If you access the Services from outside the United States, you understand that your
        information may be processed and stored in the United States or other countries that may
        have different data-protection laws than your jurisdiction.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will revise the "Last
        updated" date at the top of this page. Material changes will be communicated by email or a
        prominent notice on the Services.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    body: (
      <p>
        Questions about this policy? Contact our privacy team at{' '}
        <a href="mailto:privacy@autopro.com" className="text-primary hover:underline">
          privacy@autopro.com
        </a>{' '}
        or write to AutoPro, 123 Auto Drive, Car City, CA 90210, USA.
      </p>
    ),
  },
];

export default function Privacy() {
  useSeo({
    title: 'Privacy Policy',
    description:
      'How AutoPro collects, uses, and protects your personal information across our invitation-only marketplace and escrow service.',
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3" data-testid="text-privacy-title">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <EnglishOnlyBanner />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">
              On this page
            </p>
            <nav className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`link-toc-${s.id}`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="space-y-10 text-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:mb-3">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24" data-testid={`section-${s.id}`}>
              <h2 className="text-2xl font-heading font-bold mb-4">{s.title}</h2>
              <div className="text-muted-foreground">{s.body}</div>
            </section>
          ))}

          <div className="border-t pt-6 text-xs text-muted-foreground">
            This document is provided for general information and does not constitute legal advice.
            For advice specific to your situation, please consult a qualified attorney.
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
}
