import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getMyRooms,
} from "../../controllers/user.controller.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";

const router = Router();

// Protect all user routes with JWT authentication
router.use(authenticate);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/my-rooms", getMyRooms);

export default router;

