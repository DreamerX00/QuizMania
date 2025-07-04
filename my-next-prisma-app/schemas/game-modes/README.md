# Game Mode Schemas

This directory contains versioned JSON schemas for all supported game modes.

## Structure
- Each schema is a JSON object describing the expected fields for a game mode.
- Schemas are versioned by directory (e.g., v1, v2).
- Use Zod for runtime validation in the backend.

## Example (v1/default.json)
```
{
  "question": { "type": "string" },
  "options": { "type": "array", "items": { "type": "string" } },
  "answer": { "type": "string" },
  "timeLimit": { "type": "number" }
}
```

## Adding/Updating Schemas
- Add new schemas in the appropriate version directory.
- To deprecate or rollback, move the schema to an archive or update the version flag.

## Validation
- The backend loads the schema and uses Zod to validate payloads.
- If a schema is missing or invalid, fallback to permissive validation (for dev only).

## Rollback
- To rollback, point the backend to a previous version or restore the previous schema file.

## Notes
- For production, consider adding a registry API for schema management.
- Keep schemas backward compatible when possible. 