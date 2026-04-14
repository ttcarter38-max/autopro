import { Resend } from 'resend';

// Email is sent via Resend when RESEND_API_KEY is set.
// Falls back to console logging for development/testing.

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// The "from" address. Resend's free tier allows sending from onboarding@resend.dev
// Once you verify a domain at resend.com, update this to your domain address.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'AutoPro Escrow <onboarding@resend.dev>';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    console.log('📧 EMAIL (no RESEND_API_KEY set — logging only):');
    console.log('To:', data.to);
    console.log('Subject:', data.subject);
    console.log('---');
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return false;
    }

    console.log(`📧 Email sent via Resend to ${data.to} (id: ${result.data?.id})`);
    return true;
  } catch (err) {
    console.error('Failed to send email via Resend:', err);
    return false;
  }
}

export async function sendBuyerTransactionInitiated(transaction: {
  id: number;
  buyerName: string;
  buyerEmail: string;
  guestToken: string;
  customVehicleDescription?: string | null;
  amount: string;
  inspectionDays: number;
}) {
  const vehicleInfo = transaction.customVehicleDescription || 'Vehicle from AutoPro';
  const baseUrl = process.env.REPL_DOMAINS
    ? `https://${process.env.REPL_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background-color: #111; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">AutoPro Escrow</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111; margin-top: 0;">Escrow Transaction Initiated</h2>

        <p>Dear ${transaction.buyerName},</p>

        <p>Your escrow transaction has been successfully initiated. Here are your details:</p>

        <div style="background-color: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Transaction ID:</strong> #${transaction.id}</p>
          <p style="margin: 6px 0;"><strong>Vehicle:</strong> ${vehicleInfo}</p>
          <p style="margin: 6px 0;"><strong>Amount:</strong> $${parseFloat(transaction.amount).toLocaleString()}</p>
          <p style="margin: 6px 0;"><strong>Inspection Period:</strong> ${transaction.inspectionDays} day${transaction.inspectionDays !== 1 ? 's' : ''}</p>
        </div>

        <h3 style="color: #111;">What Happens Next</h3>
        <ol style="line-height: 1.8;">
          <li>Our team will review and approve your transaction within 24 hours</li>
          <li>You'll receive secure bank payment details by email</li>
          <li>Once payment is confirmed, the vehicle will be shipped to your address</li>
          <li>You'll have ${transaction.inspectionDays} day${transaction.inspectionDays !== 1 ? 's' : ''} to inspect the vehicle</li>
        </ol>

        <p>Track your transaction status at any time using your tracking link below:</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${baseUrl}/track/${transaction.guestToken}"
             style="background-color: #c0392b; color: #fff; padding: 14px 36px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">
            Track My Transaction
          </a>
        </div>

        <div style="background-color: #e8f4fd; border-left: 4px solid #1976d2; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px;"><strong>Tracking Token:</strong> ${transaction.guestToken}</p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #555;">Save this token — you'll need it to track your transaction.</p>
        </div>

        <p style="margin-top: 28px;">Questions? Contact us:<br>
          <strong>Phone:</strong> 1-800-CAR-DEAL<br>
          <strong>Email:</strong> escrow@autopro.com
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #e0e0e0; padding-top: 16px;">
          This is an automated message from AutoPro Escrow Service. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `Your Escrow Transaction #${transaction.id} Has Been Initiated — AutoPro`,
    html,
  });
}

export async function sendSellerTransactionNotification(transaction: {
  id: number;
  sellerName?: string | null;
  sellerEmail: string;
  buyerName: string;
  customVehicleDescription?: string | null;
  amount: string;
}) {
  const sellerDisplayName = transaction.sellerName || 'Seller';
  const vehicleInfo = transaction.customVehicleDescription || 'Your vehicle';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background-color: #111; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">AutoPro Escrow</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111; margin-top: 0;">A Buyer Has Started Escrow for Your Vehicle</h2>

        <p>Dear ${sellerDisplayName},</p>

        <p>Great news — a buyer has initiated an escrow transaction for your vehicle through AutoPro.</p>

        <div style="background-color: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Transaction ID:</strong> #${transaction.id}</p>
          <p style="margin: 6px 0;"><strong>Vehicle:</strong> ${vehicleInfo}</p>
          <p style="margin: 6px 0;"><strong>Buyer:</strong> ${transaction.buyerName}</p>
          <p style="margin: 6px 0;"><strong>Amount:</strong> $${parseFloat(transaction.amount).toLocaleString()}</p>
        </div>

        <h3 style="color: #111;">What Happens Next</h3>
        <ol style="line-height: 1.8;">
          <li>Our team will review and approve the transaction within 24 hours</li>
          <li>The buyer will transfer funds to our secure escrow account</li>
          <li>Once payment is confirmed, you'll be notified to ship the vehicle</li>
          <li>After the buyer completes their inspection, payment will be released to you</li>
        </ol>

        <div style="background-color: #e8f5e9; border-left: 4px solid #388e3c; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1b5e20;">Your payment is fully protected in our secure escrow account</p>
        </div>

        <p style="margin-top: 28px;">Questions? Contact us:<br>
          <strong>Phone:</strong> 1-800-CAR-DEAL<br>
          <strong>Email:</strong> escrow@autopro.com
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #e0e0e0; padding-top: 16px;">
          This is an automated message from AutoPro Escrow Service. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: transaction.sellerEmail,
    subject: `New Escrow Transaction #${transaction.id} for Your Vehicle — AutoPro`,
    html,
  });
}

export async function sendTransactionStatusUpdate(transaction: {
  id: number;
  buyerName: string;
  buyerEmail: string;
  status: string;
  bankInfo?: string | null;
  bankPassword?: string | null;
  guestToken?: string | null;
}) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    awaiting_admin_approval: {
      title: 'Transaction Approved — Awaiting Your Payment',
      message: 'Our team has reviewed and approved your transaction. Bank payment details will be shared with you shortly.',
    },
    awaiting_payment_confirmation: {
      title: 'Bank Payment Details Are Ready',
      message: 'Bank information has been provided for your transaction. Please log in to view and make your payment.',
    },
    in_transit: {
      title: 'Payment Confirmed — Vehicle Is On Its Way',
      message: 'Your payment has been confirmed! The vehicle is now being shipped to your address.',
    },
    inspection: {
      title: 'Inspection Period Has Started',
      message: 'The vehicle has been delivered. Your inspection period has begun — please inspect the vehicle carefully.',
    },
    approved: {
      title: 'You Approved the Vehicle',
      message: 'You have approved the vehicle. Payment will now be released to the seller. Thank you!',
    },
    released: {
      title: 'Transaction Complete',
      message: 'Payment has been released to the seller. Your transaction is complete. Thank you for using AutoPro Escrow!',
    },
  };

  const statusInfo = statusMessages[transaction.status] || {
    title: 'Transaction Status Updated',
    message: `Your transaction status has been updated to: ${transaction.status.replace(/_/g, ' ')}`,
  };

  const baseUrl = process.env.REPL_DOMAINS
    ? `https://${process.env.REPL_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

  const trackingPath = transaction.guestToken
    ? `/track/${transaction.guestToken}`
    : `/track/${transaction.id}`;

  let bankInfoHtml = '';
  if (transaction.status === 'awaiting_payment_confirmation' && transaction.bankInfo) {
    bankInfoHtml = `
      <div style="background-color: #fff8e1; border: 1px solid #ffc107; padding: 18px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Bank Payment Details Are Ready</h3>
        <p style="margin-bottom: 8px;">A password is required to view the full bank details. You'll find the password in your transaction tracking page.</p>
        ${transaction.bankPassword ? `<p style="margin: 0;"><strong>Password hint:</strong> Check your tracking page or contact support.</p>` : ''}
      </div>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background-color: #111; padding: 24px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">AutoPro Escrow</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 32px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #111; margin-top: 0;">${statusInfo.title}</h2>

        <p>Dear ${transaction.buyerName},</p>

        <p>${statusInfo.message}</p>

        <div style="background-color: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 6px 0;"><strong>Transaction ID:</strong> #${transaction.id}</p>
          <p style="margin: 6px 0;"><strong>Status:</strong> ${transaction.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>

        ${bankInfoHtml}

        <div style="text-align: center; margin: 28px 0;">
          <a href="${baseUrl}${trackingPath}"
             style="background-color: #c0392b; color: #fff; padding: 14px 36px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">
            View Transaction Details
          </a>
        </div>

        <p style="margin-top: 28px;">Questions? Contact us:<br>
          <strong>Phone:</strong> 1-800-CAR-DEAL<br>
          <strong>Email:</strong> escrow@autopro.com
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 32px; border-top: 1px solid #e0e0e0; padding-top: 16px;">
          This is an automated message from AutoPro Escrow Service. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `${statusInfo.title} — Transaction #${transaction.id}`,
    html,
  });
}
