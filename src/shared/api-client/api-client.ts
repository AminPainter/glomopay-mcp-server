// TODO: Add Types support using Generics
// TODO: Request level log toggle
// TODO: Have own config, do not extend axios
// TODO: Constructor should take anything that extends our own config

import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios';
import { ZodSchema } from 'zod';

import { convertToCamelCase, convertToSnakeCase } from '@/shared/case-converter/case-converter.module';

/**
 * Custom error class for API errors.
 * Includes additional context such as HTTP status code and error data.
 */
export class ApiError extends Error {
  public statusCode?: number;
  public data?: unknown;

  constructor(message: string, statusCode?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * The downstream Glomopay secret travels as a per-call Authorization header (never
 * stored on the axios instance). Strip it from the axios error's request config so it
 * can never end up in a log line or an error object serialized further up the stack.
 */
function scrubAuthorization(error: AxiosError): AxiosError {
  if (error.config?.headers) delete error.config.headers.Authorization;
  return error;
}

/**
 * A type alias for a custom error handler function.
 */
type TErrorHandler = (error: AxiosError) => void;

type TZodSchemaParam = ZodSchema | undefined | null;

/**
 * Extended interface for custom configuration options.
 */
interface IApiClientConfig extends AxiosRequestConfig {
  enableCaseConversion?: boolean;
}

/**
 * ApiClient provides a unified interface over the axios HTTP client
 * It centralizes error handling, supports custom error handlers
 * Enables optional response validation using Zod
 * Optionally converts request and response payloads between camelCase and snake_case
 * Logs request and response data for debugging
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private customErrorHandlers: { [status: number]: TErrorHandler };
  private enableCaseConversion: boolean;

  constructor(config: IApiClientConfig = {}, customErrorHandlers: { [statusCode: number]: TErrorHandler } = {}) {
    this.axiosInstance = axios.create(config);
    this.customErrorHandlers = customErrorHandlers;
    this.enableCaseConversion = config.enableCaseConversion || false;

    // Request interceptor for logging in development
    this.axiosInstance.interceptors.request.use(
      (request) => {
        //   if (import.meta.env.DEV) console.debug(`[ApiClient] Request: ${request.method?.toUpperCase()} ${request.url}`);
        return request;
      },
      (error) => Promise.reject(scrubAuthorization(error)),
    );

    // Response interceptor for centralized error handling and logging in development
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // if (import.meta.env.DEV) console.debug(`[ApiClient] Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        scrubAuthorization(error);

        if (error.response) {
          const statusCode = error.response.status;
          const errorData = error.response.data;
          const message =
            (errorData as { message?: string; error?: string } | undefined)?.message ||
            (errorData as { message?: string; error?: string } | undefined)?.error ||
            `Request failed with status ${statusCode}`;

          // Invoke custom error handler for the status code, if available.
          if (this.customErrorHandlers[statusCode]) this.customErrorHandlers[statusCode](error);

          return Promise.reject(new ApiError(message, statusCode, errorData));
        } else {
          console.error(`[ApiClient] Network/Unknown Error: ${error.message}`);
          return Promise.reject(new ApiError(error.message, undefined, undefined));
        }
      },
    );
  }

  /**
   * Validates the response data against an optional Zod schema.
   * @param data - The response data.
   * @param schema - Optional Zod schema for validation.
   * @param status - HTTP status code for context.
   * @returns Validated data.
   * @throws ApiError if validation fails.
   */
  private validateResponse(data: unknown, schema: ZodSchema) {
    const result = schema.safeParse(data);
    if (!result.success) throw new ApiError(`Response validation error: ${JSON.stringify(result.error.errors)}`, 500, data);
    return result.data;
  }

  /**
   * General method for making API requests.
   * @param method - HTTP method ('get', 'post', 'put', 'delete').
   * @param url - Endpoint URL.
   * @param data - Request payload (if applicable).
   * @param config - Additional Axios configuration.
   * @param schema - Optional Zod schema for response validation.
   * @returns The validated response data.
   */
  async request(method: THttpMethod, url: string, body?: unknown, schema?: TZodSchemaParam, config: AxiosRequestConfig = {}) {
    if (this.enableCaseConversion) {
      if (body && typeof body === 'object') body = convertToSnakeCase(body);
      if (config.params && typeof config.params === 'object') config.params = convertToSnakeCase(config.params);
    }
    let { data } = await this.axiosInstance.request({
      method,
      url,
      data: body,
      ...config,
    });
    data = this.enableCaseConversion && typeof data === 'object' ? convertToCamelCase(data) : data;
    return schema ? this.validateResponse(data, schema) : data;
  }

  async get(url: string, params?: Record<string, unknown>, schema?: TZodSchemaParam, config: AxiosRequestConfig = {}) {
    return this.request('GET', url, undefined, schema, { ...config, params });
  }

  async post(url: string, body: unknown = {}, schema?: TZodSchemaParam, config: AxiosRequestConfig = {}) {
    return this.request('POST', url, body, schema, config);
  }

  async put(url: string, body: unknown = {}, schema?: TZodSchemaParam, config: AxiosRequestConfig = {}) {
    return this.request('PUT', url, body, schema, config);
  }

  async patch(url: string, body: unknown = {}, schema?: TZodSchemaParam, config: AxiosRequestConfig = {}) {
    return this.request('PATCH', url, body, schema, config);
  }

  async delete(url: string, schema?: TZodSchemaParam, config: AxiosRequestConfig = {}) {
    return this.request('DELETE', url, undefined, schema, config);
  }
}
