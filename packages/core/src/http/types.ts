import type { AppError } from '../errors';

export interface HttpClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  retry?: {
    retries: number;
    factor?: number;
    minTimeoutMs?: number;
  };
  onError?(error: AppError, ctx: { url: string; init: RequestInit }): void;
}

export interface SchemaValidator<T> {
  parse(data: unknown): T;
}

export interface RequestOptions<TSchema = unknown> extends RequestInit {
  schema?: SchemaValidator<TSchema>;
  timeoutMs?: number;
  dedupeKey?: string;
}

export interface HttpClient {
  get<T = unknown>(url: string, options?: RequestOptions<T>): Promise<T>;
  post<T = unknown>(url: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  put<T = unknown>(url: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  patch<T = unknown>(url: string, body?: unknown, options?: RequestOptions<T>): Promise<T>;
  delete<T = unknown>(url: string, options?: RequestOptions<T>): Promise<T>;
}
