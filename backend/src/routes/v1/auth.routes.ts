import { Router } from "express";
import {
  googleRedirect,
  googleCallback,
  googleCredentialLogin,
  getCurrentUser,
  devLogin,
  logout,
} from "../../controllers/auth.controller.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";

const router = Router();

// 1. Google OAuth Server Redirect Flow (e.g. <a href="/api/v1/auth/google">Sign in with Google</a>)
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);

// 2. Google One-Tap / Frontend Credential Flow
router.post("/google", googleCredentialLogin);

// 3. Quick Dev Mode Login
router.post("/dev-login", devLogin);

// 3. User Session & Profile
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", logout);

export default router;

