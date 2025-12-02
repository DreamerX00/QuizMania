import { ZodTypeAny, z } from "zod";
import validator from "validator";
import { NextRequest, NextResponse } from "next/server";

// Recursively sanitize all string fields in an object
export function sanitizeObject<T>(obj: T, parentKey: string | null = null): T {
  if (typeof obj === "string") {
    // Do not escape if the key is avatarUrl or bannerUrl
    if (parentKey === "avatarUrl" || parentKey === "bannerUrl") {
      return obj as T;
    }
    return validator.escape(obj) as T;
  } else if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, parentKey)) as T;
  } else if (typeof obj === "object" && obj !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(
        (obj as Record<string, unknown>)[key],
        key
      );
    }
    return sanitized as T;
  }
  return obj;
}

// Standardized error response
function validationError(details: Array<{ field: string; message: string }>) {
  return NextResponse.json(
    {
      status: "error",
      code: "VALIDATION_ERROR",
      message: "One or more fields failed validation",
      details,
    },
    { status: 400 }
  );
}

// Middleware for Next.js API routes (App Router)
export function withValidation<T extends ZodTypeAny>(
  schema: T,
  handler: (
    request: NextRequest & { validated: z.infer<T> },
    ...args: unknown[]
  ) => Promise<Response> | Response
) {
  return async (
    request: NextRequest,
    ...args: unknown[]
  ): Promise<Response> => {
    let data: Record<string, unknown> = {};
    try {
      if (request.method === "GET") {
        // For GET, use query params
        const url = new URL(request.url);
        data = Object.fromEntries(url.searchParams.entries());
      } else {
        // For POST, PUT, PATCH, etc., use body
        data = await request.json();
      }
    } catch {
      return validationError([
        { field: "body", message: "Invalid JSON or query" },
      ]);
    }
    // Validate
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return validationError(details);
    }
    // Sanitize
    const sanitized = sanitizeObject(result.data);
    // Attach sanitized data to request (for handler)
    const requestWithValidation = request as NextRequest & {
      validated: z.infer<T>;
    };
    requestWithValidation.validated = sanitized as z.infer<T>;
    return handler(requestWithValidation, ...args);
  };
}
