import { NextResponse } from 'next/server';

const codeMap: Record<number, string> = {
  400: 'BAD_REQUEST',
  404: 'NOT_FOUND',
  500: 'INTERNAL_ERROR',
};

export function apiError(status: number, message: string, err?: unknown): NextResponse {
  console.error(`[API ${status}] ${message}`, err instanceof Error ? err.message : err);
  return NextResponse.json(
    { error: message, code: codeMap[status] ?? 'UNKNOWN_ERROR' },
    { status }
  );
}
