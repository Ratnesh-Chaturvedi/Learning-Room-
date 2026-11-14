import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { ApiError } from "../utils/apiError.ts";
import { UserService } from "../services/user.service.ts";
import { CloudinaryService } from "../services/cloudinary.service.ts";
import { updateProfileSchema } from "../validators/user.validator.ts";

// GET /api/v1/users/profile - Get profile and activity stats
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const profile = await UserService.getProfileWithStats(req.user.id);

  res.status(200).json(
    new ApiResponse(200, "User profile retrieved successfully", profile)
  );
});

// PATCH /api/v1/users/profile - Update user profile (name, avatar)
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, "Invalid profile data", validation.error.issues);
  }

  let avatarValue = validation.data.avatar;

  // Handle multipart file upload if present
  if (req.file) {
    try {
      const uploadResult = await CloudinaryService.uploadImage(req.file, {
        folder: "learning_room/avatars",
      });
      avatarValue = uploadResult.url;
    } catch (cloudErr: any) {
      console.warn(
        "[Avatar Upload] Cloudinary upload unavailable, persisting base64 data URI directly:",
        cloudErr?.message
      );
      const mime = req.file.mimetype || "image/png";
      avatarValue = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    }
  }

  const updatedUser = await UserService.updateProfile(req.user.id, {
    name: validation.data.name,
    avatar: avatarValue,
  });

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", updatedUser)
  );
});

// POST /api/v1/users/avatar - Upload profile picture to Cloudinary
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const imageSource = req.file || req.body?.avatar || req.body?.image;
  if (!imageSource) {
    throw new ApiError(400, "Please provide an image file or base64 image data.");
  }

  const updatedUser = await UserService.updateAvatar(req.user.id, imageSource);

  res.status(200).json(
    new ApiResponse(200, "Profile picture updated successfully", updatedUser)
  );
});

// GET /api/v1/users/my-rooms - Get user's created and joined rooms
export const getMyRooms = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const filter = (req.query.filter as "all" | "hosted" | "joined" | "scheduled" | "archived") || "all";
  const rooms = await UserService.getMyRooms(req.user.id, filter);

  res.status(200).json(
    new ApiResponse(200, `Retrieved ${filter} rooms successfully`, {
      count: rooms.length,
      rooms,
    })
  );
});
