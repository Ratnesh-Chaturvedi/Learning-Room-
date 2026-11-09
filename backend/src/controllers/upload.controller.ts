import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { ApiError } from "../utils/apiError.ts";
import { CloudinaryService } from "../services/cloudinary.service.ts";

/**
 * Uploads an arbitrary image to Cloudinary.
 * Accepts multipart/form-data (field: 'image' or 'file') or JSON body ({ image: "data:image/..." }).
 * Route: POST /api/v1/upload/image
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const imageSource = req.file || req.body?.image || req.body?.file;
  if (!imageSource) {
    throw new ApiError(400, "Please provide an image file or base64 image data.");
  }

  const folder = (req.body?.folder as string) || "learning_room/general";

  const uploadResult = await CloudinaryService.uploadImage(imageSource, {
    folder,
  });

  res.status(200).json(
    new ApiResponse(200, "Image uploaded successfully to Cloudinary", uploadResult)
  );
});

/**
 * Deletes an image from Cloudinary by publicId or URL.
 * Route: DELETE /api/v1/upload/image
 */
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const publicIdOrUrl = (req.body?.publicId || req.body?.url || req.query.url) as string;

  if (!publicIdOrUrl) {
    throw new ApiError(400, "Image publicId or url is required for deletion.");
  }

  const deleted = await CloudinaryService.deleteImage(publicIdOrUrl);

  res.status(200).json(
    new ApiResponse(200, deleted ? "Image deleted successfully" : "Image deletion completed", {
      deleted,
    })
  );
});

