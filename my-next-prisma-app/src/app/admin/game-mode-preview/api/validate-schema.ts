import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const key in schema) {
    const field = schema[key];
    if (field.type === 'string') {
      shape[key] = z.string();
      if (field.optional) shape[key] = shape[key].optional();
    } else if (field.type === 'number') {
      shape[key] = z.number();
      if (field.optional) shape[key] = shape[key].optional();
    } else if (field.type === 'array') {
      shape[key] = z.array(z.string());
      if (field.optional) shape[key] = shape[key].optional();
    }
  }
  return z.object(shape);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { schema, data } = req.body;
  if (!schema || typeof schema !== 'object') return res.status(400).json({ error: 'Missing or invalid schema' });
  const zodSchema = jsonSchemaToZod(schema);
  const result = zodSchema.safeParse(data);
  if (result.success) {
    return res.status(200).json({ valid: true, data: result.data });
  } else {
    return res.status(200).json({ valid: false, errors: result.error.errors });
  }
} 