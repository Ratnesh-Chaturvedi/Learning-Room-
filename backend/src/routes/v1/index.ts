import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";
import roomRoutes from "./room.routes.ts";
import goalRoutes from "./goal.routes.ts";

const router = Router();

// API v1 Resource Routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);
router.use("/goals", goalRoutes);

export default router;
