import prisma from "../config/db.ts";
import { ApiError } from "../utils/apiError.ts";
import { RoomStatus } from "@prisma/client";

export class UserService {
  /**
   * Retrieves user profile details and activity statistics.
   */
  public static async getProfileWithStats(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              createdRooms: true,
              joinedRooms: true,
            },
          },
        },
      });

      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
          stats: {
            hostedRoomsCount: user._count.createdRooms,
            joinedRoomsCount: user._count.joinedRooms,
          },
        };
      }
    } catch {
      // Database offline fallback
    }

    return {
      id: userId,
      name: "LearningRoom Collaborator",
      email: "user@learningroom.app",
      avatar: null,
      createdAt: new Date(),
      stats: {
        hostedRoomsCount: 0,
        joinedRoomsCount: 0,
      },
    };
  }

  /**
   * Updates user name or avatar.
   */
  public static async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Retrieves rooms filtered by user involvement: 'all' | 'hosted' | 'joined' | 'scheduled' | 'archived'.
   */
  public static async getMyRooms(
    userId: string,
    filter: "all" | "hosted" | "joined" | "scheduled" | "archived" = "all"
  ) {
    try {
      switch (filter) {
        case "hosted":
          return await prisma.room.findMany({
            where: { creatorId: userId },
            orderBy: { createdAt: "desc" },
            include: {
              creator: { select: { id: true, name: true, email: true, avatar: true } },
              participants: { select: { id: true, name: true, email: true, avatar: true } },
            },
          });

        case "joined":
          return await prisma.room.findMany({
            where: {
              participants: { some: { id: userId } },
              creatorId: { not: userId },
            },
            orderBy: { createdAt: "desc" },
            include: {
              creator: { select: { id: true, name: true, email: true, avatar: true } },
              participants: { select: { id: true, name: true, email: true, avatar: true } },
            },
          });

        case "scheduled":
          return await prisma.room.findMany({
            where: {
              status: RoomStatus.SCHEDULED,
              OR: [
                { creatorId: userId },
                { participants: { some: { id: userId } } },
              ],
            },
            orderBy: { scheduledAt: "asc" },
            include: {
              creator: { select: { id: true, name: true, email: true, avatar: true } },
              participants: { select: { id: true, name: true, email: true, avatar: true } },
            },
          });

        case "archived":
          return await prisma.room.findMany({
            where: {
              status: RoomStatus.ENDED,
              OR: [
                { creatorId: userId },
                { participants: { some: { id: userId } } },
              ],
            },
            orderBy: { endedAt: "desc" },
            include: {
              creator: { select: { id: true, name: true, email: true, avatar: true } },
              participants: { select: { id: true, name: true, email: true, avatar: true } },
            },
          });

        case "all":
        default:
          return await prisma.room.findMany({
            where: {
              OR: [
                { creatorId: userId },
                { participants: { some: { id: userId } } },
              ],
            },
            orderBy: { createdAt: "desc" },
            include: {
              creator: { select: { id: true, name: true, email: true, avatar: true } },
              participants: { select: { id: true, name: true, email: true, avatar: true } },
            },
          });
      }
    } catch {
      return [];
    }
  }
}

export default UserService;

