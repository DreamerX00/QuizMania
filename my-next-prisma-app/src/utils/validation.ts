import { z, ZodTypeAny } from 'zod';
import validator from 'validator';
import { NextRequest, NextResponse } from 'next/server';

type SanitizableValue = string | number | boolean | null | undefined | SanitizableObject | SanitizableArray;
interface SanitizableObject {
  [key: string]: SanitizableValue;
}
interface SanitizableArray extends Array<SanitizableValue> {}

interface ValidationErrorDetail {
  field: string;
  message: string;
}

// Recursively sanitize all string fields in an object
export function sanitizeObject(obj: SanitizableValue, parentKey: string | null = null): SanitizableValue {
  if (typeof obj === 'string') {
    // Do not escape if the key is avatarUrl or bannerUrl
    if (parentKey === 'avatarUrl' || parentKey === 'bannerUrl') {
      return obj;
    }
    return validator.escape(obj);
  } else if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, parentKey));
  } else if (typeof obj === 'object' && obj !== null) {
    const sanitized: SanitizableObject = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject((obj as SanitizableObject)[key], key);
    }
    return sanitized;
  }
  return obj;
}

// Standardized error response
function validationError(details: ValidationErrorDetail[]) {
  return NextResponse.json({
    status: 'error',
    code: 'VALIDATION_ERROR',
    message: 'One or more fields failed validation',
    details,
  }, { status: 400 });
}

// Middleware for Next.js API routes (App Router)
export function withValidation<T extends ZodTypeAny>(
  schema: T,
  handler: (request: NextRequest, ...args: any[]) => Promise<Response> | Response
) {
  return async (request: NextRequest, ...args: any[]) => {
    let data: any = {};
    try {
      if (request.method === 'GET') {
        // For GET, use query params
        const url = new URL(request.url);
        data = Object.fromEntries(url.searchParams.entries());
      } else {
        // For POST, PUT, PATCH, etc., use body
        data = await request.json();
      }
    } catch (e) {
      return validationError([{ field: 'body', message: 'Invalid JSON or query' }]);
    }
    // Validate
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.errors.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return validationError(details);
    }
    // Sanitize
    const sanitized = sanitizeObject(result.data);
    // Attach sanitized data to request (for handler)
    (request as NextRequest & { validated: SanitizableValue }).validated = sanitized;
    return handler(request, ...args);
  };
} 