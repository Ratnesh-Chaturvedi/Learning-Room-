import { Router } from "express";
import {
  getGoals,
  createGoal,
  updateGoal,
  toggleGoal,
  deleteGoal,
} from "../../controllers/goal.controller.ts";
import { authenticate } from "../../middlewares/auth.middleware.ts";

const router = Router();

// Protect all goal and to-do endpoints with JWT authentication
router.use(authenticate);

router.get("/", getGoals);
router.post("/", createGoal);
router.patch("/:id", updateGoal);
router.patch("/:id/toggle", toggleGoal);
router.delete("/:id", deleteGoal);

export default router;

