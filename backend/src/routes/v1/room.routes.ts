import { Router } from "express";
import {
  searchRooms,
  getCategories,
  createInstantRoom,
  scheduleRoom,
  getRoomDetails,
  joinRoom,
  leaveRoom,
  startRoom,
  endRoom,
  updateRoom,
  regenerateInviteToken,
  deleteRoom,
} from "../../controllers/room.controller.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";

const router = Router();

// Public / Discovery routes
router.get("/", searchRooms); // Search & filter by ?category=...&query=...
router.get("/categories", getCategories); // List all standard & custom categories
router.get("/:roomCode", getRoomDetails); // Inspect room details

// Protected routes (require user authentication)
router.use(authenticate);

router.post("/instant", createInstantRoom);
router.post("/schedule", scheduleRoom);

router.post("/:roomCode/join", joinRoom);
router.post("/:roomCode/leave", leaveRoom);

router.patch("/:id/start", startRoom);
router.patch("/:id/end", endRoom);
router.patch("/:id", updateRoom);
router.post("/:id/regenerate-invite", regenerateInviteToken);
router.delete("/:id", deleteRoom);

export default router;
