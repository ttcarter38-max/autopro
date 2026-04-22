import { Info, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BuyerCryptoInfo() {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4 text-sm">
      <div className="flex items-center gap-2 mb-2 text-blue-900 dark:text-blue-100">
        <Info className="w-4 h-4" />
        <p className="font-semibold">{t('cryptoInfo.title')}</p>
      </div>
      <p className="text-blue-800 dark:text-blue-200 mb-3">
        {t('cryptoInfo.intro')}
      </p>
      <ul className="space-y-1.5 text-blue-800 dark:text-blue-200">
        <li className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <a href="https://www.paypal.com/us/digital-wallet/manage-money/crypto" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            PayPal (US)
          </a>
          <span className="text-xs opacity-80">{t('cryptoInfo.paypalNote')}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <a href="https://cash.app" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            Cash App (US)
          </a>
          <span className="text-xs opacity-80">{t('cryptoInfo.cashappNote')}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
            Coinbase
          </a>
          <span className="text-xs opacity-80">{t('cryptoInfo.coinbaseNote')}</span>
        </li>
      </ul>
      <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
        {t('cryptoInfo.footer')}
      </p>
    </div>
  );
}
