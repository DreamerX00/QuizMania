# Validation & Sanitization Guide

## Introduction

This document details the comprehensive, world-class input validation and sanitization upgrade performed on the QuizMania Node.js/Next.js backend APIs. It serves as a reference and onboarding guide for developers, security auditors, and maintainers.

## Project Context

QuizMania is a modern quiz and multiplayer gaming platform with a large, modular backend API surface. The project handles sensitive user data, payments, multiplayer interactions, and community features, making robust input validation and sanitization critical for security, stability, and data integrity.

## High-Level Goals

- **Security:** Prevent injection, XSS, and other attacks by strictly validating and sanitizing all user input.
- **Stability:** Ensure only well-formed, expected data enters the system, reducing runtime errors and data corruption.
- **Data Integrity:** Enforce business rules and data contracts at the API boundary.
- **Developer Experience:** Centralize and standardize validation logic for maintainability and onboarding.

---

**The following sections will cover:**
- Why this upgrade was necessary
- The tools and patterns used (Zod, withValidation, sanitization)
- Step-by-step process for upgrading endpoints
- How to maintain and extend validation going forward
- Example patterns and anti-patterns
- FAQ and troubleshooting 

## Why This Upgrade Was Necessary

### Risks of Insufficient Validation
- **Security Vulnerabilities:** Without strict validation, APIs are vulnerable to injection attacks (SQL, NoSQL, command), XSS, privilege escalation, and data exfiltration.
- **Data Corruption:** Malformed or unexpected input can corrupt the database, break business logic, or cause cascading failures.
- **Stability Issues:** Unchecked input can trigger runtime errors, crashes, or denial-of-service conditions.
- **Compliance:** Modern privacy and security standards (GDPR, PCI DSS, etc.) require robust input validation and auditability.

### Real-World Threats
- Attackers may submit malicious payloads to exploit weak endpoints.
- Automated bots can spam, brute-force, or abuse APIs if input is not strictly checked.
- Even trusted clients can send buggy or outdated data, leading to subtle bugs and data loss.

### Motivation for a World-Class Approach
- **Proactive Security:** Prevent issues before they reach production or users.
- **Consistency:** Enforce the same high standards across all modules and teams.
- **Future-Proofing:** Make the codebase resilient to new features, contributors, and evolving threat models.
- **Developer Onboarding:** Lower the learning curve and reduce mistakes by providing clear, centralized patterns.

--- 

## Tools and Patterns Used

### Zod (Schema Validation)
- **What:** Zod is a TypeScript-first schema declaration and validation library.
- **Why:**
  - Strong typing and inference for both runtime and compile-time safety.
  - Expressive, composable schemas for complex/nested data.
  - Clear, actionable error messages for clients and developers.
- **How:**
  - Every mutating endpoint (POST, PUT, PATCH, DELETE) now defines a Zod schema for all expected input (body, params, query).
  - Schemas enforce type, format, length, and business rules.

### withValidation Utility
- **What:** A custom utility that wraps API handlers, automatically validating input against a Zod schema before business logic runs.
- **Why:**
  - Centralizes validation logic for consistency and maintainability.
  - Ensures all endpoints return standardized error responses for invalid input.
  - Prevents accidental bypass of validation by developers.
- **How:**
  - All mutating handlers are now exported as `withValidation(schema, handler)`.
  - Validated and sanitized input is injected as `request.validated`.

### Sanitization (validator.js, Zod transforms)
- **What:** Sanitization ensures that even valid data is safe for storage and display (e.g., trimming, escaping, normalizing).
- **Why:**
  - Prevents XSS, injection, and data pollution.
  - Ensures consistent formatting (e.g., trimming whitespace, lowercasing emails).
- **How:**
  - Zod schemas use `.trim()`, `.toLowerCase()`, `.max()`, and custom transforms.
  - For advanced cases, `validator.js` is used for escaping, normalizing, and cleaning strings.
  - The `sanitizeObject` utility is available for deep sanitization of objects.

--- 

## Step-by-Step Process: How the Upgrade Was Done

### 1. Codebase Audit
- Enumerated all API endpoint files and directories (including nested and dynamic routes).
- Identified all mutating endpoints (POST, PUT, PATCH, DELETE) and high-risk GET endpoints.
- Created a comprehensive status table to track validation coverage.

### 2. Validation & Sanitization Upgrade
- For each mutating endpoint:
  - Audited the code for missing or insufficient validation/sanitization.
  - Added or confirmed a Zod schema for all user input (body, params, query).
  - Wrapped the handler with the `withValidation` utility.
  - Ensured all string fields were sanitized (trimmed, escaped, normalized) as appropriate.
  - Preserved all existing business logic and error handling.
  - Returned standardized error responses for invalid input.
- Special cases (e.g., webhooks, legacy endpoints) were handled with custom schemas and deep sanitization.

### 3. Batch Processing & Confirmation
- Processed endpoints in logical batches (by module or risk level).
- After each batch, confirmed with the project owner and updated the status table.
- Repeated the process until all mutating/high-risk endpoints were upgraded.

### 4. Final Audit Sweep
- Performed a full codebase search for all POST, PUT, PATCH, and DELETE handlers.
- Verified that every mutating endpoint uses Zod and `withValidation`.
- Ensured no endpoints were missed, including obscure, legacy, or newly added files.

### 5. Status Table Example

| Endpoint File/Path                                      | Method(s)         | Validation Status | Notes/Action Needed                |
|---------------------------------------------------------|-------------------|------------------|------------------------------------|
| `/api/clans/[id]/route.ts`                             | PATCH             | 🟢 Done          | Now uses Zod + withValidation      |
| `/api/rooms/members/route.ts`                          | DELETE            | 🟢 Done          | Now uses Zod + withValidation      |
| `/api/friends/requests/route.ts`                       | POST              | 🟢 Done          | Now uses Zod + withValidation      |
| `/api/quizzes/templates/[quizId]/route.ts`             | DELETE            | 🟢 Done          | Now uses Zod + withValidation      |
| `/api/quizzes/templates/[quizId]/unpublish/route.ts`   | PATCH             | 🟢 Done          | Now uses Zod + withValidation      |
| `/api/rooms/[id]/lock/route.ts`                        | PATCH             | 🟢 Done          | Now uses Zod + withValidation      |
| `/api/rooms/[id]/quiz-type/route.ts`                   | PATCH             | 🟢 Done          | Now uses Zod + withValidation      |

--- 

## How to Maintain and Extend Validation

### For New Endpoints
- **Always define a Zod schema** for all user input (body, params, query) in any mutating endpoint.
- **Wrap the handler with `withValidation(schema, handler)`** to enforce validation and standardized error handling.
- **Sanitize all string fields** using Zod transforms (e.g., `.trim()`, `.toLowerCase()`) and, if needed, `validator.js` for escaping/normalizing.
- **Return clear error messages** for invalid input, but avoid leaking sensitive details.

### For Existing Endpoints
- **Audit regularly:** Use codebase search to ensure all mutating endpoints are covered.
- **Refactor legacy code:** Upgrade any direct `request.json()` or unchecked input to use Zod and `withValidation`.
- **Review schemas:** Ensure they are as strict as possible (e.g., min/max lengths, allowed values, regex for emails/IDs).

### Onboarding & Code Review
- **Require validation in PRs:** All new mutating endpoints must use Zod and `withValidation`.
- **Check for sanitization:** Ensure all user-facing strings are sanitized before storage or display.
- **Document schemas:** Use comments and examples to clarify complex validation logic.
- **Encourage reuse:** Share common schemas and patterns across modules.

### Automation
- **Linting/CI:** Consider adding custom lint rules or CI checks to flag endpoints missing validation.
- **Testing:** Write tests for both valid and invalid input cases to ensure schemas are enforced.

--- 

## Example Patterns and Anti-Patterns

### ✅ Good Pattern: Centralized Validation
```ts
const createQuizSchema = z.object({
  title: z.string().min(3).max(100).trim(),
  description: z.string().max(1000).optional().trim(),
  tags: z.array(z.string().trim()).optional(),
  imageUrl: z.string().url().optional(),
});

export const POST = withValidation(createQuizSchema, async (request: any) => {
  const { title, description, tags, imageUrl } = request.validated;
  // ... business logic ...
});
```

### ❌ Anti-Pattern: Unchecked Input
```ts
export async function POST(request: NextRequest) {
  const { title, description } = await request.json(); // No validation!
  // ... business logic ...
}
```

### ✅ Good Pattern: Sanitizing Strings
```ts
const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
});
```

### ❌ Anti-Pattern: Accepting Raw Strings
```ts
const schema = z.object({
  name: z.string(), // No min/max/trim
  email: z.string(), // No email validation
});
```

### ✅ Good Pattern: Validating Params and Query
```ts
const paramsSchema = z.object({ id: z.string().uuid() });
export const GET = withValidation(paramsSchema, async (request, { params }) => {
  // ...
});
```

--- 

## FAQ and Troubleshooting

### Q: Why am I getting a 400 error with a Zod validation message?
- **A:** The input you sent does not match the expected schema. Check the error details in the response for which field is invalid or missing.

### Q: How do I add validation to a new endpoint?
- **A:**
  1. Define a Zod schema for all input.
  2. Wrap your handler with `withValidation(schema, handler)`.
  3. Access validated input via `request.validated`.

### Q: How do I sanitize custom or deeply nested objects?
- **A:** Use Zod transforms for simple cases. For deep or custom sanitization, use the `sanitizeObject` utility or `validator.js` functions inside a `.transform()`.

### Q: Can I reuse schemas across endpoints?
- **A:** Yes! Export common schemas from a shared module and import them where needed.

### Q: What if I need to allow some fields to be optional?
- **A:** Use `.optional()` in your Zod schema, but always validate type and format for any present fields.

### Debugging Tips
- **Check the schema:** Make sure it matches the expected input shape and constraints.
- **Log errors:** Use `console.error` for unexpected issues, but avoid leaking sensitive data.
- **Test edge cases:** Try sending invalid, missing, or extra fields to ensure your schema is strict.
- **Review error responses:** Zod errors are descriptive—use them to guide client-side fixes.

--- 

## Summary and Next Steps

- **All mutating and high-risk endpoints** in the QuizMania backend now use world-class input validation and sanitization.
- **Zod schemas and the withValidation utility** are enforced everywhere, ensuring security, stability, and data integrity.
- **Sanitization** is applied to all user-facing strings, preventing XSS and data pollution.
- **Status tables and audit sweeps** ensure no endpoint is missed, and onboarding is streamlined for new developers.

### Next Steps for the Team
- **Maintain the standard:** Require Zod + withValidation for all new mutating endpoints.
- **Audit regularly:** Use codebase search and status tables to ensure ongoing coverage.
- **Automate checks:** Add lint/CI rules to flag missing validation.
- **Share knowledge:** Use this guide for onboarding and code review.
- **Stay up to date:** Monitor best practices in validation/sanitization and update schemas/utilities as needed.

---

**For questions, improvements, or to report issues, contact the backend maintainers or refer to this guide.** 

## Simulation: SQL Injection Attack (Before and After)

### Scenario: Old Logic (No Validation)
Suppose we have an endpoint to fetch a user by email:

```ts
// ❌ Old, vulnerable code
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  // Directly interpolates user input into a query (bad!)
  const user = await prisma.user.findFirst({ where: { email } });
  return NextResponse.json(user);
}
```

#### Step-by-Step Attack
1. **Attacker sends:**
   ```json
   { "email": "anything' OR '1'='1" }
   ```
2. **Backend executes:**
   ```sql
   SELECT * FROM user WHERE email = 'anything' OR '1'='1';
   ```
3. **Result:**
   - The query returns all users (or the first user), leaking data.
   - If used in an UPDATE/DELETE, could corrupt or erase data.

#### Real-World Impact
- Data leakage, privilege escalation, or even full database compromise.

---

### Scenario: New Logic (Zod + withValidation)

```ts
// ✅ Secure, validated code
const schema = z.object({
  email: z.string().email().trim(),
});

export const POST = withValidation(schema, async (request: any) => {
  const { email } = request.validated;
  const user = await prisma.user.findFirst({ where: { email } });
  return NextResponse.json(user);
});
```

#### Step-by-Step Protection
1. **Attacker sends:**
   ```json
   { "email": "anything' OR '1'='1" }
   ```
2. **Zod validation runs:**
   - Checks if the input is a valid email address.
   - Input fails validation (not a valid email), request is rejected **before** any DB query.
3. **Response:**
   ```json
   { "error": [ { "message": "Invalid email address" } ] }
   ```
4. **Result:**
   - No query is run, no data is leaked, and the attack is blocked at the API boundary.

---

**Takeaway:**
- **Old logic:** Accepts and executes dangerous input, exposing the database.
- **New logic:** Strictly validates and sanitizes input, blocking attacks before they reach business logic or the database. 

## Simulation: XSS (Cross-Site Scripting) Attack (Before and After)

### Scenario: Old Logic (No Sanitization)
Suppose we have an endpoint to post a comment:

```ts
// ❌ Old, vulnerable code
export async function POST(request: NextRequest) {
  const { comment } = await request.json();
  await prisma.comment.create({ data: { comment } });
  return NextResponse.json({ success: true });
}
```

#### Step-by-Step Attack
1. **Attacker sends:**
   ```json
   { "comment": "<script>alert('XSS')</script>" }
   ```
2. **Backend stores:**
   - The raw string, including the `<script>` tag, is saved in the database.
3. **Frontend displays:**
   - When the comment is rendered, the script executes in users' browsers.
4. **Result:**
   - Any user viewing the comment runs the attacker's script (stealing cookies, session, etc.).

#### Real-World Impact
- Account takeover, data theft, or malware delivery to users.

---

### Scenario: New Logic (Zod + Sanitization)

```ts
// ✅ Secure, sanitized code
import validator from 'validator';
const schema = z.object({
  comment: z.string().max(1000).trim().transform((val) => validator.escape(val)),
});

export const POST = withValidation(schema, async (request: any) => {
  const { comment } = request.validated;
  await prisma.comment.create({ data: { comment } });
  return NextResponse.json({ success: true });
});
```

#### Step-by-Step Protection
1. **Attacker sends:**
   ```json
   { "comment": "<script>alert('XSS')</script>" }
   ```
2. **Zod validation and sanitization runs:**
   - The input is trimmed and all HTML special characters are escaped (e.g., `<` becomes `&lt;`).
3. **Backend stores:**
   - The sanitized string is saved, e.g., `&lt;script&gt;alert('XSS')&lt;/script&gt;`.
4. **Frontend displays:**
   - The comment is shown as plain text, not as executable code.
5. **Result:**
   - No script runs, and users are safe from XSS.

---

**Takeaway:**
- **Old logic:** Stores and serves raw, dangerous input, enabling XSS.
- **New logic:** Sanitizes all user input, neutralizing scripts and protecting users. 

## Simulation: Mass Assignment Attack (Before and After)

### Scenario: Old Logic (No Field Whitelisting)
Suppose we have an endpoint to update a user profile:

```ts
// ❌ Old, vulnerable code
export async function PATCH(request: NextRequest) {
  const data = await request.json();
  // Directly spreads all input fields into the update (bad!)
  const updated = await prisma.user.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json(updated);
}
```

#### Step-by-Step Attack
1. **Attacker sends:**
   ```json
   { "id": "123", "role": "admin", "name": "Hacker" }
   ```
2. **Backend executes:**
   - All fields, including `role`, are updated in the database.
3. **Result:**
   - Attacker escalates their privileges to admin.

#### Real-World Impact
- Privilege escalation, data corruption, or unauthorized access.

---

### Scenario: New Logic (Zod + Explicit Field Selection)

```ts
// ✅ Secure, validated code
const schema = z.object({
  id: z.string().min(1),
  name: z.string().max(100).trim().optional(),
  // Only allow fields that should be updatable
});

export const PATCH = withValidation(schema, async (request: any) => {
  const { id, name } = request.validated;
  const updated = await prisma.user.update({
    where: { id },
    data: { name }, // Only allowed fields
  });
  return NextResponse.json(updated);
});
```

#### Step-by-Step Protection
1. **Attacker sends:**
   ```json
   { "id": "123", "role": "admin", "name": "Hacker" }
   ```
2. **Zod validation runs:**
   - Only `id` and `name` are accepted; `role` is ignored/rejected.
3. **Backend executes:**
   - Only allowed fields are updated; `role` remains unchanged.
4. **Result:**
   - No privilege escalation or unauthorized changes.

---

**Takeaway:**
- **Old logic:** Accepts and updates all fields, exposing sensitive properties.
- **New logic:** Explicitly whitelists allowed fields, blocking mass assignment attacks. 

## Simulation: Type Confusion / Deserialization Attack (Before and After)

### Scenario: Old Logic (No Type Checking)
Suppose we have an endpoint to update user settings:

```ts
// ❌ Old, vulnerable code
export async function PATCH(request: NextRequest) {
  const { notifications } = await request.json();
  // Expects notifications to be a boolean
  const updated = await prisma.user.update({
    where: { id: '123' },
    data: { notifications },
  });
  return NextResponse.json(updated);
}
```

#### Step-by-Step Attack
1. **Attacker sends:**
   ```json
   { "notifications": { "$gt": "" } }
   ```
2. **Backend executes:**
   - The value is not a boolean, but an object. Depending on the ORM/DB, this could cause:
     - Silent failure, data corruption, or even query manipulation (NoSQL injection).
3. **Result:**
   - Unexpected behavior, possible privilege escalation or bypass of business logic.

#### Real-World Impact
- NoSQL injection, logic bypass, or application crashes.

---

### Scenario: New Logic (Zod Type Enforcement)

```ts
// ✅ Secure, validated code
const schema = z.object({
  notifications: z.boolean(),
});

export const PATCH = withValidation(schema, async (request: any) => {
  const { notifications } = request.validated;
  const updated = await prisma.user.update({
    where: { id: '123' },
    data: { notifications },
  });
  return NextResponse.json(updated);
});
```

#### Step-by-Step Protection
1. **Attacker sends:**
   ```json
   { "notifications": { "$gt": "" } }
   ```
2. **Zod validation runs:**
   - Input fails validation (not a boolean), request is rejected.
3. **Response:**
   ```json
   { "error": [ { "message": "Expected boolean, received object" } ] }
   ```
4. **Result:**
   - No update is performed, and the attack is blocked.

---

**Takeaway:**
- **Old logic:** Accepts any type, enabling type confusion, logic bugs, or injection.
- **New logic:** Strictly enforces types, blocking deserialization and type confusion attacks. 

## Simulation: Path Traversal Attack (Before and After)

### Scenario: Old Logic (No Path Validation)
Suppose we have an endpoint to download a file by filename:

```ts
// ❌ Old, vulnerable code
export async function GET(request: NextRequest) {
  const { filename } = request.nextUrl.searchParams;
  // Directly uses user input in file path (bad!)
  const filePath = `/uploads/${filename}`;
  return NextResponse.sendFile(filePath);
}
```

#### Step-by-Step Attack
1. **Attacker sends:**
   ```http
   GET /api/download?filename=../../../../etc/passwd
   ```
2. **Backend executes:**
   - Constructs the path `/uploads/../../../../etc/passwd` and attempts to read it.
3. **Result:**
   - Sensitive system files may be exposed to the attacker.

#### Real-World Impact
- Data leakage, system compromise, or exposure of credentials/configs.

---

### Scenario: New Logic (Zod + Path Whitelisting)

```ts
// ✅ Secure, validated code
const schema = z.object({
  filename: z.string().regex(/^[a-zA-Z0-9_.-]+$/), // Only allow safe filenames
});

export const GET = withValidation(schema, async (request: any) => {
  const { filename } = request.validated;
  const filePath = `/uploads/${filename}`;
  return NextResponse.sendFile(filePath);
});
```

#### Step-by-Step Protection
1. **Attacker sends:**
   ```http
   GET /api/download?filename=../../../../etc/passwd
   ```
2. **Zod validation runs:**
   - Input fails regex check (only safe filenames allowed), request is rejected.
3. **Response:**
   ```json
   { "error": [ { "message": "Invalid filename format" } ] }
   ```
4. **Result:**
   - No file is read, and the attack is blocked.

---

**Takeaway:**
- **Old logic:** Accepts arbitrary paths, enabling traversal and data leakage.
- **New logic:** Strictly validates filenames, blocking path traversal attacks. 

## Simulation: Business Logic Bypass (Before and After)

### Scenario: Old Logic (No Business Rule Validation)
Suppose we have an endpoint to create a product with a price:

```ts
// ❌ Old, vulnerable code
export async function POST(request: NextRequest) {
  const { name, price } = await request.json();
  // No check for negative or zero price
  const product = await prisma.product.create({ data: { name, price } });
  return NextResponse.json(product);
}
```

#### Step-by-Step Attack
1. **Attacker sends:**
   ```json
   { "name": "Freebie", "price": -100 }
   ```
2. **Backend executes:**
   - Product is created with a negative price.
3. **Result:**
   - Attacker can exploit the system (e.g., get paid to buy products, break accounting).

#### Real-World Impact
- Financial loss, accounting errors, or abuse of business logic.

---

### Scenario: New Logic (Zod + Business Rule Enforcement)

```ts
// ✅ Secure, validated code
const schema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().min(0.01), // Enforce positive price
});

export const POST = withValidation(schema, async (request: any) => {
  const { name, price } = request.validated;
  const product = await prisma.product.create({ data: { name, price } });
  return NextResponse.json(product);
});
```

#### Step-by-Step Protection
1. **Attacker sends:**
   ```json
   { "name": "Freebie", "price": -100 }
   ```
2. **Zod validation runs:**
   - Input fails `.min(0.01)` check, request is rejected.
3. **Response:**
   ```json
   { "error": [ { "message": "Number must be greater than or equal to 0.01" } ] }
   ```
4. **Result:**
   - No product is created, and the attack is blocked.

---

**Takeaway:**
- **Old logic:** Allows business rule bypass, leading to financial or logical errors.
- **New logic:** Strictly enforces business rules at the API boundary, blocking abuse. 