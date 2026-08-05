import { supabase } from './supabase';

const BUCKET_NAME = 'elika-assets';
const HOMEPAGE_THUMBNAIL_MAX_BYTES = 1_000_000;
const HOMEPAGE_THUMBNAIL_MAX_DIMENSION = 1920;
const HOMEPAGE_THUMBNAIL_MIN_DIMENSION = 768;
const HOMEPAGE_THUMBNAIL_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export interface HomepageThumbnailUploadResult {
  url: string;
  originalBytes: number;
  uploadedBytes: number;
  compressed: boolean;
}

interface EncodedHomepageThumbnail {
  blob: Blob;
  compressed: boolean;
}

function asciiAt(bytes: Uint8Array, offset: number, value: string) {
  return Array.from(value).every(
    (character, index) => bytes[offset + index] === character.charCodeAt(0)
  );
}

async function inspectHomepageThumbnail(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  if (file.type === 'image/jpeg') {
    return { valid: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff, animated: false };
  }

  if (file.type === 'image/png') {
    const valid = bytes.length >= 8
      && bytes[0] === 0x89
      && asciiAt(bytes, 1, 'PNG')
      && bytes[4] === 0x0d
      && bytes[5] === 0x0a
      && bytes[6] === 0x1a
      && bytes[7] === 0x0a;
    if (!valid) return { valid: false, animated: false };

    for (let offset = 8; offset + 12 <= bytes.length;) {
      const chunkLength = view.getUint32(offset);
      const chunkType = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
      if (chunkType === 'acTL') return { valid: true, animated: true };
      if (chunkType === 'IDAT' || chunkType === 'IEND') break;
      offset += 12 + chunkLength;
    }
    return { valid: true, animated: false };
  }

  const valid = bytes.length >= 12 && asciiAt(bytes, 0, 'RIFF') && asciiAt(bytes, 8, 'WEBP');
  if (!valid) return { valid: false, animated: false };

  for (let offset = 12; offset + 8 <= bytes.length;) {
    const chunkType = String.fromCharCode(...bytes.slice(offset, offset + 4));
    const chunkLength = view.getUint32(offset + 4, true);
    if (chunkType === 'ANIM' || chunkType === 'ANMF') {
      return { valid: true, animated: true };
    }
    offset += 8 + chunkLength + (chunkLength % 2);
  }
  return { valid: true, animated: false };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('File gambar tidak dapat dibaca.'));
    };
    image.src = objectUrl;
  });
}

function dimensionsWithin(width: number, height: number, longestSide: number) {
  const scale = Math.min(1, longestSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function encodeWebp(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      reject(new Error('Browser tidak mendukung optimasi gambar.'));
      return;
    }

    // Drawing the decoded image preserves its displayed EXIF orientation and
    // aspect ratio. WebP also retains PNG/WebP alpha where one is present.
    context.drawImage(image, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== 'image/webp') {
        reject(new Error('Browser tidak mendukung kompresi WebP.'));
        return;
      }
      resolve(blob);
    }, 'image/webp', quality);
  });
}

/**
 * Optimize one of the three homepage service thumbnails without cropping it.
 * Files already within the limit are returned byte-for-byte unchanged.
 */
async function optimizeHomepageThumbnail(file: File): Promise<EncodedHomepageThumbnail> {
  if (!HOMEPAGE_THUMBNAIL_TYPES.has(file.type)) {
    throw new Error('Thumbnail hanya mendukung file JPEG, PNG, atau WebP. SVG dan gambar animasi tidak didukung.');
  }

  const inspection = await inspectHomepageThumbnail(file);
  if (!inspection.valid) {
    throw new Error('Isi file tidak sesuai dengan format JPEG, PNG, atau WebP yang dipilih.');
  }
  if (inspection.animated) {
    throw new Error('Thumbnail animasi tidak didukung. Gunakan gambar JPEG, PNG, atau WebP statis.');
  }

  if (file.size <= HOMEPAGE_THUMBNAIL_MAX_BYTES) {
    return { blob: file, compressed: false };
  }

  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) {
    throw new Error('Dimensi gambar tidak valid.');
  }

  const normalQualities = [0.92, 0.90, 0.88, 0.86, 0.84];
  let longestSide = Math.min(
    HOMEPAGE_THUMBNAIL_MAX_DIMENSION,
    Math.max(sourceWidth, sourceHeight)
  );
  let dimensions = dimensionsWithin(sourceWidth, sourceHeight, longestSide);
  let latestBlob: Blob | null = null;

  // Keep the highest normal quality that satisfies the byte limit.
  for (const quality of normalQualities) {
    latestBlob = await encodeWebp(image, dimensions.width, dimensions.height, quality);
    if (latestBlob.size <= HOMEPAGE_THUMBNAIL_MAX_BYTES) {
      return { blob: latestBlob, compressed: true };
    }
  }

  // Prefer reducing dimensions gradually over pushing quality below 0.84.
  while (longestSide > HOMEPAGE_THUMBNAIL_MIN_DIMENSION) {
    longestSide = Math.max(
      HOMEPAGE_THUMBNAIL_MIN_DIMENSION,
      Math.floor(longestSide * 0.9)
    );
    dimensions = dimensionsWithin(sourceWidth, sourceHeight, longestSide);
    for (const quality of normalQualities) {
      latestBlob = await encodeWebp(image, dimensions.width, dimensions.height, quality);
      if (latestBlob.size <= HOMEPAGE_THUMBNAIL_MAX_BYTES) {
        return { blob: latestBlob, compressed: true };
      }
    }
  }

  // The 768px long edge remains sharp for the homepage card at roughly 2x.
  // Only exceptionally complex images reach this lower-quality fallback.
  for (let quality = 0.80; quality >= 0.08; quality -= 0.04) {
    latestBlob = await encodeWebp(image, dimensions.width, dimensions.height, quality);
    if (latestBlob.size <= HOMEPAGE_THUMBNAIL_MAX_BYTES) {
      return { blob: latestBlob, compressed: true };
    }
  }

  throw new Error('Gambar terlalu kompleks untuk dioptimalkan hingga 1 MB. Silakan pilih gambar lain.');
}

/**
 * Compress an image file on the client side before uploading.
 * Resizes to max 1200px dimension and compresses to JPEG.
 */
function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback: return original file as blob
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Upload a single image file to Supabase Storage.
 * Compresses the image before uploading.
 * 
 * @param file - The File object from an input[type=file]
 * @param folder - Subfolder inside the bucket (e.g. 'dresses', 'gallery', 'decor', 'makeup', 'settings')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  // Compress the image first
  const compressed = await compressImage(file);

  // Generate unique filename
  const timestamp = Date.now();
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  const filePath = `${folder}/${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, compressed, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    if (error.message?.includes('Bucket not found')) {
      throw new Error(
        `Bucket "elika-assets" tidak ditemukan di Supabase.\n\n` +
        `Silakan buat bucket baru dengan nama "elika-assets" di dashboard Supabase Anda (Storage > New bucket) dan pastikan mencentang pilihan "Public".`
      );
    }
    throw new Error(`Gagal mengunggah gambar: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a Busana, Makeup, or Dekorasi homepage thumbnail with a strict 1 MB
 * object-size limit. Other upload flows intentionally continue using uploadImage.
 */
export async function uploadHomepageThumbnail(
  file: File,
  folder: string
): Promise<HomepageThumbnailUploadResult> {
  const optimized = await optimizeHomepageThumbnail(file);
  if (optimized.blob.size > HOMEPAGE_THUMBNAIL_MAX_BYTES) {
    throw new Error('Hasil optimasi thumbnail masih melebihi batas 1 MB.');
  }

  const timestamp = Date.now();
  const safeBaseName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase() || 'thumbnail';
  const extension = optimized.compressed
    ? 'webp'
    : file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'image';
  const filePath = `${folder}/${timestamp}-${safeBaseName}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, optimized.blob, {
      contentType: optimized.compressed ? 'image/webp' : file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    if (error.message?.includes('Bucket not found')) {
      throw new Error(
        `Bucket "elika-assets" tidak ditemukan di Supabase.\n\n` +
        `Silakan buat bucket baru dengan nama "elika-assets" di dashboard Supabase Anda (Storage > New bucket) dan pastikan mencentang pilihan "Public".`
      );
    }
    throw new Error(`Gagal mengunggah thumbnail: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    originalBytes: file.size,
    uploadedBytes: optimized.blob.size,
    compressed: optimized.compressed,
  };
}

/**
 * Upload multiple image files to Supabase Storage.
 * 
 * @param files - FileList from an input[type=file] with multiple attribute
 * @param folder - Subfolder inside the bucket
 * @returns Array of public URLs
 */
export async function uploadImages(files: FileList, folder: string): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;
    const url = await uploadImage(file, folder);
    urls.push(url);
  }

  return urls;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 * Extracts the storage path from the URL and removes the file.
 * 
 * @param publicUrl - The full public URL of the image
 */
export async function deleteImage(publicUrl: string): Promise<void> {
  // Skip deletion for external URLs (Unsplash, etc.) or local assets
  if (!publicUrl.includes(BUCKET_NAME)) {
    return;
  }

  // Extract path from public URL
  // URL format: https://<project>.supabase.co/storage/v1/object/public/elika-assets/<path>
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const filePath = publicUrl.substring(markerIndex + marker.length);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Gagal menghapus gambar dari storage:', error.message);
  }
}

/**
 * Get the public URL for a file path in the bucket.
 * 
 * @param path - The file path inside the bucket
 * @returns The public URL
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}
