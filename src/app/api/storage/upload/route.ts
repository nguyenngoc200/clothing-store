import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'images';

    if (!file) {
      return ApiResponse.badRequest('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return ApiResponse.badRequest('Invalid file type. Only images are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return ApiResponse.badRequest('File size exceeds 5MB limit');
    }

    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomString}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return ApiResponse.error({ message: error.message, error });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!)
      .getPublicUrl(data.path);

    return ApiResponse.success({
      path: data.path,
      publicUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
