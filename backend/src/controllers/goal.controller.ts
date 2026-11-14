import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { ApiError } from "../utils/apiError.ts";
import { GoalService } from "../services/goal.service.ts";
import {
  createGoalSchema,
  updateGoalSchema,
} from "../validators/goal.validator.ts";

// GET /api/v1/goals - Get goals / to-dos for authenticated user
export const getGoals = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const filter = (req.query.filter as "all" | "active" | "completed") || "all";
  const goals = await GoalService.getUserGoals(req.user.id, filter);

  res.status(200).json(
    new ApiResponse(200, "Goals retrieved successfully", {
      count: goals.length,
      goals,
    })
  );
});

// POST /api/v1/goals - Create new goal or to-do item
export const createGoal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const validation = createGoalSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, "Invalid goal data", validation.error.issues);
  }

  const goal = await GoalService.createGoal(req.user.id, validation.data);

  res.status(201).json(
    new ApiResponse(201, "Goal created successfully", { goal })
  );
});

// PATCH /api/v1/goals/:id - Update existing goal or to-do item
export const updateGoal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw new ApiError(400, "Goal ID is required");
  }

  const validation = updateGoalSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, "Invalid update data", validation.error.issues);
  }

  const goal = await GoalService.updateGoal(req.user.id, id, validation.data);

  res.status(200).json(
    new ApiResponse(200, "Goal updated successfully", { goal })
  );
});

// PATCH /api/v1/goals/:id/toggle - Toggle goal completion
export const toggleGoal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw new ApiError(400, "Goal ID is required");
  }

  const goal = await GoalService.toggleGoal(req.user.id, id);

  res.status(200).json(
    new ApiResponse(200, "Goal status toggled successfully", { goal })
  );
});

// DELETE /api/v1/goals/:id - Delete goal or to-do task
export const deleteGoal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw new ApiError(400, "Goal ID is required");
  }

  const result = await GoalService.deleteGoal(req.user.id, id);

  res.status(200).json(
    new ApiResponse(200, "Goal deleted successfully", result)
  );
});

