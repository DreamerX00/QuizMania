import { z } from 'zod';
import fs from 'fs';
import path from 'path';

function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  // Very basic converter for demo purposes
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
      shape[key] = z.array(z.string()); // Only string arrays for demo
      if (field.optional) shape[key] = shape[key].optional();
    }
  }
  return z.object(shape);
}

const schemaDir = path.join(__dirname, 'v1');
const defaultJson = JSON.parse(fs.readFileSync(path.join(schemaDir, 'default.json'), 'utf-8'));
const premiumJson = JSON.parse(fs.readFileSync(path.join(schemaDir, 'premium.json'), 'utf-8'));

const defaultSchema = jsonSchemaToZod(defaultJson);
const premiumSchema = jsonSchemaToZod(premiumJson);

// Test data
const validDefault = {
  question: 'What is 2+2?',
  options: ['2', '3', '4', '5'],
  answer: '4',
  timeLimit: 30
};

const validPremium = {
  question: 'What is the capital of France?',
  options: ['Paris', 'London', 'Berlin'],
  answer: 'Paris',
  timeLimit: 20,
  difficulty: 'hard',
  mediaUrl: 'https://example.com/image.png'
};

console.log('Default schema valid:', defaultSchema.safeParse(validDefault).success);
console.log('Premium schema valid:', premiumSchema.safeParse(validPremium).success); 