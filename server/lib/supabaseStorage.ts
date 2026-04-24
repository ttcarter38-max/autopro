// Supabase Storage helpers for vehicle images (public) and payment proofs (private with signed URLs)
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SECRET_KEY must be set. ' +
    'Get them from your Supabase project Settings > API and add them as environment variables.'
  );
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const VEHICLE_BUCKET = 'vehicle-images';
export const PROOF_BUCKET = 'payment-proofs';

function makeKey(originalName: string, prefix = ''): string {
  const ext = (originalName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${prefix}${Date.now()}-${randomUUID()}.${ext || 'bin'}`;
}

export async function uploadVehicleImage(
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<{ key: string; url: string }> {
  const objectKey = makeKey(originalName);
  const { error } = await supabase.storage
    .from(VEHICLE_BUCKET)
    .upload(objectKey, buffer, { contentType, upsert: false, cacheControl: '31536000' });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  const { data } = supabase.storage.from(VEHICLE_BUCKET).getPublicUrl(objectKey);
  console.log(`[storage] uploaded vehicle image ${objectKey} (${buffer.length} bytes)`);
  return { key: objectKey, url: data.publicUrl };
}

export async function uploadPaymentProof(
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<{ key: string }> {
  const objectKey = makeKey(originalName, 'proof-');
  const { error } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(objectKey, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  console.log(`[storage] uploaded payment proof ${objectKey} (${buffer.length} bytes)`);
  return { key: objectKey };
}

export async function getSignedProofUrl(objectKey: string, ttlSeconds = 300): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PROOF_BUCKET)
    .createSignedUrl(objectKey, ttlSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(`Failed to sign proof URL: ${error?.message || 'no url returned'}`);
  }
  return data.signedUrl;
}
