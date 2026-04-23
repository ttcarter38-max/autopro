import { randomUUID } from 'crypto';

const NONCE_TTL_MS = 30 * 60 * 1000;
const MAX_NONCES = 5000;
const store = new Map<string, { token: string; expiresAt: number }>();

function sweep() {
  const now = Date.now();
  store.forEach((entry, nonce) => {
    if (entry.expiresAt < now) store.delete(nonce);
  });
}

export function issueSellerNonce(sellerToken: string): string {
  sweep();
  // Hard cap to prevent memory DoS via nonce flooding.
  // Map preserves insertion order, so dropping from the front evicts the oldest entries.
  if (store.size >= MAX_NONCES) {
    const toEvict = store.size - MAX_NONCES + 1;
    const iter = store.keys();
    for (let i = 0; i < toEvict; i++) {
      const k = iter.next().value;
      if (k === undefined) break;
      store.delete(k);
    }
  }
  const nonce = randomUUID();
  store.set(nonce, { token: sellerToken, expiresAt: Date.now() + NONCE_TTL_MS });
  return nonce;
}

export function consumeSellerNonce(sellerToken: string, nonce: string): boolean {
  const entry = store.get(nonce);
  if (!entry) return false;
  store.delete(nonce);
  if (entry.expiresAt < Date.now()) return false;
  return entry.token === sellerToken;
}
