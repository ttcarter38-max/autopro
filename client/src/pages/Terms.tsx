import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Scale, Info } from 'lucide-react';
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
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: (
      <>
        <p>
          These Terms of Service ("Terms") govern your access to and use of the AutoPro website,
          dashboards, escrow services, and related features (collectively, the "Services") operated
          by AutoPro ("AutoPro", "we", "us", or "our"). By creating an account, listing a vehicle,
          submitting an offer, or otherwise using the Services, you agree to be bound by these
          Terms and our{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          If you are using the Services on behalf of an entity, you represent that you have
          authority to bind that entity to these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Accounts',
    body: (
      <>
        <p>
          You must be at least 18 years old and able to form a binding contract to use the
          Services. The AutoPro marketplace is curated and invitation-only; access to list vehicles
          or transact may be limited to approved users at our discretion.
        </p>
        <p>
          You are responsible for keeping your account credentials confidential and for all
          activity under your account. Notify us immediately of any unauthorized use.
        </p>
      </>
    ),
  },
  {
    id: 'role',
    title: '3. Our Role',
    body: (
      <>
        <p>
          AutoPro is a marketplace and escrow service. We do not own most of the vehicles listed on
          the Services and we are not a party to the underlying purchase agreement between buyer
          and seller. Unless we expressly state otherwise in writing, AutoPro acts as a neutral
          third-party custodian of funds during a transaction.
        </p>
        <p>
          Listings, descriptions, photos, and pricing are provided by sellers. While we verify and
          inspection-check items in our curated selection, we do not guarantee the accuracy or
          completeness of any listing.
        </p>
      </>
    ),
  },
  {
    id: 'escrow',
    title: '4. Escrow Process',
    body: (
      <>
        <p>The escrow process generally works as follows:</p>
        <ul>
          <li>
            <strong>Buyer pays AutoPro.</strong> The buyer transfers funds (bank wire,
            cryptocurrency, or other approved method) to a designated AutoPro escrow account.
          </li>
          <li>
            <strong>Funds are held.</strong> AutoPro holds the funds and notifies the seller to
            ship the vehicle.
          </li>
          <li>
            <strong>Inspection period.</strong> Upon delivery, the buyer has the agreed inspection
            window (typically 3 business days unless otherwise stated) to confirm the vehicle
            matches the listing.
          </li>
          <li>
            <strong>Release or dispute.</strong> If the buyer accepts, funds are released to the
            seller minus any applicable fees. If the buyer rejects within the inspection window,
            the dispute resolution process below applies.
          </li>
        </ul>
        <p>
          Specific timelines, fees, and refund mechanics for any individual transaction are set out
          in the transaction confirmation and prevail over the general description above.
        </p>
      </>
    ),
  },
  {
    id: 'fees',
    title: '5. Fees',
    body: (
      <p>
        AutoPro charges escrow and service fees, which are disclosed before you confirm a
        transaction. Fees are non-refundable once a transaction has begun, except where required by
        law or expressly stated. Third-party costs (wire transfer fees, shipping, taxes, customs)
        are your responsibility.
      </p>
    ),
  },
  {
    id: 'seller-obligations',
    title: '6. Seller Obligations',
    body: (
      <>
        <p>If you list a vehicle on the Services, you represent and warrant that:</p>
        <ul>
          <li>You are the lawful owner of the vehicle and have the right to sell it;</li>
          <li>The vehicle has clear, transferable title and is free of undisclosed liens;</li>
          <li>All information, photos, and disclosures are accurate and not misleading;</li>
          <li>You will ship the vehicle promptly after escrow funding using the agreed carrier;</li>
          <li>You will provide all documents needed to transfer title to the buyer.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'buyer-obligations',
    title: '7. Buyer Obligations',
    body: (
      <>
        <p>If you purchase through the Services, you agree to:</p>
        <ul>
          <li>Fund the escrow promptly using one of the approved payment methods;</li>
          <li>
            Inspect the vehicle on delivery and either accept or raise a dispute within the
            inspection window;
          </li>
          <li>Comply with applicable registration, titling, import, and tax requirements;</li>
          <li>Not use the Services for fraudulent, illegal, or money-laundering purposes.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'prohibited',
    title: '8. Prohibited Conduct',
    body: (
      <>
        <p>You may not:</p>
        <ul>
          <li>List stolen, fraudulent, or misrepresented vehicles;</li>
          <li>Transact outside the escrow once a deal has been initiated through the Services;</li>
          <li>Attempt to circumvent fees, identity verification, or anti-fraud controls;</li>
          <li>Upload viruses, scrape the Services, or interfere with their operation;</li>
          <li>Harass, threaten, or defraud other users or our staff.</li>
        </ul>
        <p>
          We may suspend or terminate any account, cancel transactions, and report to authorities
          where we reasonably believe these Terms or applicable law have been violated.
        </p>
      </>
    ),
  },
  {
    id: 'disputes',
    title: '9. Dispute Resolution',
    body: (
      <p>
        If a buyer and seller cannot resolve a transaction issue, either party may submit a dispute
        to AutoPro within the inspection window. We will review the listing, communications, and
        any evidence submitted, and issue a good-faith decision. Funds may be held until the
        dispute is resolved. Our decision regarding the release of escrowed funds is final between
        the parties for purposes of the escrow but does not limit either party's other legal
        remedies.
      </p>
    ),
  },
  {
    id: 'ip',
    title: '10. Intellectual Property',
    body: (
      <p>
        AutoPro and its licensors own all rights in the Services, including the website, software,
        branding, and content we create. You receive a limited, non-exclusive, non-transferable
        licence to use the Services for their intended purpose. By submitting content (such as
        listings, photos, or testimonials), you grant AutoPro a worldwide, royalty-free licence to
        host, display, and promote that content in connection with the Services.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: '11. Disclaimers',
    body: (
      <p>
        The Services are provided "as is" and "as available" without warranties of any kind,
        whether express or implied, including warranties of merchantability, fitness for a
        particular purpose, title, and non-infringement. AutoPro does not warrant that the
        Services will be uninterrupted, secure, or error-free, or that any vehicle will meet your
        expectations beyond the express written representations made in a listing.
      </p>
    ),
  },
  {
    id: 'liability',
    title: '12. Limitation of Liability',
    body: (
      <p>
        To the fullest extent permitted by law, AutoPro and its officers, directors, employees, and
        agents will not be liable for any indirect, incidental, special, consequential, or punitive
        damages, or any loss of profits, revenues, data, or goodwill, arising out of or related to
        your use of the Services. Our total cumulative liability for any claim relating to a
        transaction will not exceed the fees we received from you for that transaction.
      </p>
    ),
  },
  {
    id: 'indemnity',
    title: '13. Indemnification',
    body: (
      <p>
        You agree to indemnify and hold harmless AutoPro from any claims, damages, liabilities, and
        expenses (including reasonable legal fees) arising out of your use of the Services, your
        listings, your transactions, or your violation of these Terms or any law.
      </p>
    ),
  },
  {
    id: 'termination',
    title: '14. Termination',
    body: (
      <p>
        You may close your account at any time. We may suspend or terminate your access to the
        Services, with or without notice, if we reasonably believe you have violated these Terms or
        if required by law. Sections that by their nature should survive termination (such as fees,
        liability, indemnity, and dispute resolution) will continue to apply.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: '15. Governing Law',
    body: (
      <p>
        These Terms are governed by the laws of the State of California, USA, without regard to its
        conflict-of-law principles. Any dispute that cannot be resolved through escrow dispute
        resolution will be subject to the exclusive jurisdiction of the state and federal courts
        located in California.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '16. Changes to These Terms',
    body: (
      <p>
        We may update these Terms from time to time. When we do, we will revise the "Last updated"
        date at the top of this page. Material changes will be communicated by email or a prominent
        notice on the Services. Your continued use of the Services after the changes take effect
        constitutes your acceptance of the updated Terms.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '17. Contact',
    body: (
      <p>
        Questions about these Terms? Email{' '}
        <a href="mailto:legal@autopro.com" className="text-primary hover:underline">
          legal@autopro.com
        </a>{' '}
        or write to AutoPro, 123 Auto Drive, Car City, CA 90210, USA.
      </p>
    ),
  },
];

export default function Terms() {
  useSeo({
    title: 'Terms of Service',
    description:
      'The terms that govern your use of AutoPro’s invitation-only marketplace and escrow service, including buyer and seller responsibilities.',
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 mb-5">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3" data-testid="text-terms-title">
            Terms of Service
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
            For advice specific to your situation, please consult a qualified attorney before
            relying on these Terms in any commercial setting.
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
}
