import { z } from "zod";
import { Tool, RoomStatus, RoomCategory } from "@prisma/client";

export const createRoomSchema = z
  .object({
    roomCode: z.string().trim().optional(),
    title: z
      .string()
      .trim()
      .min(1, "Room title is required")
      .max(100, "Title must be under 100 characters")
      .default("Untitled Room"),
    description: z.string().trim().max(500, "Description must be under 500 characters").optional(),
    category: z.nativeEnum(RoomCategory).default(RoomCategory.MEETING),
    customCategory: z.string().trim().max(50, "Custom category must be under 50 characters").optional(),
    isPrivate: z.boolean().default(false),
    scheduledEndTime: z.coerce.date().optional(),
    tools: z.array(z.nativeEnum(Tool)).default([]),
  })
  .refine(
    (data) => {
      if (data.category === RoomCategory.CUSTOM) {
        return !!data.customCategory && data.customCategory.trim().length > 0;
      }
      return true;
    },
    {
      message: "customCategory is required when category is set to CUSTOM",
      path: ["customCategory"],
    }
  );

export const scheduleRoomSchema = z
  .object({
    roomCode: z.string().trim().optional(),
    title: z
      .string()
      .trim()
      .min(1, "Room title is required")
      .max(100, "Title must be under 100 characters"),
    description: z.string().trim().max(500, "Description must be under 500 characters").optional(),
    category: z.nativeEnum(RoomCategory).default(RoomCategory.MEETING),
    customCategory: z.string().trim().max(50, "Custom category must be under 50 characters").optional(),
    isPrivate: z.boolean().default(false),
    scheduledAt: z.coerce.date().refine((date) => date > new Date(), {
      message: "Scheduled start time must be in the future",
    }),
    scheduledEndTime: z.coerce.date().optional(),
    tools: z.array(z.nativeEnum(Tool)).default([]),
  })
  .refine(
    (data) => {
      if (data.category === RoomCategory.CUSTOM) {
        return !!data.customCategory && data.customCategory.trim().length > 0;
      }
      return true;
    },
    {
      message: "customCategory is required when category is set to CUSTOM",
      path: ["customCategory"],
    }
  )
  .refine(
    (data) => {
      if (data.scheduledEndTime && data.scheduledAt) {
        return data.scheduledEndTime > data.scheduledAt;
      }
      return true;
    },
    {
      message: "scheduledEndTime must be later than scheduledAt",
      path: ["scheduledEndTime"],
    }
  );

export const updateRoomSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    category: z.nativeEnum(RoomCategory).optional(),
    customCategory: z.string().trim().max(50).optional(),
    isPrivate: z.boolean().optional(),
    scheduledAt: z.coerce.date().optional(),
    scheduledEndTime: z.coerce.date().optional(),
    tools: z.array(z.nativeEnum(Tool)).optional(),
  })
  .refine(
    (data) => {
      if (data.category === RoomCategory.CUSTOM && !data.customCategory) {
        return false;
      }
      return true;
    },
    {
      message: "customCategory is required when category is set to CUSTOM",
      path: ["customCategory"],
    }
  )
  .refine(
    (data) => {
      if (data.scheduledAt && data.scheduledEndTime) {
        return data.scheduledEndTime > data.scheduledAt;
      }
      return true;
    },
    {
      message: "scheduledEndTime must be later than scheduledAt",
      path: ["scheduledEndTime"],
    }
  );

export const searchRoomsQuerySchema = z.object({
  category: z.nativeEnum(RoomCategory).optional(),
  customCategory: z.string().trim().optional(),
  query: z.string().trim().optional(),
  isPrivate: z.coerce.boolean().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  tool: z.nativeEnum(Tool).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
