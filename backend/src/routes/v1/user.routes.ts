import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getMyRooms,
  uploadAvatar,
} from "../../controllers/user.controller.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";
import { uploadSingleImage } from "../../middlewares/upload.middleware.ts";

const router = Router();

// Protect all user routes with JWT authentication
router.use(authenticate);

router.get("/profile", getProfile);
router.patch("/profile", uploadSingleImage("avatar"), updateProfile);
router.post("/avatar", uploadSingleImage("avatar"), uploadAvatar);
router.patch("/avatar", uploadSingleImage("avatar"), uploadAvatar);
router.get("/my-rooms", getMyRooms);

export default router;

