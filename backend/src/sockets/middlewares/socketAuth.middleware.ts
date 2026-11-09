import type { Socket } from "socket.io";
import { verifyAccessToken } from "../../utils/token.utils.ts";
import prisma from "../../config/db.ts";

/**
 * Socket handshake middleware to authenticate users via JWT token.
 * Token can be passed in `socket.handshake.auth.token` or in cookies.
 */
export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    // 1. Check auth payload or authorization header
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        // Fast DB lookup with 2.5s timeout so socket handshake never hangs or disconnects
        const userPromise = prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, email: true, avatar: true },
        });
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 2500)
        );
        const user = await Promise.race([userPromise, timeoutPromise]);

        if (user) {
          socket.data.user = user;
        }
      } catch {
        // Token invalid or DB timeout, proceed without blocking socket connection
      }
    }
    // Proceed even if unauthenticated (allows guest / invite-link participants)
    next();
  } catch {
    // Continue with anonymous/fallback peer identity rather than rejecting connection
    next();
  }
};

export default socketAuthMiddleware;

