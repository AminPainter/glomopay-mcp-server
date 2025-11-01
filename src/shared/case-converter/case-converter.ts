/* eslint-disable @typescript-eslint/no-explicit-any */

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Lowercase<T> ? T : `_${Lowercase<T>}`}${CamelToSnakeCase<U>}`
  : S;

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

export type ConvertKeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K] extends Array<infer U>
    ? Array<ConvertKeysToSnakeCase<U>>
    : T[K] extends Record<string, any>
    ? ConvertKeysToSnakeCase<T[K]>
    : T[K];
};

export type ConvertKeysToCamelCase<T> = {
  [K in keyof T as SnakeToCamelCase<string & K>]: T[K] extends Array<infer U>
    ? Array<ConvertKeysToCamelCase<U>>
    : T[K] extends Record<string, any>
    ? ConvertKeysToCamelCase<T[K]>
    : T[K];
};

/**
 * Recursively converts object keys from camelCase to snake_case.
 * Supports nested objects and arrays of objects.
 */
export function convertToSnakeCase<T>(input: T): any {
  const toSnakeCase = (key: string): string =>
    key.replace(/([A-Z])/g, "_$1").toLowerCase();

  const transform = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(transform);
    } else if (value && typeof value === "object") {
      return convertToSnakeCase(value);
    }
    return value;
  };

  // Handle top-level arrays
  if (Array.isArray(input)) {
    return input.map((item) => transform(item));
  }

  // Handle top-level objects
  if (input && typeof input === "object") {
    const result: Record<string, any> = {};
    for (const key in input as any) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const snakeKey = toSnakeCase(key);
        result[snakeKey] = transform((input as any)[key]);
      }
    }
    return result as ConvertKeysToSnakeCase<T>;
  }

  // Primitives are returned as-is
  return input;
}

/**
 * Recursively converts object keys from snake_case to camelCase.
 * Supports nested objects and arrays of objects.
 */
export function convertToCamelCase<T>(input: T): any {
  const toCamelCase = (key: string): string =>
    key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  const transform = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(transform);
    } else if (value && typeof value === "object") {
      return convertToCamelCase(value);
    }
    return value;
  };

  // Handle top-level arrays
  if (Array.isArray(input)) {
    return input.map((item) => transform(item));
  }

  // Handle top-level objects
  if (input && typeof input === "object") {
    const result: Record<string, any> = {};
    for (const key in input as any) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const camelKey = toCamelCase(key);
        result[camelKey] = transform((input as any)[key]);
      }
    }
    return result as ConvertKeysToCamelCase<T>;
  }

  // Primitives are returned as-is
  return input;
}
