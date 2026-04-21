import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCw } from 'lucide-react';

const LAST_UPDATED = 'April 21, 2026';

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'overview',
    title: '1. Overview',
    body: (
      <>
        <p>
          This Refund &amp; Dispute Policy explains when buyers can recover funds held in escrow,
          when sellers are entitled to payment, and how AutoPro handles disputes. It supplements
          our{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and applies to every transaction processed through the AutoPro escrow.
        </p>
        <p>
          Because each transaction involves a real, titled vehicle, our policy is intentionally
          stricter than a general e-commerce return policy. Please read it carefully before funding
          an escrow.
        </p>
      </>
    ),
  },
  {
    id: 'inspection-window',
    title: '2. Inspection Window',
    body: (
      <>
        <p>
          When a vehicle is delivered, the buyer has an <strong>inspection window of 3 business
          days</strong> (unless a different period is stated on the transaction page) to inspect
          the vehicle and either:
        </p>
        <ul>
          <li>
            <strong>Accept</strong> — release the funds to the seller; or
          </li>
          <li>
            <strong>Reject</strong> — open a dispute with documented evidence of why the vehicle
            does not match the listing.
          </li>
        </ul>
        <p>
          If the buyer takes no action within the inspection window, the funds are automatically
          released to the seller.
        </p>
      </>
    ),
  },
  {
    id: 'eligible-refunds',
    title: '3. When a Refund Is Available',
    body: (
      <>
        <p>A buyer is generally eligible for a full refund of the purchase price when:</p>
        <ul>
          <li>The seller fails to ship the vehicle within the agreed timeframe;</li>
          <li>
            The vehicle is materially different from the listing (wrong make, model, year, VIN,
            mileage off by more than the stated tolerance, undisclosed major mechanical or
            structural damage, undisclosed salvage/branded title);
          </li>
          <li>The vehicle has an undisclosed lien or unclear title that prevents transfer;</li>
          <li>
            The transaction is cancelled by mutual written agreement of both buyer and seller
            before the vehicle ships.
          </li>
        </ul>
        <p>
          Refunds are processed back to the original payment method within{' '}
          <strong>5–10 business days</strong> after a successful dispute decision. Bank wire and
          cryptocurrency refunds may take longer depending on the receiving institution.
        </p>
      </>
    ),
  },
  {
    id: 'partial-refunds',
    title: '4. Partial Refunds',
    body: (
      <p>
        For minor undisclosed issues that do not justify cancelling the sale, AutoPro may broker a
        partial refund (price reduction) negotiated between buyer and seller. If both parties
        agree in writing, AutoPro will release the agreed reduced amount to the seller and refund
        the difference to the buyer.
      </p>
    ),
  },
  {
    id: 'non-refundable',
    title: '5. Non-Refundable Situations',
    body: (
      <>
        <p>Refunds will <strong>not</strong> be issued where:</p>
        <ul>
          <li>
            The buyer changes their mind, finds a better deal, or no longer wants the vehicle;
          </li>
          <li>The vehicle matches the listing and the buyer's accepted disclosures;</li>
          <li>
            The defect existed and was disclosed in writing, photos, or the inspection report
            before funding;
          </li>
          <li>
            Damage occurred after delivery, or the buyer modified the vehicle before raising the
            dispute;
          </li>
          <li>The dispute is opened after the inspection window has expired;</li>
          <li>The buyer refuses delivery without a documented reason.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'fees',
    title: '6. Fees & Third-Party Costs',
    body: (
      <>
        <p>
          AutoPro escrow service fees are <strong>non-refundable</strong> once the escrow has been
          funded, except where required by law or where the cancellation results from a verified
          failure caused by AutoPro itself.
        </p>
        <p>
          Third-party costs — such as bank wire fees, cryptocurrency network fees, shipping,
          inspection services booked by the buyer, taxes, and customs — are not refundable through
          AutoPro and must be recovered (where possible) directly from the relevant provider.
        </p>
      </>
    ),
  },
  {
    id: 'how-to-dispute',
    title: '7. How to Open a Dispute',
    body: (
      <>
        <p>To open a dispute, within the inspection window:</p>
        <ul>
          <li>
            Go to your transaction page and click <em>Open a Dispute</em>, or email{' '}
            <a href="mailto:disputes@autopro.com" className="text-primary hover:underline">
              disputes@autopro.com
            </a>{' '}
            with your transaction ID.
          </li>
          <li>
            Provide a clear written description of the issue and evidence: dated photos and
            videos, the carrier's bill of lading, an independent inspection report (highly
            recommended), and any messages exchanged with the seller.
          </li>
          <li>Do not modify, repair, or further use the vehicle while the dispute is pending.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'process',
    title: '8. Dispute Process',
    body: (
      <>
        <p>Once a dispute is opened:</p>
        <ul>
          <li>Funds remain frozen in escrow until a decision is reached;</li>
          <li>
            AutoPro contacts the seller for a written response, typically within 3 business days;
          </li>
          <li>
            We may request additional evidence, ask for an independent inspection, or propose
            mediation between the parties;
          </li>
          <li>
            We aim to issue a written decision within <strong>10 business days</strong> of
            receiving complete evidence from both sides;
          </li>
          <li>
            If a refund is approved, the vehicle must be made available for return at the seller's
            cost before funds are released back to the buyer.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'seller-protection',
    title: '9. Seller Protection',
    body: (
      <p>
        Sellers who accurately represent their vehicle and ship promptly are protected. If a buyer
        opens a frivolous dispute, refuses delivery without cause, or attempts to use the
        inspection window to negotiate a lower price, AutoPro will release the full funds to the
        seller and may suspend the buyer's account.
      </p>
    ),
  },
  {
    id: 'fraud',
    title: '10. Fraud & Chargebacks',
    body: (
      <p>
        AutoPro investigates suspected fraud (stolen vehicles, washed titles, identity theft,
        payment fraud) and may freeze funds, reverse releases, and report to law enforcement.
        Initiating a chargeback or payment reversal outside this policy is a violation of our
        Terms and may result in account termination and legal action.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '11. Contact',
    body: (
      <p>
        Questions about a refund or dispute? Email{' '}
        <a href="mailto:disputes@autopro.com" className="text-primary hover:underline">
          disputes@autopro.com
        </a>{' '}
        or write to AutoPro, 123 Auto Drive, Car City, CA 90210, USA.
      </p>
    ),
  },
];

export default function Refunds() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1 mb-5">
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3" data-testid="text-refunds-title">
            Refund &amp; Dispute Policy
          </h1>
          <p className="text-white/70 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

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
