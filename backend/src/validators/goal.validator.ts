import { z } from "zod";

export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Goal title cannot be empty")
    .max(150, "Goal title must be 150 characters or less"),
  description: z.string().trim().max(500, "Description must be under 500 characters").optional(),
  category: z.string().trim().max(40).optional().default("GENERAL"),
  targetCount: z.number().int().min(1, "Target count must be at least 1").optional().default(1),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateGoalSchema = z.object({
  title: z.string().trim().min(1, "Goal title cannot be empty").max(150).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  completed: z.boolean().optional(),
  category: z.string().trim().max(40).optional(),
  currentCount: z.number().int().min(0).optional(),
  targetCount: z.number().int().min(1).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

