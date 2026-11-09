import { Router } from "express";
import { uploadImage, deleteImage } from "../../controllers/upload.controller.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";
import { uploadSingleImage } from "../../middlewares/upload.middleware.ts";

const router = Router();

// Protect image upload endpoints with authentication
router.use(authenticate);

// POST /api/v1/upload/image (handles multipart file named "image" or "file")
router.post("/image", uploadSingleImage("image"), uploadImage);
router.delete("/image", deleteImage);

export default router;

