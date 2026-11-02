import crypto from "node:crypto";

/**
 * Generates a clean, user-friendly room code like 'LR-8492'.
 */
export const generateRoomCode = (prefix: string = "LR"): string => {
  const digits = crypto.randomInt(1000, 9999);
  return `${prefix}-${digits}`;
};

/**
 * Generates a cryptographically secure unique invite token for private rooms.
 */
export const generateInviteToken = (): string => {
  return crypto.randomBytes(16).toString("hex");
};
