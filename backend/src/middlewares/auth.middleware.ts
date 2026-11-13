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
      const userNum = token.includes("2") ? 2 : 1;
      const devEmail = `dev${userNum}@learningroom.app`;
      let user = await prisma.user.findFirst({ where: { email: devEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: `dev-google-user-${userNum}`,
            name: `Dev User ${userNum}`,
            email: devEmail,
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

