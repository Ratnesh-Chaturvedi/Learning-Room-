import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.ts";
import prisma from "../config/db.ts";
import { ApiError } from "../utils/apiError.ts";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.ts";

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL
);

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}

export class AuthService {
  /**
   * Resiliently finds or creates a user from verified Google payload and signs JWTs.
   */
  private static async upsertGoogleUser(payload: {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  }) {
    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: payload.email }, { googleId: payload.sub }],
        },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            name: payload.name || user.name,
            avatar: payload.picture || user.avatar,
            email: payload.email,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || "LearningRoom User",
            avatar: payload.picture,
          },
        });
      }
    } catch (dbError) {
      console.warn("[AuthService] Database unreachable, using local session user fallback:", dbError);
      user = {
        id: `usr_${payload.sub.slice(0, 16)}`,
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || "LearningRoom User",
        avatar: payload.picture || null,
      };
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return { user, accessToken, refreshToken };
  }

  /**
   * Generates Google OAuth consent screen redirect URL.
   */
  public static getGoogleAuthUrl(redirectUri?: string): string {
    const callback = redirectUri || env.GOOGLE_CALLBACK_URL;
    return googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      prompt: "consent",
      redirect_uri: callback,
    });
  }

  /**
   * Exchanges authorization code for Google user profile and issues JWT tokens.
   */
  public static async processGoogleCallback(code: string, redirectUri?: string) {
    if (!code) {
      throw new ApiError(400, "Authorization code is required from Google.");
    }

    try {
      // 1. Exchange code for tokens (with automatic port 3000 / 5000 fallback resilience)
      const callback = redirectUri || env.GOOGLE_CALLBACK_URL;
      let tokens;
      try {
        const tokenRes = await googleClient.getToken({
          code,
          redirect_uri: callback,
        });
        tokens = tokenRes.tokens;
      } catch (tokenErr) {
        const altCallback = callback.includes(":3000")
          ? callback.replace(":3000", ":5000")
          : callback.replace(":5000", ":3000");
        try {
          const altRes = await googleClient.getToken({
            code,
            redirect_uri: altCallback,
          });
          tokens = altRes.tokens;
        } catch {
          throw tokenErr;
        }
      }

      if (!tokens.id_token) {
        throw new ApiError(400, "Failed to retrieve ID token from Google.");
      }

      // 2. Verify Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new ApiError(400, "Invalid Google profile data received.");
      }

      // 3. Upsert user in PostgreSQL & generate JWT tokens
      return this.upsertGoogleUser({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : "Google authentication failed";
      throw new ApiError(401, `Google OAuth verification error: ${message}`);
    }
  }

  /**
   * Verifies Google One-Tap or ID Token sent directly from frontend Google SDK.
   */
  public static async processGoogleIdToken(idToken: string) {
    if (!idToken) {
      throw new ApiError(400, "Google ID token is required.");
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        throw new ApiError(400, "Invalid Google ID token payload.");
      }

      return this.upsertGoogleUser({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : "Google ID token validation failed";
      throw new ApiError(401, `Google verification error: ${message}`);
    }
  }

  /**
   * Generates a valid database user & authentic signed JWT for dev testing.
   */
  public static async processDevLogin(userNum: number = 1) {
    const isUser1 = userNum !== 2;
    const profile = isUser1
      ? {
          googleId: "dev-google-ratnesh-id-101",
          name: "Ratnesh Chaturvedi",
          email: "ratnesh@learningroom.app",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        }
      : {
          googleId: "dev-google-maya-id-102",
          name: "Ruchi Chaturvedi",
          email: "ruchi@learningroom.app",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
        };

    let user;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ email: profile.email }, { googleId: profile.googleId }],
        },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: profile.name,
            avatar: profile.avatar,
            email: profile.email,
            googleId: profile.googleId,
          },
        });
      } else {
        user = await prisma.user.create({
          data: profile,
        });
      }
    } catch {
      user = {
        id: `dev-user-${userNum}`,
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return { user, accessToken, refreshToken };
  }
}

export default AuthService;

