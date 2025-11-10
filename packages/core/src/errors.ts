export type AppErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'BAD_RESPONSE'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'VALIDATION'
  | 'UNKNOWN';

export interface AppError extends Error {
  code: AppErrorCode;
  status?: number;
  cause?: unknown;
  meta?: Record<string, unknown>;
}

export const createError = (
  code: AppErrorCode,
  message: string,
  details?: Partial<AppError>,
): AppError => {
  const error = new Error(message) as AppError;
  error.code = code;
  if (details?.status !== undefined) error.status = details.status;
  if (details?.cause !== undefined) error.cause = details.cause;
  if (details?.meta !== undefined) error.meta = details.meta;
  return error;
};

export const isAppError = (err: unknown): err is AppError => {
  return !!(
    err &&
    typeof err === 'object' &&
    'code' in err &&
    'message' in err
  );
};
