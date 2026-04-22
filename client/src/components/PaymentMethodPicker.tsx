import { useState } from 'react';
import { Building2, Bitcoin, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import BuyerCryptoInfo from './BuyerCryptoInfo';

export type PaymentMethodValue = {
  buyerPaymentMethod: 'bank' | 'crypto';
  buyerPreferredCoin?: string;
  buyerPreferredNetwork?: string;
};

interface Props {
  value: PaymentMethodValue;
  onChange: (v: PaymentMethodValue) => void;
  showCryptoInfoCard?: boolean;
}

const COMMON_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'];

export default function PaymentMethodPicker({ value, onChange, showCryptoInfoCard = true }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { t } = useTranslation();

  const setMethod = (method: 'bank' | 'crypto') => {
    onChange({ ...value, buyerPaymentMethod: method });
  };

  return (
    <div className="space-y-3">
      <Label>{t('payment.howPay')}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={value.buyerPaymentMethod === 'bank' ? 'default' : 'outline'}
          className="h-auto py-4 flex flex-col items-center gap-1"
          onClick={() => setMethod('bank')}
          data-testid="button-pay-bank"
        >
          <Building2 className="w-6 h-6" />
          <span className="font-semibold">{t('payment.bank')}</span>
          <span className="text-xs opacity-80">{t('payment.bankSub')}</span>
        </Button>
        <Button
          type="button"
          variant={value.buyerPaymentMethod === 'crypto' ? 'default' : 'outline'}
          className="h-auto py-4 flex flex-col items-center gap-1"
          onClick={() => setMethod('crypto')}
          data-testid="button-pay-crypto"
        >
          <Bitcoin className="w-6 h-6" />
          <span className="font-semibold">{t('payment.crypto')}</span>
          <span className="text-xs opacity-80">{t('payment.cryptoSub')}</span>
        </Button>
      </div>

      {value.buyerPaymentMethod === 'crypto' && (
        <div className="space-y-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs gap-1 px-2"
            onClick={() => setAdvancedOpen(o => !o)}
            data-testid="button-toggle-crypto-advanced"
          >
            {advancedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {t('payment.advanced')}
          </Button>

          {advancedOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-md bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="preferred-coin" className="text-xs">{t('payment.preferredCoin')}</Label>
                <Select
                  value={value.buyerPreferredCoin || '__any__'}
                  onValueChange={(v) => onChange({ ...value, buyerPreferredCoin: v === '__any__' ? undefined : v })}
                >
                  <SelectTrigger id="preferred-coin" data-testid="select-preferred-coin">
                    <SelectValue placeholder={t('payment.any')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">{t('payment.anyAdmin')}</SelectItem>
                    {COMMON_COINS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="preferred-network" className="text-xs">{t('payment.preferredNetwork')}</Label>
                <Input
                  id="preferred-network"
                  placeholder={t('payment.preferredNetworkPh')}
                  value={value.buyerPreferredNetwork || ''}
                  onChange={(e) => onChange({ ...value, buyerPreferredNetwork: e.target.value || undefined })}
                  maxLength={40}
                  data-testid="input-preferred-network"
                />
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2 flex gap-1.5 items-start">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {t('payment.advancedHelp')}
              </p>
            </div>
          )}

          {showCryptoInfoCard && <BuyerCryptoInfo />}
        </div>
      )}
    </div>
  );
}
