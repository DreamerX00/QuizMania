import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import formidable from "formidable";
import validator from "validator";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function sanitizeFileName(name: string) {
  // Remove dangerous characters and only allow safe filename
  return validator.whitelist(name, "a-zA-Z0-9._-");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({
        status: "error",
        code: "METHOD_NOT_ALLOWED",
        message: "Method not allowed",
      });
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const form = new formidable.IncomingForm({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  form.parse(
    req,
    (
      err: unknown,
      fields: Record<string, unknown>,
      files: Record<string, unknown>
    ) => {
      if (err)
        return res
          .status(400)
          .json({
            status: "error",
            code: "UPLOAD_FAILED",
            message: "Upload failed",
          });
      const file = files.file;
      if (!file)
        return res
          .status(400)
          .json({
            status: "error",
            code: "NO_FILE",
            message: "No file uploaded",
          });
      const fileObj = Array.isArray(file) ? file[0] : file;
      const filePath = fileObj.filepath;
      const fileName = sanitizeFileName(path.basename(filePath));
      const ext = path.extname(fileName).toLowerCase();
      const mime = fileObj.mimetype;
      if (!ALLOWED_MIME.includes(mime) || !ALLOWED_EXT.includes(ext)) {
        // Remove the uploaded file if not allowed
        fs.unlinkSync(filePath);
        return res
          .status(400)
          .json({
            status: "error",
            code: "INVALID_FILE_TYPE",
            message:
              "Only image files (jpg, jpeg, png, gif, webp) are allowed.",
          });
      }
      // Move file to sanitized name if needed
      const safePath = path.join(uploadDir, fileName);
      if (filePath !== safePath) {
        fs.renameSync(filePath, safePath);
      }
      const url = `/uploads/${fileName}`;
      res.status(200).json({ status: "success", url });
    }
  );
}
