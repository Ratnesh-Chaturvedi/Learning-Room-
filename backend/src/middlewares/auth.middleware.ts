import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { verifyAccessToken } from "../utils/token.utils.ts";
import prisma from "../config/db.ts";
import { env } from "../config/env.ts";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // 1. Extract token from HTTP-only cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      throw new ApiError(401, "Authentication token required. Please sign in with Google.");
    }

    if (env.NODE_ENV !== "production" && (token.startsWith("dev_token") || token.startsWith("dev_jwt_"))) {
      const isMaya = token.includes("maya");
      const devEmail = isMaya ? "maya@learningroom.app" : "ratnesh@learningroom.app";
      let user = await prisma.user.findFirst({ where: { email: devEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: isMaya ? "dev-google-maya-id-102" : "dev-google-ratnesh-id-101",
            name: isMaya ? "Maya Sharma" : "Ratnesh Tiwari",
            email: devEmail,
            avatar: isMaya
              ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          },
        });
      }
      req.user = user;
      return next();
    }

    try {
      // 2. Verify token signature & expiration
      const payload = verifyAccessToken(token);

      // 3. Find user in PostgreSQL
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new ApiError(401, "User no longer exists or session has expired.");
      }

      // 4. Attach authenticated user to request
      req.user = user;
      next();
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(401, "Invalid or expired authentication token.");
    }
  }
);

export default authenticate;

