// Email sending — Resend (primary) with Gmail (fallback) via Replit connectors
import { Resend } from 'resend';
import { ReplitConnectors } from '@replit/connectors-sdk';

const connectors = new ReplitConnectors();
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_ADDRESS = process.env.RESEND_FROM || 'AutoPro Escrow <onboarding@resend.dev>';

function getBaseUrl(): string {
  // Priority: explicit override > Railway public domain > Replit domains > localhost fallback
  const explicit = process.env.APP_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railwayDomain) return `https://${railwayDomain}`;

  const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
  if (replitDomain) return `https://${replitDomain.split(',')[0]}`;

  console.warn('[email] No public domain detected — falling back to http://localhost:5000. Set APP_BASE_URL.');
  return 'http://localhost:5000';
}

interface EmailData { to: string; subject: string; html: string; }

function mimeEncodeSubject(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
}

function buildRawEmail(to: string, subject: string, html: string): string {
  const lines = [
    `To: ${to}`,
    `Subject: ${mimeEncodeSubject(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ];
  const raw = lines.join('\r\n');
  return Buffer.from(raw).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendViaGmail(data: EmailData): Promise<boolean> {
  try {
    const rawMessage = buildRawEmail(data.to, data.subject, data.html);
    const response = await connectors.proxy('google-mail', '/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: rawMessage }),
    });
    if (!response.ok) {
      const err = await response.text();
      console.error('Gmail send error:', err);
      return false;
    }
    const result = await response.json() as any;
    console.log(`Email sent via Gmail to ${data.to} (id: ${result.id})`);
    return true;
  } catch (err) {
    console.error('Failed to send email via Gmail:', err);
    return false;
  }
}

async function sendViaResend(data: EmailData): Promise<boolean> {
  if (!resend) return false;
  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
    if (result.error) {
      console.error('Resend send error:', result.error);
      return false;
    }
    console.log(`Email sent via Resend to ${data.to} (id: ${result.data?.id})`);
    return true;
  } catch (err) {
    console.error('Failed to send email via Resend:', err);
    return false;
  }
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  console.log(`[email] dispatch "${data.subject}" -> ${data.to}`);
  // Prefer Resend when configured; fall back to Gmail connector.
  if (resend) {
    const ok = await sendViaResend(data);
    if (ok) return true;
    console.warn('Resend failed — falling back to Gmail connector');
  }
  return sendViaGmail(data);
}

// ── Shared email wrapper ─────────────────────────────────────────────────────
function emailWrapper(content: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <div style="background:#111;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">AUTOPRO ESCROW</h1>
      </div>
      <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px;">
        ${content}
        <p style="margin-top:28px;font-size:14px;">Questions? Contact us:<br>
          <strong>Phone:</strong> 1-800-CAR-DEAL &nbsp;|&nbsp; <strong>Email:</strong> escrow@autopro.com
        </p>
        <p style="color:#999;font-size:11px;margin-top:28px;border-top:1px solid #e0e0e0;padding-top:16px;">
          Automated message from AutoPro Escrow Service. Do not reply to this email.
        </p>
      </div>
    </div>`;
}

function infoBox(rows: [string, string][]) {
  const cells = rows.map(([label, val]) =>
    `<p style="margin:6px 0;"><strong>${label}:</strong> ${val}</p>`).join('');
  return `<div style="background:#fff;border:1px solid #e0e0e0;padding:20px;border-radius:8px;margin:20px 0;">${cells}</div>`;
}

function ctaButton(text: string, href: string, color = '#c0392b') {
  return `
    <div style="text-align:center;margin:28px 0;">
      <a href="${href}" style="background:${color};color:#fff;padding:14px 36px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:15px;">${text}</a>
    </div>`;
}

// ── 1. Buyer: transaction initiated ──────────────────────────────────────────
export async function sendBuyerTransactionInitiated(transaction: {
  id: number; buyerName: string; buyerEmail: string; guestToken: string;
  customVehicleDescription?: string | null; amount: string; inspectionDays: number;
}) {
  const base = getBaseUrl();
  const vehicleInfo = transaction.customVehicleDescription || 'Vehicle from AutoPro';
  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">Escrow Transaction Initiated</h2>
    <p>Dear ${transaction.buyerName},</p>
    <p>Your escrow transaction has been successfully initiated. Here are your details:</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Vehicle', vehicleInfo],
      ['Amount', `$${parseFloat(transaction.amount).toLocaleString()}`],
      ['Inspection Period', `${transaction.inspectionDays} day${transaction.inspectionDays !== 1 ? 's' : ''}`],
    ])}
    <h3>What Happens Next</h3>
    <ol style="line-height:1.9;">
      <li>Our team reviews and approves your transaction within 24 hours</li>
      <li>You'll receive payment instructions (bank or crypto) by email</li>
      <li>Once payment is confirmed the vehicle ships to your address</li>
      <li>You'll have ${transaction.inspectionDays} day(s) to inspect</li>
    </ol>
    ${ctaButton('Track My Transaction', `${base}/track/${transaction.guestToken || transaction.id}`)}
    ${transaction.guestToken ? `<div style="background:#e8f4fd;border-left:4px solid #1976d2;padding:14px 18px;border-radius:4px;">
      <p style="margin:0;font-size:13px;"><strong>Tracking Token:</strong> ${transaction.guestToken}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#555;">Save this — you'll need it to track your transaction.</p>
    </div>` : `<div style="background:#e8f4fd;border-left:4px solid #1976d2;padding:14px 18px;border-radius:4px;">
      <p style="margin:0;font-size:13px;">You can also find this transaction anytime under <strong>My Transactions</strong> in your account.</p>
    </div>`}`);

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `Escrow Transaction #${transaction.id} Initiated — AutoPro`,
    html,
  });
}

// ── 2. Seller: new transaction (with Accept / Reject buttons) ─────────────────
export async function sendSellerTransactionNotification(transaction: {
  id: number; sellerName?: string | null; sellerEmail: string;
  sellerToken: string; buyerName: string;
  customVehicleDescription?: string | null; amount: string;
}) {
  const base = getBaseUrl();
  const sellerDisplay = transaction.sellerName || 'Seller';
  const vehicleInfo = transaction.customVehicleDescription || 'Your vehicle';
  const acceptUrl = `${base}/seller/${transaction.sellerToken}?action=accept`;
  const rejectUrl = `${base}/seller/${transaction.sellerToken}?action=reject`;

  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">A Buyer Has Started Escrow for Your Vehicle</h2>
    <p>Dear ${sellerDisplay},</p>
    <p>A buyer has initiated a secure escrow transaction for your vehicle through AutoPro. Please review the details and respond.</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Vehicle', vehicleInfo],
      ['Buyer', transaction.buyerName],
      ['Amount', `$${parseFloat(transaction.amount).toLocaleString()}`],
    ])}
    <p><strong>Please accept or reject this transaction:</strong></p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${acceptUrl}" style="background:#16a34a;color:#fff;padding:14px 30px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:15px;margin-right:12px;">
        ✓ Accept Transaction
      </a>
      <a href="${rejectUrl}" style="background:#dc2626;color:#fff;padding:14px 30px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:15px;">
        ✗ Reject Transaction
      </a>
    </div>
    <div style="background:#fff8e1;border:1px solid #ffc107;padding:14px 18px;border-radius:4px;margin-top:16px;">
      <p style="margin:0;font-size:13px;"><strong>Note:</strong> Each link can only be used once. If you have already responded, the link will confirm your previous action.</p>
    </div>
    <div style="background:#e8f5e9;border-left:4px solid #388e3c;padding:14px 18px;border-radius:4px;margin-top:16px;">
      <p style="margin:0;font-weight:bold;color:#1b5e20;">Your payment is fully protected in AutoPro's secure escrow account.</p>
    </div>`);

  return sendEmail({
    to: transaction.sellerEmail,
    subject: `New Escrow Transaction #${transaction.id} for Your Vehicle — AutoPro`,
    html,
  });
}

// ── 3. Buyer: payment instructions (bank or crypto) ──────────────────────────
export async function sendBuyerPaymentInstructions(transaction: {
  id: number; buyerName: string; buyerEmail: string; guestToken: string | null;
  amount: string; paymentMethod: string; bankInfo?: string | null;
  cryptoAddress?: string | null; cryptoCoin?: string | null;
}) {
  const base = getBaseUrl();
  const trackUrl = transaction.guestToken ? `${base}/track/${transaction.guestToken}` : `${base}/track/${transaction.id}`;

  let paymentSection = '';
  if (transaction.paymentMethod === 'crypto' && transaction.cryptoAddress) {
    paymentSection = `
      <div style="background:#fff8e1;border:2px solid #f59e0b;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#92400e;margin-top:0;">Crypto Payment Instructions</h3>
        <p style="margin:6px 0;"><strong>Coin:</strong> ${transaction.cryptoCoin || 'See tracking page'}</p>
        <p style="margin:6px 0;"><strong>Amount:</strong> $${parseFloat(transaction.amount).toLocaleString()} (pay equivalent in ${transaction.cryptoCoin || 'crypto'})</p>
        <p style="margin:6px 0;"><strong>Wallet Address:</strong></p>
        <div style="background:#fff;padding:10px;border-radius:4px;font-family:monospace;word-break:break-all;font-size:13px;border:1px solid #e5e7eb;">${transaction.cryptoAddress}</div>
        <p style="margin:12px 0 0;font-size:12px;color:#92400e;"><strong>Important:</strong> After sending, upload your transaction screenshot as payment proof.</p>
      </div>`;
  } else if (transaction.bankInfo) {
    const bankLines = transaction.bankInfo.split('\n').map((l: string) =>
      `<p style="margin:6px 0;">${l}</p>`).join('');
    paymentSection = `
      <div style="background:#fff8e1;border:2px solid #f59e0b;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#92400e;margin-top:0;">Bank Transfer Instructions</h3>
        <p style="margin:0 0 12px;"><strong>Please transfer $${parseFloat(transaction.amount).toLocaleString()} to the following account:</strong></p>
        <div style="background:#fff;padding:16px;border-radius:6px;border:1px solid #e5e7eb;font-size:14px;line-height:1.8;">
          ${bankLines}
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#92400e;"><strong>Important:</strong> Use your Transaction ID <strong>#${transaction.id}</strong> as the payment reference. After transferring, upload your receipt as payment proof on your tracking page.</p>
      </div>`;
  }

  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">Payment Instructions Ready</h2>
    <p>Dear ${transaction.buyerName},</p>
    <p>Your escrow transaction has been approved. Payment instructions are now available.</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Amount Due', `$${parseFloat(transaction.amount).toLocaleString()}`],
      ['Payment Method', transaction.paymentMethod === 'crypto' ? `Cryptocurrency (${transaction.cryptoCoin || ''})` : 'Bank Transfer'],
    ])}
    ${paymentSection}
    ${ctaButton('View Full Payment Details', trackUrl)}
    <p style="font-size:13px;color:#555;">After making payment, use the tracking page to upload your payment proof (screenshot or receipt).</p>`);

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `Payment Instructions for Transaction #${transaction.id} — AutoPro`,
    html,
  });
}

// ── 4. Admin: buyer confirmed payment ────────────────────────────────────────
export async function sendAdminPaymentConfirmation(transaction: {
  id: number; buyerName: string; buyerEmail: string; amount: string;
  bankRef: string | null; hasProofFile: boolean;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@autopro.com';
  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">Payment Confirmation — Verification Required</h2>
    <p>A buyer has submitted payment confirmation for a transaction. Please verify and release funds.</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Buyer', transaction.buyerName],
      ['Buyer Email', transaction.buyerEmail],
      ['Amount', `$${parseFloat(transaction.amount).toLocaleString()}`],
      ['Bank Ref / TX Hash', transaction.bankRef || 'Not provided'],
      ['Proof File Uploaded', transaction.hasProofFile ? 'Yes' : 'No'],
    ])}
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:4px;">
      <p style="margin:0;font-weight:bold;">Action Required: Log in to the admin panel to verify payment and update the transaction status.</p>
    </div>`);

  return sendEmail({
    to: adminEmail,
    subject: `Payment Confirmation Awaiting Verification — Transaction #${transaction.id}`,
    html,
  });
}

// ── 5. Buyer: payment proof received confirmation ────────────────────────────
export async function sendBuyerPaymentReceived(transaction: {
  id: number; buyerName: string; buyerEmail: string;
  amount: string; guestToken: string | null;
}) {
  const base = getBaseUrl();
  const trackUrl = transaction.guestToken ? `${base}/track/${transaction.guestToken}` : `${base}/track/${transaction.id}`;
  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">We Received Your Payment Proof</h2>
    <p>Dear ${transaction.buyerName},</p>
    <p>Thank you — your payment proof has been successfully submitted. Our team is now reviewing it and will verify your payment shortly.</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Amount', `$${parseFloat(transaction.amount).toLocaleString()}`],
      ['Status', 'Payment Under Review'],
    ])}
    <h3>What Happens Next</h3>
    <ol style="line-height:1.9;">
      <li>Our team verifies your payment (usually within a few hours)</li>
      <li>Once confirmed, we notify the seller to ship the vehicle</li>
      <li>You will receive a shipping confirmation email</li>
      <li>Your inspection period begins upon delivery</li>
    </ol>
    ${ctaButton('Track Your Transaction', trackUrl)}
    <div style="background:#e8f4fd;border-left:4px solid #1976d2;padding:14px 18px;border-radius:4px;">
      <p style="margin:0;font-size:13px;">Your funds are held securely in AutoPro's escrow account until the transaction completes.</p>
    </div>`);

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `Payment Proof Received - Transaction #${transaction.id} - AutoPro`,
    html,
  });
}

// ── 6. Seller: payment received (buyer confirmed) ────────────────────────────
export async function sendSellerPaymentReceived(transaction: {
  id: number; sellerName?: string | null; sellerEmail: string;
  buyerName: string; amount: string;
}) {
  const sellerDisplay = transaction.sellerName || 'Seller';
  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">Buyer Has Submitted Payment</h2>
    <p>Dear ${sellerDisplay},</p>
    <p>The buyer for your vehicle has submitted payment confirmation. Our team is currently verifying the payment.</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Buyer', transaction.buyerName],
      ['Amount', `$${parseFloat(transaction.amount).toLocaleString()}`],
    ])}
    <div style="background:#e8f5e9;border-left:4px solid #388e3c;padding:14px 18px;border-radius:4px;">
      <p style="margin:0;font-weight:bold;color:#1b5e20;">Once payment is verified, you will receive another notification to ship the vehicle.</p>
    </div>`);

  return sendEmail({
    to: transaction.sellerEmail,
    subject: `Payment Submitted for Transaction #${transaction.id} — AutoPro`,
    html,
  });
}

// ── 6. Seller: funds released (transaction complete) ─────────────────────────
export async function sendSellerFundsReleased(transaction: {
  id: number; sellerName?: string | null; sellerEmail: string;
  buyerName: string; amount: string; customVehicleDescription?: string | null;
}) {
  const sellerDisplay = transaction.sellerName || 'Seller';
  const vehicleInfo = transaction.customVehicleDescription || 'Your vehicle';
  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">Funds Released — Transaction Complete</h2>
    <p>Dear ${sellerDisplay},</p>
    <p>Congratulations! The buyer has approved the vehicle and payment has been released to you.</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Vehicle', vehicleInfo],
      ['Buyer', transaction.buyerName],
      ['Amount Released', `$${parseFloat(transaction.amount).toLocaleString()}`],
    ])}
    <div style="background:#e8f5e9;border:2px solid #16a34a;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
      <p style="margin:0;font-size:20px;font-weight:bold;color:#15803d;">$${parseFloat(transaction.amount).toLocaleString()} Released</p>
      <p style="margin:8px 0 0;color:#166534;">Funds have been released to your account</p>
    </div>
    <p>Thank you for using AutoPro Escrow. We hope to facilitate more transactions for you in the future!</p>`);

  return sendEmail({
    to: transaction.sellerEmail,
    subject: `Funds Released — Transaction #${transaction.id} Complete — AutoPro`,
    html,
  });
}

// ── Welcome email — new user registration ────────────────────────────────────
export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const base = getBaseUrl();
  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">Welcome to AutoPro, ${user.name}!</h2>
    <p>Thanks for creating an account with us. You're all set to:</p>
    <ul style="line-height:1.8;">
      <li>Browse our full inventory of new and used vehicles</li>
      <li>Start a secure escrow purchase on any listing</li>
      <li>Initiate a custom escrow for a private vehicle sale</li>
      <li>Track all of your transactions in one place</li>
    </ul>
    ${ctaButton('Browse Vehicles', `${base}/inventory`)}
    <p style="font-size:14px;color:#555;">
      Your account email: <strong>${user.email}</strong>
    </p>
    <p style="font-size:14px;">
      If you didn't create this account, please contact us right away.
    </p>`);

  return sendEmail({
    to: user.email,
    subject: `Welcome to AutoPro, ${user.name}`,
    html,
  });
}

// ── Contact form — notify admin ──────────────────────────────────────────────
export async function sendContactFormEmail(data: {
  name: string; email: string; phone?: string; subject: string; message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@autopro.com';
  const subjectLabels: Record<string, string> = {
    'vehicle-inquiry': 'Vehicle Inquiry',
    'escrow-question': 'Escrow Question',
    'test-drive': 'Schedule a Test Drive',
    'financing': 'Financing Options',
    'sell-vehicle': 'Sell My Vehicle',
    'other': 'Other',
  };
  const subjectLabel = subjectLabels[data.subject] || data.subject;

  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">New Contact Form Submission</h2>
    <p>A visitor has submitted the contact form on your website.</p>
    ${infoBox([
      ['Name', data.name],
      ['Email', data.email],
      ['Phone', data.phone || 'Not provided'],
      ['Subject', subjectLabel],
    ])}
    <div style="background:#fff;border:1px solid #e0e0e0;padding:20px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:bold;">Message:</p>
      <p style="margin:0;white-space:pre-wrap;line-height:1.7;">${data.message}</p>
    </div>
    <div style="background:#e8f4fd;border-left:4px solid #1976d2;padding:14px 18px;border-radius:4px;">
      <p style="margin:0;font-size:13px;">Reply directly to this email to respond to <strong>${data.name}</strong> at <strong>${data.email}</strong>.</p>
    </div>`);

  return sendEmail({
    to: adminEmail,
    subject: `Contact Form: ${subjectLabel} from ${data.name} — AutoPro`,
    html,
  });
}

// ── 7. General status update — buyer OR seller ───────────────────────────────
export async function sendTransactionStatusUpdate(transaction: {
  id: number;
  status: string;
  forSeller?: boolean;
  // buyer fields
  buyerName?: string;
  buyerEmail?: string;
  guestToken?: string | null;
  bankInfo?: string | null;
  // seller fields
  sellerName?: string | null;
  sellerEmail?: string;
  amount?: string;
}) {
  const base = getBaseUrl();
  const statusLabel = transaction.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  // ── Seller variant ──
  if (transaction.forSeller && transaction.sellerEmail) {
    const sellerDisplay = transaction.sellerName || 'Seller';
    const sellerMessages: Record<string, { title: string; message: string }> = {
      awaiting_admin_approval: { title: 'Transaction Under Review', message: 'The transaction is currently being reviewed by our team.' },
      awaiting_payment_confirmation: { title: 'Payment Instructions Sent to Buyer', message: 'Payment instructions have been provided to the buyer. We are awaiting their payment.' },
      in_transit: { title: 'Vehicle Shipping Confirmed', message: 'Payment has been confirmed. The vehicle is now being shipped to the buyer.' },
      inspection: { title: 'Buyer Inspection Period Started', message: "The buyer has received the vehicle and their inspection period has begun." },
      approved: { title: 'Buyer Approved the Vehicle', message: 'The buyer has approved the vehicle. Funds will be released to you shortly.' },
      released: { title: 'Funds Released to You', message: 'Payment has been released to your account. Transaction complete!' },
      cancelled: { title: 'Transaction Cancelled', message: 'This transaction has been cancelled. Contact us if you have questions.' },
    };
    const info = sellerMessages[transaction.status] || { title: 'Transaction Update', message: `Status changed to: ${statusLabel}` };

    const html = emailWrapper(`
      <h2 style="color:#111;margin-top:0;">${info.title}</h2>
      <p>Dear ${sellerDisplay},</p>
      <p>${info.message}</p>
      ${infoBox([
        ['Transaction ID', `#${transaction.id}`],
        ['Buyer', transaction.buyerName || '—'],
        ['Amount', transaction.amount ? `$${parseFloat(transaction.amount).toLocaleString()}` : '—'],
        ['Status', statusLabel],
      ])}
      <div style="background:#e8f5e9;border-left:4px solid #388e3c;padding:14px 18px;border-radius:4px;margin-top:16px;">
        <p style="margin:0;font-size:13px;">Your funds are protected in AutoPro's secure escrow account until the transaction completes.</p>
      </div>`);

    return sendEmail({
      to: transaction.sellerEmail,
      subject: `${info.title} — Transaction #${transaction.id} — AutoPro`,
      html,
    });
  }

  // ── Buyer variant ──
  const buyerMessages: Record<string, { title: string; message: string }> = {
    awaiting_admin_approval: { title: 'Transaction Under Review', message: 'Our team is reviewing your transaction. You will hear from us within 24 hours.' },
    awaiting_payment_confirmation: { title: 'Payment Instructions Ready', message: 'Bank or crypto payment details are now available in your tracking page.' },
    in_transit: { title: 'Vehicle Is On Its Way', message: 'Payment confirmed! The vehicle is being shipped to your address.' },
    inspection: { title: 'Inspection Period Started', message: 'The vehicle has been delivered. Your inspection period has begun.' },
    approved: { title: 'Purchase Approved', message: 'You approved the vehicle. Payment will be released to the seller.' },
    released: { title: 'Transaction Complete', message: 'Payment has been released. Thank you for using AutoPro Escrow!' },
    cancelled: { title: 'Transaction Cancelled', message: 'This transaction has been cancelled. Contact us if you have questions.' },
  };

  const trackUrl = transaction.guestToken ? `${base}/track/${transaction.guestToken}` : `${base}/track/${transaction.id}`;
  const statusInfo = buyerMessages[transaction.status] || { title: 'Transaction Updated', message: `Status: ${statusLabel}` };

  const html = emailWrapper(`
    <h2 style="color:#111;margin-top:0;">${statusInfo.title}</h2>
    <p>Dear ${transaction.buyerName || 'Buyer'},</p>
    <p>${statusInfo.message}</p>
    ${infoBox([
      ['Transaction ID', `#${transaction.id}`],
      ['Status', statusLabel],
    ])}
    ${ctaButton('View Transaction Details', trackUrl)}`);

  return sendEmail({
    to: transaction.buyerEmail!,
    subject: `${statusInfo.title} — Transaction #${transaction.id}`,
    html,
  });
}
