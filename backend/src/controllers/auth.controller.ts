import type { Request, Response, CookieOptions } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { ApiError } from "../utils/apiError.ts";
import { AuthService } from "../services/auth.service.ts";
import { env } from "../config/env.ts";

const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, getAuthCookieOptions());
  res.cookie("refreshToken", refreshToken, {
    ...getAuthCookieOptions(),
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// GET /api/v1/auth/google - Redirect to Google OAuth
export const googleRedirect = asyncHandler(async (_req: Request, res: Response) => {
  const url = AuthService.getGoogleAuthUrl();
  res.redirect(url);
});

// GET /api/v1/auth/google/callback - Process Google OAuth callback
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(String(error))}`);
  }

  if (!code || typeof code !== "string") {
    return res.redirect(`${env.CLIENT_URL}/login?error=Missing%20authorization%20code`);
  }

  try {
    const { user, accessToken, refreshToken } = await AuthService.processGoogleCallback(code);

    // Set HTTP-only secure cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Redirect to frontend dashboard with session data for immediate client sync
    const userParam = encodeURIComponent(JSON.stringify(user));
    return res.redirect(`${env.CLIENT_URL}/dashboard?token=${accessToken}&user=${userParam}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication failed";
    console.error("[Google OAuth Callback Error]:", msg);
    return res.redirect(`${env.CLIENT_URL}/login?error=${encodeURIComponent(msg)}`);
  }
});

// POST /api/v1/auth/google - Login via Google credential token
export const googleCredentialLogin = asyncHandler(async (req: Request, res: Response) => {
  const idToken = req.body?.idToken || req.body?.credential;

  if (!idToken) {
    throw new ApiError(400, "Google credential or idToken is required.");
  }

  const { user, accessToken, refreshToken } = await AuthService.processGoogleIdToken(idToken);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(200, "Signed in successfully with Google", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken,
    })
  );
});

// GET /api/v1/auth/me - Current user profile
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  res.status(200).json(
    new ApiResponse(200, "User profile retrieved successfully", {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
    })
  );
});

// POST /api/v1/auth/dev-login - Development login bypass
export const devLogin = asyncHandler(async (req: Request, res: Response) => {
  if (env.NODE_ENV === "production") {
    throw new ApiError(403, "Dev login is disabled in production.");
  }

  const userNum = req.body?.userNum === 2 ? 2 : 1;
  const { user, accessToken, refreshToken } = await AuthService.processDevLogin(userNum);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json(
    new ApiResponse(200, `Logged in as Dev User ${userNum} successfully`, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      accessToken,
    })
  );
});

// POST /api/v1/auth/logout - Clear auth cookies
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", getAuthCookieOptions());
  res.clearCookie("refreshToken", getAuthCookieOptions());

  res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

