export type TxStatus =
  | 'initiated'
  | 'awaiting_admin_approval'
  | 'awaiting_payment_confirmation'
  | 'in_transit'
  | 'inspection'
  | 'approved'
  | 'released'
  | 'cancelled';

export const TX_STATUSES: readonly TxStatus[] = [
  'initiated',
  'awaiting_admin_approval',
  'awaiting_payment_confirmation',
  'in_transit',
  'inspection',
  'approved',
  'released',
  'cancelled',
];

export const ALLOWED_TRANSITIONS: Record<TxStatus, TxStatus[]> = {
  initiated:                     ['awaiting_admin_approval', 'cancelled'],
  awaiting_admin_approval:       ['awaiting_payment_confirmation', 'cancelled'],
  awaiting_payment_confirmation: ['in_transit', 'cancelled'],
  in_transit:                    ['inspection', 'cancelled'],
  inspection:                    ['approved', 'cancelled'],
  approved:                      ['released', 'cancelled'],
  released:                      [],
  cancelled:                     [],
};

export type TransitionResult =
  | { ok: true; sameState: boolean }
  | { ok: false; error: string };

export function validateTransition(
  from: TxStatus,
  to: TxStatus,
  opts: { override?: boolean; overrideReason?: string } = {}
): TransitionResult {
  if (from === to) return { ok: true, sameState: true };

  const allowed = ALLOWED_TRANSITIONS[from] || [];
  if (allowed.includes(to)) return { ok: true, sameState: false };

  if (opts.override) {
    const reason = (opts.overrideReason || '').trim();
    if (reason.length < 5) {
      return { ok: false, error: 'Admin override requires a reason (at least 5 characters).' };
    }
    return { ok: true, sameState: false };
  }

  return {
    ok: false,
    error: `Invalid transition: cannot move from "${from}" to "${to}". Allowed next states: ${
      allowed.length ? allowed.join(', ') : '(none — final state)'
    }. Use admin override to force.`,
  };
}
