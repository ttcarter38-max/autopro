import { Info, ExternalLink } from 'lucide-react';

export default function BuyerCryptoInfo() {
  return (
    <div className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4 text-sm">
      <div className="flex items-center gap-2 mb-2 text-blue-900 dark:text-blue-100">
        <Info className="w-4 h-4" />
        <p className="font-semibold">New to crypto? Here's how to get some easily</p>
      </div>
      <p className="text-blue-800 dark:text-blue-200 mb-3">
        You can buy cryptocurrency in minutes with a debit card or bank transfer
        through any of these popular services, then send it to the wallet address
        we provide:
      </p>
      <ul className="space-y-1.5 text-blue-800 dark:text-blue-200">
        <li className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <a href="https://www.paypal.com/us/digital-wallet/manage-money/crypto" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            PayPal (US)
          </a>
          <span className="text-xs opacity-80">— if you already have a PayPal account</span>
        </li>
        <li className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <a href="https://cash.app" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            Cash App (US)
          </a>
          <span className="text-xs opacity-80">— fast Bitcoin purchases</span>
        </li>
        <li className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            Coinbase
          </a>
          <span className="text-xs opacity-80">— most popular, debit card supported</span>
        </li>
      </ul>
      <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
        Availability varies by country. After your escrow is approved, we'll email
        you the exact wallet address and amount to send. AutoPro is not affiliated
        with these services.
      </p>
    </div>
  );
}
