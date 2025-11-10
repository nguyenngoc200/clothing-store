// Types for storage service responses

export interface UploadResponse {
  success: boolean;
  data?: {
    path: string;
    publicUrl: string;
    fileName: string;
    size: number;
    type: string;
  };
  error?: string;
}

export interface SignedUrlsResponse {
  success: boolean;
  data?: Array<{
    path: string;
    signedUrl: string;
  }>;
  error?: string;
}
