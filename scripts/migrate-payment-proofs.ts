import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const execute = process.argv.includes('--execute');
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia.');
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: queue, error } = await supabase.from('payment_proof_migration_queue')
  .select('booking_id,legacy_public_url,status')
  .eq('status', 'pending')
  .order('created_at');
if (error) throw error;

console.log(`${queue?.length || 0} bukti pembayaran legacy menunggu migrasi. Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}.`);
if (!execute) {
  console.log('Jalankan ulang dengan --execute hanya setelah journey booking baru lolos uji produksi.');
  process.exit(0);
}

function extension(contentType: string) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/jpeg') return 'jpg';
  throw new Error(`Tipe bukti tidak didukung: ${contentType || 'tidak diketahui'}`);
}

function legacyObject(url: string) {
  const parsed = new URL(url);
  const marker = '/storage/v1/object/public/';
  const index = parsed.pathname.indexOf(marker);
  if (index < 0) return null;
  const [bucket, ...path] = decodeURIComponent(parsed.pathname.slice(index + marker.length)).split('/');
  return bucket && path.length ? { bucket, path: path.join('/') } : null;
}

for (const item of queue || []) {
  try {
    const response = await fetch(item.legacy_public_url);
    if (!response.ok) throw new Error(`Unduhan gagal (${response.status}).`);
    const contentType = (response.headers.get('content-type') || '').split(';')[0];
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('Ukuran bukti kosong atau melebihi 5 MB.');
    const objectPath = `legacy/${item.booking_id}/${randomUUID()}.${extension(contentType)}`;
    const checksum = createHash('sha256').update(bytes).digest('hex');
    const { error: uploadError } = await supabase.storage.from('payment-proofs-private')
      .upload(objectPath, bytes, { contentType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: downloaded, error: downloadError } = await supabase.storage.from('payment-proofs-private').download(objectPath);
    if (downloadError || !downloaded) throw downloadError || new Error('Verifikasi unduhan private gagal.');
    const copiedChecksum = createHash('sha256').update(new Uint8Array(await downloaded.arrayBuffer())).digest('hex');
    if (copiedChecksum !== checksum) throw new Error('Checksum bukti private tidak cocok.');

    const { error: updateError } = await supabase.from('payment_proof_migration_queue').update({
      status: 'migrated', private_object_path: objectPath, validated_at: new Date().toISOString(),
    }).eq('booking_id', item.booking_id).eq('status', 'pending');
    if (updateError) throw updateError;

    const legacy = legacyObject(item.legacy_public_url);
    if (legacy) {
      const { error: removeError } = await supabase.storage.from(legacy.bucket).remove([legacy.path]);
      if (removeError) console.warn(`${item.booking_id}: salinan private valid, tetapi objek legacy belum terhapus: ${removeError.message}`);
    }
    console.log(`${item.booking_id}: migrated -> ${objectPath}`);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    await supabase.from('payment_proof_migration_queue').update({ status: 'failed' }).eq('booking_id', item.booking_id);
    console.error(`${item.booking_id}: gagal - ${message}`);
  }
}
