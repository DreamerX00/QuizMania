import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const form = new formidable.IncomingForm({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  form.parse(req, (err: any, fields: any, files: any) => {
    if (err) return res.status(400).json({ error: 'Upload failed' });
    const file = files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
    const fileName = path.basename(filePath);
    const url = `/uploads/${fileName}`;
    res.status(200).json({ url });
  });
} 