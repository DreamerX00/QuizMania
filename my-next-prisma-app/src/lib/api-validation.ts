import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

/**
 * API validation middleware
 * Validates request body, query params, and path params against Zod schemas
 */

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export interface ValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
> extends NextRequest {
  validatedBody?: TBody;
  validatedQuery?: TQuery;
  validatedParams?: TParams;
}

/**
 * Higher-order function that wraps API route handlers with validation
 *
 * @example
 * const createUserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email(),
 * });
 *
 * export const POST = withValidation(
 *   { body: createUserSchema },
 *   async (req) => {
 *     const { name, email } = req.validatedBody;
 *     // ... handler logic
 *   }
 * );
 */
export function withValidation<
  TBodySchema extends ZodSchema | undefined = undefined,
  TQuerySchema extends ZodSchema | undefined = undefined,
  TParamsSchema extends ZodSchema | undefined = undefined
>(
  schemas: {
    body?: TBodySchema;
    query?: TQuerySchema;
    params?: TParamsSchema;
  },
  handler: (
    req: ValidatedRequest<
      TBodySchema extends ZodSchema ? TBodySchema["_output"] : unknown,
      TQuerySchema extends ZodSchema ? TQuerySchema["_output"] : unknown,
      TParamsSchema extends ZodSchema ? TParamsSchema["_output"] : unknown
    >,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: Record<string, unknown>
  ): Promise<NextResponse> => {
    try {
      const validatedReq = req as ValidatedRequest<
        TBodySchema extends ZodSchema ? TBodySchema["_output"] : unknown,
        TQuerySchema extends ZodSchema ? TQuerySchema["_output"] : unknown,
        TParamsSchema extends ZodSchema ? TParamsSchema["_output"] : unknown
      >;

      // Validate request body
      if (schemas.body) {
        try {
          const body = await req.json();
          validatedReq.validatedBody = schemas.body.parse(body);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: "Invalid request body",
                details: error.errors.map((err) => ({
                  field: err.path.join("."),
                  message: err.message,
                })),
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }

      // Validate query parameters
      if (schemas.query) {
        try {
          const { searchParams } = new URL(req.url);
          const query = Object.fromEntries(searchParams.entries());
          validatedReq.validatedQuery = schemas.query.parse(query);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: "Invalid query parameters",
                details: error.errors.map((err) => ({
                  field: err.path.join("."),
                  message: err.message,
                })),
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }

      // Validate path parameters
      if (schemas.params && context?.params) {
        try {
          validatedReq.validatedParams = schemas.params.parse(context.params);
        } catch (error) {
          if (error instanceof ZodError) {
            return NextResponse.json(
              {
                error: "Invalid path parameters",
                details: error.errors.map((err) => ({
                  field: err.path.join("."),
                  message: err.message,
                })),
              },
              { status: 400 }
            );
          }
          throw error;
        }
      }

      // Call the actual handler with validated data
      return await handler(validatedReq, context);
    } catch (error) {
      console.error("API validation error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Validates request body only (most common use case)
 */
export function withBodyValidation<TSchema extends ZodSchema>(
  schema: TSchema,
  handler: (
    req: ValidatedRequest<TSchema["_output"]>,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return withValidation({ body: schema }, handler);
}

/**
 * Validates query parameters only
 */
export function withQueryValidation<TSchema extends ZodSchema>(
  schema: TSchema,
  handler: (
    req: ValidatedRequest<unknown, TSchema["_output"]>,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return withValidation({ query: schema }, handler);
}

/**
 * Validates path parameters only
 */
export function withParamsValidation<TSchema extends ZodSchema>(
  schema: TSchema,
  handler: (
    req: ValidatedRequest<unknown, unknown, TSchema["_output"]>,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return withValidation({ params: schema }, handler);
}

/**
 * Common validation patterns
 */
export const commonSchemas = {
  id: {
    params: z.object({
      id: z.string().min(1, "ID is required"),
    }),
  },
  pagination: {
    query: z.object({
      page: z.string().regex(/^\d+$/).transform(Number).default("1"),
      limit: z.string().regex(/^\d+$/).transform(Number).default("10"),
    }),
  },
  search: {
    query: z.object({
      q: z.string().min(1, "Search query is required"),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
  },
};

// Import zod for re-export
import { z } from "zod";
export { z };
