
import { createClient } from './client';

/**
 * Uploads a file to Supabase storage
 * @param bucket Bucket name (e.g., 'avatars')
 * @param path Path within bucket (e.g., 'userId/avatar.png')
 * @param file File object or Blob
 */
export async function uploadFile(bucket: string, path: string, file: File | Blob) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    console.error(`Upload error to ${bucket}:`, error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Specialized helper to upload user avatars
 */
export async function uploadAvatar(userId: string, file: File | Blob) {
  const extension = (file as File).name?.split('.').pop() || 'png';
  const fileName = `${userId}-${Date.now()}.${extension}`;
  const path = `${userId}/${fileName}`;
  
  return uploadFile('avatars', path, file);
}
