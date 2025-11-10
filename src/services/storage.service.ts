import PATHS from '@/constants/paths';
import type { SignedUrlsResponse, UploadResponse } from '@/types/storage';

export const storageService = {
  /**
   * Upload a file to Supabase Storage and get signed URL
   * @param file - File to upload
   * @param folder - Optional folder path (default: 'images')
   * @returns Upload response with signed URL for display
   */
  async uploadFile(file: File, folder: string = 'images'): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch(PATHS.STORAGE_UPLOAD, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Upload failed',
        };
      }

      // After upload success, get signed URL for the uploaded file
      if (result.success && result.data?.path) {
        const signedUrlResult = await this.createSignedUrls([result.data.path], 31536000); // 1 year

        if (signedUrlResult.success && signedUrlResult.data?.[0]?.signedUrl) {
          // Replace publicUrl with signedUrl
          result.data.publicUrl = signedUrlResult.data[0].signedUrl;
        }
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },

  /**
   * Create signed URLs for private files
   * @param paths - Array of file paths
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URLs response
   */
  async createSignedUrls(paths: string[], expiresIn: number = 3600): Promise<SignedUrlsResponse> {
    try {
      const response = await fetch(PATHS.STORAGE_SIGNED_URLS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paths, expiresIn }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to create signed URLs',
        };
      }

      return result;
    } catch (error) {
      console.error('Signed URLs error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create signed URLs',
      };
    }
  },
};
