import { useTranslation } from 'react-i18next';
import {
  CheckCircle, Clock, DollarSign, Package, Eye, XCircle,
} from 'lucide-react';

const STEPS = [
  { key: 'initiated', tKey: 'initiated', icon: CheckCircle },
  { key: 'awaiting_admin_approval', tKey: 'awaitingApproval', icon: Clock },
  { key: 'awaiting_payment_confirmation', tKey: 'paymentSent', icon: DollarSign },
  { key: 'in_transit', tKey: 'inTransit', icon: Package },
  { key: 'inspection', tKey: 'inspection', icon: Eye },
  { key: 'approved', tKey: 'approved', icon: CheckCircle },
  { key: 'released', tKey: 'released', icon: CheckCircle },
];

interface StatusTimelineProps {
  status: string;
  compact?: boolean;
}

export default function StatusTimeline({ status, compact = false }: StatusTimelineProps) {
  const { t } = useTranslation();
  const isCancelled = status === 'cancelled';
  const currentIdx = isCancelled ? -1 : STEPS.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <div
        className="flex items-center gap-2 rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 px-3 py-2"
        data-testid="status-timeline-cancelled"
      >
        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        <span className="text-sm font-medium text-red-900 dark:text-red-100">
          {t('tracking.cancelledTitle')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-stretch ${compact ? 'gap-1' : 'gap-1.5'} overflow-x-auto`}
      data-testid="status-timeline"
    >
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;

        const baseClass = compact
          ? 'flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs whitespace-nowrap shrink-0'
          : 'flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm whitespace-nowrap shrink-0';

        let stateClass = '';
        if (isCurrent) {
          stateClass = 'bg-primary text-primary-foreground border-primary font-semibold';
        } else if (isComplete) {
          stateClass = 'bg-primary/10 dark:bg-primary/20 text-primary border-primary/30 font-medium';
        } else if (isPending) {
          stateClass = 'bg-muted text-muted-foreground border-border';
        }

        return (
          <div
            key={step.key}
            className={`${baseClass} ${stateClass}`}
            data-testid={`status-step-${step.key}`}
          >
            <Icon className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
            <span>{t(`tracking.steps.${step.tKey}`)}</span>
          </div>
        );
      })}
    </div>
  );
}
