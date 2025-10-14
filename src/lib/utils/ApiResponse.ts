import type { Metadata } from 'next';
import { NextResponse } from 'next/server';

type ErrorResponseOptions = {
  message?: string;
  status?: number;
  error?: unknown;
  metadata?: Record<string, Metadata>;
  [key: string]: unknown;
};

export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }

  static error({
    message = 'Internal server error',
    status = 500,
    error = null,
    metadata = {},
    ...rest
  }: ErrorResponseOptions = {}) {
    // Log error in development
    if (process.env.NODE_ENV === 'development' && error) {
      console.error(`[API Error ${status}]`, { message, error });
    }

    return NextResponse.json(
      {
        success: false,
        message,
        ...metadata,
        ...rest,
      },
      { status },
    );
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error({ message, status: 401 });
  }

  static forbidden(message = 'Forbidden') {
    return this.error({ message, status: 403 });
  }

  static notFound(message = 'Resource not found') {
    return this.error({ message, status: 404 });
  }

  static badRequest(message = 'Bad request', metadata?: Record<string, Metadata>) {
    return this.error({ message, status: 400, metadata });
  }

  static conflict(message = 'Conflict', metadata?: Record<string, Metadata>) {
    return this.error({
      message,
      status: 409,
      metadata,
      error: {
        code: 'CONFLICT',
        message: 'The request conflicts with the current state of the server',
      },
    });
  }
}
