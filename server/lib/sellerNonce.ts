import { randomUUID } from 'crypto';

const NONCE_TTL_MS = 30 * 60 * 1000;
const store = new Map<string, { token: string; expiresAt: number }>();

function sweep() {
  const now = Date.now();
  store.forEach((entry, nonce) => {
    if (entry.expiresAt < now) store.delete(nonce);
  });
}

export function issueSellerNonce(sellerToken: string): string {
  sweep();
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
