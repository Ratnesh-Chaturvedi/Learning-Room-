import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import userRoutes from "./user.routes.ts";
import roomRoutes from "./room.routes.ts";
import goalRoutes from "./goal.routes.ts";

const router = Router();

// API v1 Resource Routers
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/rooms", roomRoutes);
router.use("/goals", goalRoutes);

export default router;
