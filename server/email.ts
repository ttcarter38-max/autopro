// Email notification service
// Note: This is a placeholder implementation. 
// To enable real email notifications, set up Resend integration or provide SMTP credentials.

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  // Log email for development/testing
  console.log('📧 EMAIL NOTIFICATION:');
  console.log('To:', data.to);
  console.log('Subject:', data.subject);
  console.log('Body:', data.html);
  console.log('---');

  // TODO: Implement actual email sending when credentials are provided
  // This could use Resend, SendGrid, or SMTP
  // For now, we just log the email content
  
  return true;
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
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">Escrow Transaction Initiated</h1>
      
      <p>Dear ${transaction.buyerName},</p>
      
      <p>Your escrow transaction has been successfully initiated! Here are the details:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction ID:</strong> #${transaction.id}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo}</p>
        <p><strong>Amount:</strong> $${parseFloat(transaction.amount).toLocaleString()}</p>
        <p><strong>Inspection Period:</strong> ${transaction.inspectionDays} days</p>
      </div>
      
      <h2 style="color: #1a1a1a;">Next Steps:</h2>
      <ol>
        <li>Our team will review and approve your transaction within 24 hours</li>
        <li>You'll receive bank details via email to make the secure payment</li>
        <li>Once payment is confirmed, the vehicle will be shipped to your address</li>
        <li>You'll have ${transaction.inspectionDays} days to inspect the vehicle</li>
      </ol>
      
      <p>Track your transaction status at any time using your tracking token:</p>
      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Tracking Token:</strong> ${transaction.guestToken}</p>
      </div>
      
      <p>Or visit: <a href="${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.dev/track/${transaction.guestToken}` : `/track/${transaction.guestToken}`}">Track Your Transaction</a></p>
      
      <p style="margin-top: 30px;">If you have any questions, please contact us at:</p>
      <p>📞 1-800-CAR-DEAL<br>📧 escrow@autopro.com</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message from AutoPro Escrow Service. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `Escrow Transaction #${transaction.id} Initiated - AutoPro`,
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">New Escrow Transaction for Your Vehicle</h1>
      
      <p>Dear ${sellerDisplayName},</p>
      
      <p>Great news! A buyer has initiated an escrow transaction for your vehicle through AutoPro.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction ID:</strong> #${transaction.id}</p>
        <p><strong>Vehicle:</strong> ${vehicleInfo}</p>
        <p><strong>Buyer:</strong> ${transaction.buyerName}</p>
        <p><strong>Amount:</strong> $${parseFloat(transaction.amount).toLocaleString()}</p>
      </div>
      
      <h2 style="color: #1a1a1a;">What Happens Next:</h2>
      <ol>
        <li>Our team will review and approve the transaction within 24 hours</li>
        <li>The buyer will transfer funds to our secure escrow account</li>
        <li>Once payment is confirmed, you'll be notified to ship the vehicle</li>
        <li>After the buyer's inspection period, we'll release payment to you</li>
      </ol>
      
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">✓ Your payment is 100% protected in our escrow account</p>
      </div>
      
      <p style="margin-top: 30px;">If you have any questions, please contact us at:</p>
      <p>📞 1-800-CAR-DEAL<br>📧 escrow@autopro.com</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message from AutoPro Escrow Service. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: transaction.sellerEmail,
    subject: `New Escrow Transaction #${transaction.id} - AutoPro`,
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
}) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    awaiting_admin_approval: {
      title: 'Transaction Approved by Admin',
      message: 'Your escrow transaction has been reviewed and approved by our team.',
    },
    awaiting_payment_confirmation: {
      title: 'Bank Details Available',
      message: 'Bank information has been provided. Please make your payment to proceed.',
    },
    in_transit: {
      title: 'Vehicle In Transit',
      message: 'Payment confirmed! The vehicle is now being shipped to your address.',
    },
    inspection: {
      title: 'Inspection Period Started',
      message: 'The vehicle has been delivered. Your inspection period has begun.',
    },
    approved: {
      title: 'Transaction Approved',
      message: 'You have approved the vehicle. Payment will be released to the seller.',
    },
    released: {
      title: 'Transaction Complete',
      message: 'Payment has been released to the seller. Thank you for using AutoPro Escrow!',
    },
  };

  const statusInfo = statusMessages[transaction.status] || {
    title: 'Transaction Status Updated',
    message: `Your transaction status has been updated to: ${transaction.status}`,
  };

  let bankInfoHtml = '';
  if (transaction.status === 'awaiting_payment_confirmation' && transaction.bankInfo) {
    bankInfoHtml = `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">🔒 Password-Protected Bank Information</h3>
        <p><strong>Password:</strong> <code style="background-color: #fff; padding: 2px 6px; border-radius: 4px;">${transaction.bankPassword || 'Contact admin'}</code></p>
        <p style="color: #856404; margin-bottom: 0;">Use this password to access the full bank details in your transaction tracking page.</p>
      </div>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a1a1a;">${statusInfo.title}</h1>
      
      <p>Dear ${transaction.buyerName},</p>
      
      <p>${statusInfo.message}</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Transaction ID:</strong> #${transaction.id}</p>
        <p><strong>Status:</strong> ${transaction.status.replace(/_/g, ' ').toUpperCase()}</p>
      </div>
      
      ${bankInfoHtml}
      
      <p>View your transaction details and track progress:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.dev/track/${transaction.id}` : `/track/${transaction.id}`}" 
           style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Transaction
        </a>
      </div>
      
      <p style="margin-top: 30px;">If you have any questions, please contact us at:</p>
      <p>📞 1-800-CAR-DEAL<br>📧 escrow@autopro.com</p>
      
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This is an automated message from AutoPro Escrow Service. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: transaction.buyerEmail,
    subject: `${statusInfo.title} - Transaction #${transaction.id}`,
    html,
  });
}
