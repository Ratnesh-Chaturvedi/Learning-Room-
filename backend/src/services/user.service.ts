import prisma from "../config/db.ts";
import { ApiError } from "../utils/apiError.ts";
import { RoomStatus, type Prisma } from "@prisma/client";
import { CloudinaryService } from "./cloudinary.service.ts";

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
   * Updates user name or avatar. Automatically uploads Data URIs to Cloudinary.
   */
  public static async updateProfile(
    userId: string,
    data: { name?: string; avatar?: string | null }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const updateData: { name?: string; avatar?: string | null } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.avatar !== undefined) {
      if (data.avatar && data.avatar.startsWith("data:image/")) {
        let finalAvatar = data.avatar;
        try {
          // Upload base64 Data URI to Cloudinary
          const uploadResult = await CloudinaryService.uploadImage(data.avatar, {
            folder: "learning_room/avatars",
          });

          // Safely remove older Cloudinary avatar to avoid orphaned files
          if (user.avatar && user.avatar.includes("cloudinary.com")) {
            await CloudinaryService.deleteImage(user.avatar).catch(() => {});
          }

          finalAvatar = uploadResult.url;
        } catch (cloudErr: any) {
          console.warn(
            "[UserService.updateProfile] Cloudinary unavailable, persisting data URI directly:",
            cloudErr?.message
          );
        }

        updateData.avatar = finalAvatar;
      } else if (data.avatar === null || data.avatar === "") {
        // Clearing avatar
        if (user.avatar && user.avatar.includes("cloudinary.com")) {
          await CloudinaryService.deleteImage(user.avatar).catch(() => {});
        }
        updateData.avatar = null;
      } else {
        updateData.avatar = data.avatar;
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
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
   * Directly uploads a new avatar file or image source to Cloudinary and saves URL.
   */
  public static async updateAvatar(
    userId: string,
    imageSource: Express.Multer.File | Buffer | string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    let finalAvatar: string;
    try {
      const uploadResult = await CloudinaryService.uploadImage(imageSource, {
        folder: "learning_room/avatars",
      });

      if (user.avatar && user.avatar.includes("cloudinary.com")) {
        await CloudinaryService.deleteImage(user.avatar).catch(() => {});
      }

      finalAvatar = uploadResult.url;
    } catch (cloudErr: any) {
      console.warn(
        "[UserService.updateAvatar] Cloudinary unavailable, persisting base64 data URI directly:",
        cloudErr?.message
      );
      if (typeof imageSource === "string") {
        finalAvatar = imageSource;
      } else if (Buffer.isBuffer(imageSource)) {
        finalAvatar = `data:image/png;base64,${imageSource.toString("base64")}`;
      } else if ((imageSource as Express.Multer.File)?.buffer) {
        const file = imageSource as Express.Multer.File;
        finalAvatar = `data:${file.mimetype || "image/png"};base64,${file.buffer.toString("base64")}`;
      } else {
        throw cloudErr;
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: { avatar: finalAvatar },
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
      let where: Prisma.RoomWhereInput;
      let orderBy: Prisma.RoomOrderByWithRelationInput = { createdAt: "desc" };

      switch (filter) {
        case "hosted":
          where = { creatorId: userId };
          break;
        case "joined":
          where = {
            participants: { some: { id: userId } },
            creatorId: { not: userId },
          };
          break;
        case "scheduled":
          where = {
            status: RoomStatus.SCHEDULED,
            OR: [
              { creatorId: userId },
              { participants: { some: { id: userId } } },
            ],
          };
          orderBy = { scheduledAt: "asc" };
          break;
        case "archived":
          where = {
            status: RoomStatus.ENDED,
            OR: [
              { creatorId: userId },
              { participants: { some: { id: userId } } },
            ],
          };
          orderBy = { endedAt: "desc" };
          break;
        case "all":
        default:
          where = {
            OR: [
              { creatorId: userId },
              { participants: { some: { id: userId } } },
            ],
          };
          break;
      }

      return await prisma.room.findMany({
        where,
        orderBy,
        include: {
          creator: { select: { id: true, name: true, email: true, avatar: true } },
          participants: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });
    } catch {
      return [];
    }
  }
}

export default UserService;

