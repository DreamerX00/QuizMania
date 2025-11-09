import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { schemaName, version } = req.body;
  if (!schemaName || !version) return res.status(400).json({ error: 'Missing schemaName or version' });
  // TODO: Implement file-based rollback
  return res.status(200).json({ success: true, message: `Rollback to ${version} for ${schemaName} (stub)` });
} 
