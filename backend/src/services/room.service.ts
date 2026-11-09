import prisma from "../config/db.ts";
import { ApiError } from "../utils/apiError.ts";
import { generateRoomCode, generateInviteToken } from "../utils/code.utils.ts";
import { RoomStatus, RoomCategory, type Tool, type Prisma } from "@prisma/client";
import {
  broadcastRoomTerminated,
  broadcastRoomUpdated,
} from "../sockets/services/roomSocket.service.ts";

export class RoomService {
  /**
   * Creates an instant active collaborative room (Public or Private).
   */
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
    let roomCode = params.roomCode?.trim().toUpperCase() || generateRoomCode();
    let existing = await prisma.room.findUnique({ where: { roomCode } });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.room.findUnique({ where: { roomCode } });
    }

    const category = params.category || RoomCategory.MEETING;
    const customCategory =
      category === RoomCategory.CUSTOM ? params.customCategory?.trim() : null;
    const isPrivate = Boolean(params.isPrivate);
    const inviteToken = isPrivate ? generateInviteToken() : null;

    const room = await prisma.room.create({
      data: {
        roomCode,
        title: params.title || "Untitled Room",
        description: params.description,
        category,
        customCategory,
        isPrivate,
        inviteToken,
        status: RoomStatus.ACTIVE,
        scheduledEndTime: params.scheduledEndTime,
        creatorId: params.userId,
        tools: params.tools || [],
        participants: {
          connect: { id: params.userId },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        participants: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return room;
  }

  /**
   * Schedules a room for a future date/time (Public or Private).
   */
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
    let roomCode = params.roomCode?.trim().toUpperCase() || generateRoomCode();
    let existing = await prisma.room.findUnique({ where: { roomCode } });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await prisma.room.findUnique({ where: { roomCode } });
    }

    const category = params.category || RoomCategory.MEETING;
    const customCategory =
      category === RoomCategory.CUSTOM ? params.customCategory?.trim() : null;
    const isPrivate = Boolean(params.isPrivate);
    const inviteToken = isPrivate ? generateInviteToken() : null;

    const room = await prisma.room.create({
      data: {
        roomCode,
        title: params.title,
        description: params.description,
        category,
        customCategory,
        isPrivate,
        inviteToken,
        status: RoomStatus.SCHEDULED,
        scheduledAt: params.scheduledAt,
        scheduledEndTime: params.scheduledEndTime,
        creatorId: params.userId,
        tools: params.tools || [],
        participants: {
          connect: { id: params.userId },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        participants: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return room;
  }

  /**
   * Searches, filters, and paginates rooms by enum category, customCategory, keyword query, tool, and privacy.
   */
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

    // 1. Privacy filter (Public explore shows public rooms unless explicitly querying private)
    if (params.isPrivate !== undefined) {
      where.isPrivate = params.isPrivate;
    } else {
      where.isPrivate = false; // By default, explore only indexes public rooms
    }

    // 2. Strict Enum Category filter
    if (params.category) {
      where.category = params.category;
    }

    // 3. Custom category filter
    if (params.customCategory && params.customCategory.trim()) {
      where.customCategory = {
        contains: params.customCategory.trim(),
        mode: "insensitive",
      };
    }

    // 4. Keyword query
    if (params.query && params.query.trim()) {
      const searchTerms = params.query.trim();
      where.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { description: { contains: searchTerms, mode: "insensitive" } },
        { customCategory: { contains: searchTerms, mode: "insensitive" } },
        { roomCode: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    // 5. Status filter
    if (params.status) {
      where.status = params.status;
    } else {
      where.status = { not: RoomStatus.ENDED };
    }

    // 6. Tool filter
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
          include: {
            creator: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            participants: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
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

  /**
   * Retrieves standard RoomCategory enum values and distinct active custom categories from DB.
   */
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
      // Fallback if DB is temporarily unreachable
    }

    return {
      standardCategories,
      customCategories,
    };
  }

  /**
   * Finds a room by its shareable code or ID, auto-terminating if scheduledEndTime has passed.
   */
  public static async getRoomByCode(roomCode: string) {
    const cleanCode = roomCode.trim().toUpperCase();

    const room = await prisma.room.findFirst({
      where: {
        OR: [{ roomCode: cleanCode }, { id: roomCode }],
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        participants: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    if (!room) {
      throw new ApiError(404, `Room with code '${cleanCode}' does not exist.`);
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
        include: {
          creator: { select: { id: true, name: true, email: true, avatar: true } },
          participants: { select: { id: true, name: true, email: true, avatar: true } },
        },
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

    return room;
  }

  /**
   * Adds a user to the room's participant list with Private room access verification.
   */
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

    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        participants: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return updatedRoom;
  }

  /**
   * Removes a user from the room's active participants list.
   */
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

  /**
   * Helper to query room by either its UUID id or short roomCode.
   */
  public static async findRoomByIdOrCode(identifier: string) {
    if (!identifier) return null;
    const clean = identifier.trim();
    return prisma.room.findFirst({
      where: {
        OR: [{ id: clean }, { roomCode: clean.toUpperCase() }],
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        participants: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }
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
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        participants: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    broadcastRoomUpdated(updated.id, updated.roomCode, {
      status: RoomStatus.ACTIVE,
      message: "Room is now active.",
    });

    return updated;
  }

  /**
   * Ends an active room and records duration (Host only).
   */
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
        participants: { set: [] }, // Disconnects all participants from the room in DB
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        participants: { select: { id: true, name: true, email: true, avatar: true } },
      },
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

  /**
   * Modifies any room configuration (title, description, category, privacy, schedule, tools) (Host only).
   */
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
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        participants: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    broadcastRoomUpdated(updatedRoom.id, updatedRoom.roomCode, updatedRoom);

    return updatedRoom;
  }

  /**
   * Regenerates a new private invite link token (Host only).
   */
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
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        participants: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  /**
   * Deletes a room (Host only).
   */
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
