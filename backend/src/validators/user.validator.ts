import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(60, "Name must be under 60 characters").optional(),
  avatar: z
    .string()
    .refine(
      (val) =>
        val.startsWith("data:image/") ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/"),
      "Avatar must be a valid image URL or image data"
    )
    .nullable()
    .optional(),
});

