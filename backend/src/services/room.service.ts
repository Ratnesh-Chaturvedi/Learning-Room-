import prisma from "../config/db.ts";
import { ApiError } from "../utils/apiError.ts";
import { generateRoomCode, generateInviteToken } from "../utils/code.utils.ts";
import { RoomStatus, RoomCategory, type Tool, type Prisma } from "@prisma/client";
import {
  broadcastRoomTerminated,
  broadcastRoomUpdated,
} from "../sockets/services/roomSocket.service.ts";

const userSelect = { id: true, name: true, email: true, avatar: true };
const roomInclude = {
  creator: { select: userSelect },
  participants: { select: userSelect },
};

export class RoomService {
  // Generate unique non-colliding room code
  private static async generateUniqueRoomCode(requestedCode?: string): Promise<string> {
    let roomCode = requestedCode?.trim().toUpperCase() || generateRoomCode();
    while (await prisma.room.findUnique({ where: { roomCode } })) {
      roomCode = generateRoomCode();
    }
    return roomCode;
  }

  // Normalize category and custom category
  private static resolveCategory(category?: RoomCategory, customCategory?: string) {
    const cat = category || RoomCategory.MEETING;
    const custom = cat === RoomCategory.CUSTOM ? customCategory?.trim() || null : null;
    return { category: cat, customCategory: custom };
  }

  // Create instant active room
  public static async createInstantRoom(params: {
    userId: string;
    roomCode?: string;
    title: string;
    description?: string;
    category?: RoomCategory;
    customCategory?: string;
    isPrivate?: boolean;
    scheduledEndTime?: Date;
    tools?: Tool[];
  }) {
    const roomCode = await this.generateUniqueRoomCode(params.roomCode);
    const { category, customCategory } = this.resolveCategory(params.category, params.customCategory);
    const isPrivate = Boolean(params.isPrivate);

    return prisma.room.create({
      data: {
        roomCode,
        title: params.title || "Untitled Room",
        description: params.description,
        category,
        customCategory,
        isPrivate,
        inviteToken: isPrivate ? generateInviteToken() : null,
        status: RoomStatus.ACTIVE,
        scheduledEndTime: params.scheduledEndTime,
        creatorId: params.userId,
        tools: params.tools || [],
        participants: {
          connect: { id: params.userId },
        },
      },
      include: roomInclude,
    });
  }

  // Schedule room for a future date/time
  public static async scheduleRoom(params: {
    userId: string;
    roomCode?: string;
    title: string;
    description?: string;
    category?: RoomCategory;
    customCategory?: string;
    isPrivate?: boolean;
    scheduledAt: Date;
    scheduledEndTime?: Date;
    tools?: Tool[];
  }) {
    const roomCode = await this.generateUniqueRoomCode(params.roomCode);
    const { category, customCategory } = this.resolveCategory(params.category, params.customCategory);
    const isPrivate = Boolean(params.isPrivate);

    return prisma.room.create({
      data: {
        roomCode,
        title: params.title,
        description: params.description,
        category,
        customCategory,
        isPrivate,
        inviteToken: isPrivate ? generateInviteToken() : null,
        status: RoomStatus.SCHEDULED,
        scheduledAt: params.scheduledAt,
        scheduledEndTime: params.scheduledEndTime,
        creatorId: params.userId,
        tools: params.tools || [],
        participants: {
          connect: { id: params.userId },
        },
      },
      include: roomInclude,
    });
  }

  // Search, filter, and paginate rooms
  public static async searchRooms(params: {
    category?: RoomCategory;
    customCategory?: string;
    query?: string;
    isPrivate?: boolean;
    status?: RoomStatus;
    tool?: Tool;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.RoomWhereInput = {};

    // Privacy filter
    if (params.isPrivate !== undefined) {
      where.isPrivate = params.isPrivate;
    } else {
      where.isPrivate = false;
    }

    // Category filter
    if (params.category) {
      where.category = params.category;
    }

    // Custom category filter
    if (params.customCategory && params.customCategory.trim()) {
      where.customCategory = {
        contains: params.customCategory.trim(),
        mode: "insensitive",
      };
    }

    // Keyword search
    if (params.query && params.query.trim()) {
      const searchTerms = params.query.trim();
      where.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { description: { contains: searchTerms, mode: "insensitive" } },
        { customCategory: { contains: searchTerms, mode: "insensitive" } },
        { roomCode: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (params.status) {
      where.status = params.status;
    } else {
      where.status = { not: RoomStatus.ENDED };
    }

    // Tool filter
    if (params.tool) {
      where.tools = {
        has: params.tool,
      };
    }

    let total = 0;
    let rooms: any[] = [];

    try {
      [total, rooms] = await Promise.all([
        prisma.room.count({ where }),
        prisma.room.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          include: roomInclude,
        }),
      ]);
    } catch {
      // Return empty list if DB connection is offline
    }

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      rooms,
    };
  }

  // Retrieve standard and active custom categories
  public static async getCategories(): Promise<{
    standardCategories: string[];
    customCategories: string[];
  }> {
    const standardCategories = Object.values(RoomCategory);
    let customCategories: string[] = [];

    try {
      const customDbRooms = await prisma.room.findMany({
        where: {
          category: RoomCategory.CUSTOM,
          customCategory: { not: null },
        },
        select: { customCategory: true },
        distinct: ["customCategory"],
      });

      customCategories = customDbRooms
        .map((r: { customCategory: string | null }) => r.customCategory)
        .filter((c: string | null): c is string => Boolean(c));
    } catch {
      // Fallback if DB is unreachable
    }

    return {
      standardCategories,
      customCategories,
    };
  }

  // Find room by UUID id or short roomCode
  public static async findRoomByIdOrCode(identifier: string) {
    if (!identifier) return null;
    const clean = identifier.trim();
    return prisma.room.findFirst({
      where: {
        OR: [{ id: clean }, { roomCode: clean.toUpperCase() }],
      },
      include: roomInclude,
    });
  }

  // Find room by code with expiration and activation checks
  public static async getRoomByCode(roomCode: string) {
    const room = await this.findRoomByIdOrCode(roomCode);

    if (!room) {
      throw new ApiError(404, `Room with code '${roomCode.trim().toUpperCase()}' does not exist.`);
    }

    // Auto-terminate check
    if (
      room.status !== RoomStatus.ENDED &&
      room.scheduledEndTime &&
      room.scheduledEndTime <= new Date()
    ) {
      const endedAt = room.scheduledEndTime;
      const duration = Math.max(
        0,
        Math.floor((endedAt.getTime() - room.createdAt.getTime()) / 1000)
      );

      const endedRoom = await prisma.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.ENDED,
          endedAt,
          duration,
        },
        include: roomInclude,
      });

      broadcastRoomTerminated(
        room.id,
        room.roomCode,
        "Room scheduled duration has ended.",
        endedAt,
        duration
      );

      return endedRoom;
    }

    // Auto-activate scheduled room if start time has arrived
    if (
      room.status === RoomStatus.SCHEDULED &&
      room.scheduledAt &&
      room.scheduledAt <= new Date()
    ) {
      const activeRoom = await prisma.room.update({
        where: { id: room.id },
        data: {
          status: RoomStatus.ACTIVE,
        },
        include: roomInclude,
      });

      broadcastRoomUpdated(room.id, room.roomCode, {
        status: RoomStatus.ACTIVE,
        message: "Room is now active.",
      });

      return activeRoom;
    }

    return room;
  }

  // Add user to room participants with access check
  public static async joinRoom(roomCode: string, userId: string, inviteToken?: string) {
    const room = await this.getRoomByCode(roomCode);

    if (room.status === RoomStatus.ENDED) {
      throw new ApiError(400, "This room session has already ended.");
    }

    // Check Private Room Access
    const isHost = room.creatorId === userId;
    const isAlreadyParticipant = room.participants.some((p: { id: string }) => p.id === userId);
    const hasValidInvite = Boolean(room.inviteToken && inviteToken && room.inviteToken === inviteToken);

    if (room.isPrivate && !isHost && !isAlreadyParticipant && !hasValidInvite) {
      throw new ApiError(
        403,
        "This is a private room. You need host approval or the private invite link to join."
      );
    }

    return prisma.room.update({
      where: { id: room.id },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: roomInclude,
    });
  }

  // Remove user from room participants
  public static async leaveRoom(roomCode: string, userId: string) {
    const room = await this.getRoomByCode(roomCode);

    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        participants: {
          disconnect: { id: userId },
        },
      },
      include: {
        participants: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return updatedRoom;
  }

  // Start scheduled room early (Host only)
  public static async startRoom(roomId: string, userId: string) {
    const room = await this.findRoomByIdOrCode(roomId);

    if (!room) {
      throw new ApiError(404, "Room not found.");
    }

    if (room.creatorId !== userId) {
      throw new ApiError(403, "Forbidden: Only the host can start this scheduled room.");
    }

    if (room.status === RoomStatus.ENDED) {
      throw new ApiError(400, "Cannot start a room that has already ended.");
    }

    const updated = await prisma.room.update({
      where: { id: room.id },
      data: { status: RoomStatus.ACTIVE },
      include: roomInclude,
    });

    broadcastRoomUpdated(updated.id, updated.roomCode, {
      status: RoomStatus.ACTIVE,
      message: "Room is now active.",
    });

    return updated;
  }

  // End active room and record duration (Host only)
  public static async endRoom(roomId: string, userId: string) {
    const room = await this.findRoomByIdOrCode(roomId);

    if (!room) {
      throw new ApiError(404, "Room not found.");
    }

    if (room.creatorId !== userId) {
      throw new ApiError(403, "Forbidden: Only the host can end this room.");
    }

    if (room.status === RoomStatus.ENDED) {
      return room;
    }

    const endedAt = new Date();
    const duration = Math.max(
      0,
      Math.floor((endedAt.getTime() - room.createdAt.getTime()) / 1000)
    );

    const endedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        status: RoomStatus.ENDED,
        endedAt,
        duration,
        participants: { set: [] }, // Disconnect all participants from the room in DB
      },
      include: roomInclude,
    });

    broadcastRoomTerminated(
      room.id,
      room.roomCode,
      "The host has ended this meeting.",
      endedAt,
      duration
    );

    return endedRoom;
  }

  // Update room settings (Host only)
  public static async updateRoom(
    roomId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      category?: RoomCategory;
      customCategory?: string;
      isPrivate?: boolean;
      scheduledAt?: Date;
      scheduledEndTime?: Date;
      tools?: Tool[];
    }
  ) {
    const room = await this.findRoomByIdOrCode(roomId);

    if (!room) {
      throw new ApiError(404, "Room not found.");
    }

    if (room.creatorId !== userId) {
      throw new ApiError(403, "Forbidden: Only the room host can modify room settings.");
    }

    if (room.status === RoomStatus.ENDED) {
      throw new ApiError(400, "Cannot modify a room that has already ended.");
    }

    const data: Prisma.RoomUpdateInput = {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.scheduledAt !== undefined && { scheduledAt: updates.scheduledAt }),
      ...(updates.scheduledEndTime !== undefined && { scheduledEndTime: updates.scheduledEndTime }),
      ...(updates.tools !== undefined && { tools: updates.tools }),
    };

    if (updates.isPrivate !== undefined) {
      data.isPrivate = updates.isPrivate;
      if (updates.isPrivate && !room.inviteToken) {
        data.inviteToken = generateInviteToken();
      }
    }

    if (updates.category) {
      data.category = updates.category;
      data.customCategory =
        updates.category === RoomCategory.CUSTOM
          ? updates.customCategory?.trim()
          : null;
    } else if (updates.customCategory !== undefined) {
      data.customCategory = updates.customCategory?.trim();
    }

    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data,
      include: roomInclude,
    });

    broadcastRoomUpdated(updatedRoom.id, updatedRoom.roomCode, updatedRoom);

    return updatedRoom;
  }

  // Regenerate private invite link token (Host only)
  public static async regenerateInviteToken(roomId: string, userId: string) {
    const room = await this.findRoomByIdOrCode(roomId);

    if (!room) {
      throw new ApiError(404, "Room not found.");
    }

    if (room.creatorId !== userId) {
      throw new ApiError(403, "Forbidden: Only the room host can regenerate the invite link.");
    }

    const newInviteToken = generateInviteToken();

    return prisma.room.update({
      where: { id: room.id },
      data: {
        isPrivate: true,
        inviteToken: newInviteToken,
      },
      include: roomInclude,
    });
  }

  // Delete room (Host only)
  public static async deleteRoom(roomId: string, userId: string) {
    const room = await this.findRoomByIdOrCode(roomId);

    if (!room) {
      throw new ApiError(404, "Room not found.");
    }

    if (room.creatorId !== userId) {
      throw new ApiError(403, "Forbidden: Only the host can delete this room.");
    }

    broadcastRoomTerminated(room.id, room.roomCode, "This room was deleted by the host.");

    return prisma.room.delete({ where: { id: room.id } });
  }
}

export default RoomService;
