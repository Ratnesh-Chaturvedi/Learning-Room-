import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { ApiError } from "../utils/apiError.ts";
import { UserService } from "../services/user.service.ts";
import { CloudinaryService } from "../services/cloudinary.service.ts";
import { updateProfileSchema } from "../validators/user.validator.ts";

/**
 * Retrieves the profile and activity stats of the authenticated user.
 * Route: GET /api/v1/users/profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const profile = await UserService.getProfileWithStats(req.user.id);

  res.status(200).json(
    new ApiResponse(200, "User profile retrieved successfully", profile)
  );
});

/**
 * Updates user profile details (name, avatar).
 * Supports both JSON payloads (with base64 avatar) and multipart/form-data image uploads.
 * Route: PATCH /api/v1/users/profile
 */
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
    const uploadResult = await CloudinaryService.uploadImage(req.file, {
      folder: "learning_room/avatars",
    });
    avatarValue = uploadResult.url;
  }

  const updatedUser = await UserService.updateProfile(req.user.id, {
    name: validation.data.name,
    avatar: avatarValue,
  });

  res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", updatedUser)
  );
});

/**
 * Uploads a profile picture directly to Cloudinary and updates user profile.
 * Route: POST /api/v1/users/avatar
 */
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

/**
 * Retrieves all rooms created by or joined by the authenticated user.
 * Route: GET /api/v1/users/my-rooms?filter=all|hosted|joined|scheduled|archived
 */
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
