import { supabase } from './supabase';

const BUCKET_NAME = 'elika-assets';

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
