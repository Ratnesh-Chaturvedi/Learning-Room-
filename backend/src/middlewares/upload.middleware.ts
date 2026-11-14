import type { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import { ApiError } from "../utils/apiError.ts";

// In-memory buffer storage (optimal for streaming directly to Cloudinary & serverless environments)
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type (${file.mimetype}). Only JPG, PNG, WEBP, GIF, and SVG images are accepted.`
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes limit
    files: 1,
  },
});

// Single image upload middleware with error handling
export const uploadSingleImage = (fieldName: string = "avatar") => {
  const singleUploader = upload.single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    singleUploader(req, res, (err: any) => {
      if (err) {
        if (err instanceof MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(new ApiError(400, "File size limit exceeded. Images must be under 5MB."));
          }
          return next(new ApiError(400, `Upload error: ${err.message}`));
        }
        if (err instanceof ApiError) {
          return next(err);
        }
        return next(new ApiError(400, err?.message || "File upload failed."));
      }
      next();
    });
  };
};

export default upload;

