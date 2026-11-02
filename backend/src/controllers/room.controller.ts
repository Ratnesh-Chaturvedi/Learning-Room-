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

/**
 * Searches and filters rooms by standard enum category, customCategory, keyword query, status, and tools.
 * Route: GET /api/v1/rooms?category=STUDY&query=Algorithms&page=1&limit=20
 */
export const searchRooms = asyncHandler(async (req: Request, res: Response) => {
  const validation = searchRoomsQuerySchema.safeParse(req.query);
  if (!validation.success) {
    throw new ApiError(400, "Invalid query parameters", validation.error.issues);
  }

  const results = await RoomService.searchRooms(validation.data);

  res.status(200).json(new ApiResponse(200, "Rooms retrieved successfully", results));
});

/**
 * Retrieves all unique room categories (both standard RoomCategory enums and active custom types).
 * Route: GET /api/v1/rooms/categories
 */
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await RoomService.getCategories();
  res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories));
});

/**
 * Creates an active instant collaborative room (Public or Private).
 * Route: POST /api/v1/rooms/instant
 */
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

/**
 * Schedules a room for a future date/time (Public or Private).
 * Route: POST /api/v1/rooms/schedule
 */
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

/**
 * Retrieves details of a room by room code or ID.
 * Route: GET /api/v1/rooms/:roomCode
 */
export const getRoomDetails = asyncHandler(async (req: Request, res: Response) => {
  const roomCode = getParamString(req.params.roomCode, "Room code");
  const room = await RoomService.getRoomByCode(roomCode);

  res.status(200).json(new ApiResponse(200, "Room retrieved successfully", room));
});

/**
 * Adds the authenticated user to the room's participant list with Private room verification.
 * Route: POST /api/v1/rooms/:roomCode/join
 */
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

/**
 * Removes the authenticated user from the room's participant list.
 * Route: POST /api/v1/rooms/:roomCode/leave
 */
export const leaveRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const roomCode = getParamString(req.params.roomCode, "Room code");
  const room = await RoomService.leaveRoom(roomCode, req.user.id);

  res.status(200).json(new ApiResponse(200, "Left room successfully", room));
});

/**
 * Starts a scheduled room (Host only).
 * Route: PATCH /api/v1/rooms/:id/start
 */
export const startRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  const room = await RoomService.startRoom(id, req.user.id);

  res.status(200).json(new ApiResponse(200, "Room started successfully", room));
});

/**
 * Ends an active room and records the duration (Host only).
 * Terminates all live WebRTC sessions and connected sockets.
 * Route: PATCH /api/v1/rooms/:id/end
 */
export const endRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  const room = await RoomService.endRoom(id, req.user.id);

  res.status(200).json(new ApiResponse(200, "Room ended successfully", room));
});

/**
 * Modifies any room settings (title, description, category, isPrivate, scheduledAt, scheduledEndTime, tools) (Host only).
 * Route: PATCH /api/v1/rooms/:id
 */
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

/**
 * Regenerates the private room invite link token (Host only).
 * Route: POST /api/v1/rooms/:id/regenerate-invite
 */
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

/**
 * Deletes or cancels a room (Host only).
 * Route: DELETE /api/v1/rooms/:id
 */
export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const id = getParamString(req.params.id, "Room ID");
  await RoomService.deleteRoom(id, req.user.id);

  res.status(200).json(new ApiResponse(200, "Room deleted successfully"));
});
