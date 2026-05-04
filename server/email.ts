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

// ── 3. Buyer: payment instructions (invoice-style email) ─────────────────────
export async function sendBuyerPaymentInstructions(transaction: {
  id: number; buyerName: string; buyerEmail: string; buyerPhone?: string | null;
  guestToken: string | null;
  amount: string; paymentMethod: string; bankInfo?: string | null;
  cryptoAddress?: string | null; cryptoCoin?: string | null;
  customVehicleDescription?: string | null; sellerName?: string | null;
  inspectionDays?: number; createdAt?: Date | string | null;
}) {
  const base = getBaseUrl();
  const trackUrl = transaction.guestToken ? `${base}/track/${transaction.guestToken}` : `${base}/track/${transaction.id}`;
  const amount = parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const invoiceDate = transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const vehicle = transaction.customVehicleDescription || 'Vehicle from AutoPro';

  let paymentBlock = '';
  if (transaction.paymentMethod === 'crypto' && transaction.cryptoAddress) {
    paymentBlock = `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td style="background:#fef9e7;border:2px solid #f0c040;border-radius:8px;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:15px;font-weight:bold;color:#92400e;padding-bottom:12px;">CRYPTOCURRENCY PAYMENT</td></tr>
            <tr><td>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
                <tr><td style="color:#666;width:130px;">Coin:</td><td style="font-weight:bold;">${transaction.cryptoCoin || 'See tracking page'}</td></tr>
                <tr><td style="color:#666;">Amount Due:</td><td style="font-weight:bold;">$${amount} equivalent in ${transaction.cryptoCoin || 'crypto'}</td></tr>
                <tr><td style="color:#666;vertical-align:top;">Wallet Address:</td><td><div style="background:#fff;padding:10px;border-radius:4px;font-family:'Courier New',monospace;word-break:break-all;font-size:12px;border:1px solid #ddd;color:#333;">${transaction.cryptoAddress}</div></td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>`;
  } else if (transaction.bankInfo) {
    const bankLines = transaction.bankInfo.split('\n').map((l: string) =>
      `<tr><td style="padding:4px 0;font-size:14px;color:#333;">${l}</td></tr>`).join('');
    paymentBlock = `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
        <tr><td style="background:#f0f7ff;border:2px solid #3b82f6;border-radius:8px;padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:15px;font-weight:bold;color:#1e40af;padding-bottom:12px;">BANK TRANSFER DETAILS</td></tr>
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;padding:16px;border-radius:6px;border:1px solid #dbeafe;">
                ${bankLines}
              </table>
            </td></tr>
            <tr><td style="padding-top:12px;font-size:12px;color:#1e40af;">Use reference: <strong>AUTOPRO-${transaction.id}</strong></td></tr>
          </table>
        </td></tr>
      </table>`;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:650px;margin:0 auto;color:#1a1a1a;background:#fff;">
      <!-- Header -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px 8px 0 0;">
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><span style="color:#fff;font-size:24px;font-weight:bold;letter-spacing:2px;">AUTOPRO</span><span style="color:#c0392b;font-size:14px;font-weight:bold;letter-spacing:1px;margin-left:8px;">ESCROW</span></td>
                <td style="text-align:right;color:#999;font-size:12px;">Secure Vehicle Transactions</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Invoice body -->
      <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px;padding:0;">

        <!-- Invoice title bar -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#c0392b;">
          <tr>
            <td style="padding:14px 32px;color:#fff;font-size:18px;font-weight:bold;letter-spacing:1px;">PAYMENT INVOICE</td>
            <td style="padding:14px 32px;text-align:right;color:rgba(255,255,255,0.9);font-size:13px;">Invoice #AP-${String(transaction.id).padStart(5, '0')}</td>
          </tr>
        </table>

        <div style="padding:32px;position:relative;">

          <!-- Invoice meta row -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="vertical-align:top;width:50%;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Bill To</p>
                <p style="margin:0 0 2px;font-size:15px;font-weight:bold;">${transaction.buyerName}</p>
                <p style="margin:0 0 2px;font-size:13px;color:#555;">${transaction.buyerEmail}</p>
                ${transaction.buyerPhone ? `<p style="margin:0;font-size:13px;color:#555;">${transaction.buyerPhone}</p>` : ''}
              </td>
              <td style="vertical-align:top;text-align:right;width:50%;">
                <table cellpadding="4" cellspacing="0" style="margin-left:auto;font-size:13px;">
                  <tr><td style="color:#999;text-align:right;">Invoice Date:</td><td style="font-weight:bold;text-align:right;">${invoiceDate}</td></tr>
                  <tr><td style="color:#999;text-align:right;">Due Date:</td><td style="font-weight:bold;text-align:right;color:#c0392b;">${dueDate}</td></tr>
                  <tr><td style="color:#999;text-align:right;">Transaction ID:</td><td style="font-weight:bold;text-align:right;">#${transaction.id}</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Line items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:4px;">
            <tr style="background:#f5f5f5;">
              <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#555;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #ddd;">Description</td>
              <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#555;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #ddd;text-align:center;">Details</td>
              <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#555;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #ddd;text-align:right;">Amount</td>
            </tr>
            <tr>
              <td style="padding:14px;font-size:14px;border-bottom:1px solid #eee;vertical-align:top;">
                <strong>Escrow Vehicle Purchase</strong><br>
                <span style="font-size:12px;color:#666;">${vehicle}</span>
              </td>
              <td style="padding:14px;font-size:13px;border-bottom:1px solid #eee;text-align:center;color:#555;vertical-align:top;">
                ${transaction.sellerName ? `Seller: ${transaction.sellerName}<br>` : ''}
                ${transaction.inspectionDays ? `Inspection: ${transaction.inspectionDays} day${transaction.inspectionDays !== 1 ? 's' : ''}` : ''}
              </td>
              <td style="padding:14px;font-size:14px;border-bottom:1px solid #eee;text-align:right;vertical-align:top;">$${amount}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:12px;color:#666;border-bottom:1px solid #eee;">AutoPro Escrow Protection</td>
              <td style="padding:10px 14px;font-size:12px;color:#666;border-bottom:1px solid #eee;text-align:center;">Funds held until delivery confirmed</td>
              <td style="padding:10px 14px;font-size:12px;color:#16a34a;border-bottom:1px solid #eee;text-align:right;">Included</td>
            </tr>
          </table>

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="width:60%;"></td>
              <td style="width:40%;">
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr><td style="font-size:13px;color:#666;">Subtotal:</td><td style="text-align:right;font-size:13px;">$${amount}</td></tr>
                  <tr><td style="font-size:13px;color:#666;">Escrow Fee:</td><td style="text-align:right;font-size:13px;color:#16a34a;">$0.00</td></tr>
                  <tr style="border-top:2px solid #111;">
                    <td style="font-size:16px;font-weight:bold;padding-top:10px;">TOTAL DUE:</td>
                    <td style="text-align:right;font-size:18px;font-weight:bold;color:#c0392b;padding-top:10px;">$${amount}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Payment method -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
            <tr>
              <td style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">Payment Method</td>
            </tr>
            <tr>
              <td style="font-size:14px;font-weight:bold;">${transaction.paymentMethod === 'crypto' ? `Cryptocurrency (${transaction.cryptoCoin || 'Crypto'})` : 'Bank Wire Transfer'}</td>
            </tr>
          </table>

          ${paymentBlock}

          <!-- Stamp overlay -->
          <div style="text-align:right;margin-top:24px;margin-bottom:8px;">
            <div style="display:inline-block;border:3px solid #c0392b;border-radius:50%;width:120px;height:120px;text-align:center;transform:rotate(-15deg);-webkit-transform:rotate(-15deg);opacity:0.85;">
              <div style="margin-top:22px;font-size:10px;font-weight:bold;color:#c0392b;letter-spacing:2px;text-transform:uppercase;">AUTOPRO</div>
              <div style="font-size:8px;color:#c0392b;letter-spacing:1px;margin-top:2px;">&#9733; ESCROW &#9733;</div>
              <div style="width:80px;height:1px;background:#c0392b;margin:6px auto;"></div>
              <div style="font-size:9px;font-weight:bold;color:#c0392b;letter-spacing:1px;">VERIFIED</div>
              <div style="font-size:7px;color:#c0392b;margin-top:2px;">SECURE TRANSACTION</div>
            </div>
          </div>

          <!-- Important notes -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr><td style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:4px;">
              <p style="margin:0 0 6px;font-weight:bold;font-size:13px;color:#92400e;">Important Notes:</p>
              <ul style="margin:0;padding-left:18px;font-size:12px;color:#92400e;line-height:1.8;">
                <li>Payment must be completed within 7 days of this invoice.</li>
                <li>After payment, upload your receipt or screenshot on the tracking page.</li>
                <li>Funds are held securely in escrow until you confirm vehicle delivery.</li>
                <li>Your ${transaction.inspectionDays || 3}-day inspection period begins upon delivery.</li>
              </ul>
            </td></tr>
          </table>

          <!-- CTA button -->
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${trackUrl}" style="background:#c0392b;color:#fff;padding:14px 40px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:15px;">View Invoice &amp; Upload Proof</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top:1px solid #e0e0e0;padding:20px 32px;background:#fafafa;border-radius:0 0 8px 8px;">
          <p style="margin:0 0 8px;font-size:13px;color:#555;">Questions about this invoice? Contact us:</p>
          <p style="margin:0 0 4px;font-size:13px;"><strong>Phone:</strong> 1-800-CAR-DEAL &nbsp;|&nbsp; <strong>Email:</strong> escrow@autopro.com</p>
          <p style="color:#999;font-size:11px;margin-top:16px;">This is an automated invoice from AutoPro Escrow Service. Transaction #${transaction.id}.</p>
        </div>
      </div>
    </div>`;

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `Invoice #AP-${String(transaction.id).padStart(5, '0')} — Payment Instructions — AutoPro Escrow`,
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
