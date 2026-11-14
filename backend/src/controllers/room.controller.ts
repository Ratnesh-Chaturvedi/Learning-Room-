import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { ApiError } from "../utils/apiError.ts";
import { RoomService } from "../services/room.service.ts";
import {
  createRoomSchema,
  scheduleRoomSchema,
  updateRoomSchema,
  searchRoomsQuerySchema,
} from "../validators/room.validator.ts";

const getParamString = (param: string | string[] | undefined, name: string): string => {
  if (!param) throw new ApiError(400, `${name} is required`);
  return Array.isArray(param) ? param[0]! : param;
};

// GET /api/v1/rooms - Search and filter rooms
export const searchRooms = asyncHandler(async (req: Request, res: Response) => {
  const validation = searchRoomsQuerySchema.safeParse(req.query);
  if (!validation.success) {
    throw new ApiError(400, "Invalid query parameters", validation.error.issues);
  }

  const results = await RoomService.searchRooms(validation.data);

  res.status(200).json(new ApiResponse(200, "Rooms retrieved successfully", results));
});

// GET /api/v1/rooms/categories - Unique room categories
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await RoomService.getCategories();
  res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories));
});

// POST /api/v1/rooms/instant - Create instant room
export const createInstantRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const validation = createRoomSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, "Validation failed", validation.error.issues);
  }

  const room = await RoomService.createInstantRoom({
    userId: req.user.id,
    roomCode: validation.data.roomCode,
    title: validation.data.title,
    description: validation.data.description,
    category: validation.data.category,
    customCategory: validation.data.customCategory,
    isPrivate: validation.data.isPrivate,
    scheduledEndTime: validation.data.scheduledEndTime,
    tools: validation.data.tools,
  });

  res.status(201).json(new ApiResponse(201, "Room created successfully", room));
});

// POST /api/v1/rooms/schedule - Create scheduled room
export const scheduleRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const validation = scheduleRoomSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, "Validation failed", validation.error.issues);
  }

  const room = await RoomService.scheduleRoom({
    userId: req.user.id,
    roomCode: validation.data.roomCode,
    title: validation.data.title,
    description: validation.data.description,
    category: validation.data.category,
    customCategory: validation.data.customCategory,
    isPrivate: validation.data.isPrivate,
    scheduledAt: validation.data.scheduledAt,
    scheduledEndTime: validation.data.scheduledEndTime,
    tools: validation.data.tools,
  });

  res.status(201).json(new ApiResponse(201, "Room scheduled successfully", room));
});

// GET /api/v1/rooms/:roomCode - Get room details
export const getRoomDetails = asyncHandler(async (req: Request, res: Response) => {
  const roomCode = getParamString(req.params.roomCode, "Room code");
  const room = await RoomService.getRoomByCode(roomCode);

  res.status(200).json(new ApiResponse(200, "Room retrieved successfully", room));
});

// POST /api/v1/rooms/:roomCode/join - Join room
export const joinRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const roomCode = getParamString(req.params.roomCode, "Room code");
  const inviteToken =
    (req.query.token as string) ||
    req.body?.inviteToken ||
    undefined;

  const room = await RoomService.joinRoom(roomCode, req.user.id, inviteToken);

  res.status(200).json(new ApiResponse(200, "Joined room successfully", room));
});

// POST /api/v1/rooms/:roomCode/leave - Leave room
export const leaveRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const roomCode = getParamString(req.params.roomCode, "Room code");
  const room = await RoomService.leaveRoom(roomCode, req.user.id);

  res.status(200).json(new ApiResponse(200, "Left room successfully", room));
});

// PATCH /api/v1/rooms/:id/start - Start scheduled room
export const startRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  const room = await RoomService.startRoom(id, req.user.id);

  res.status(200).json(new ApiResponse(200, "Room started successfully", room));
});

// PATCH /api/v1/rooms/:id/end - End active room
export const endRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  const room = await RoomService.endRoom(id, req.user.id);

  res.status(200).json(new ApiResponse(200, "Room ended successfully", room));
});

// PATCH /api/v1/rooms/:id - Update room settings
export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");

  const validation = updateRoomSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, "Validation failed", validation.error.issues);
  }

  const room = await RoomService.updateRoom(id, req.user.id, validation.data);

  res.status(200).json(new ApiResponse(200, "Room updated successfully", room));
});

// POST /api/v1/rooms/:id/regenerate-invite - Regenerate invite token
export const regenerateInviteToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  const room = await RoomService.regenerateInviteToken(id, req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Invite link regenerated successfully", {
      inviteToken: room.inviteToken,
      inviteUrl: `${req.protocol}://${req.get("host")}/r/${room.roomCode}?token=${room.inviteToken}`,
    })
  );
});

// DELETE /api/v1/rooms/:id - Delete room
export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  await RoomService.deleteRoom(id, req.user.id);

  res.status(200).json(new ApiResponse(200, "Room deleted successfully"));
});
