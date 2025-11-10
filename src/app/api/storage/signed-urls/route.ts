import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

export async function POST(request: Request) {
  try {
    const { paths, expiresIn = 3600 } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return ApiResponse.badRequest('Invalid paths. Must be a non-empty array.');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME!)
      .createSignedUrls(paths, expiresIn);

    if (error) {
      console.error('Error creating signed URLs:', error);
      return ApiResponse.error({ message: error.message, error });
    }

    return ApiResponse.success(data);
  } catch (error) {
    console.error('Signed URLs error:', error);
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
