import prisma from "../config/db.ts";
import { ApiError } from "../utils/apiError.ts";

export interface CreateGoalInput {
  title: string;
  description?: string;
  category?: string;
  targetCount?: number;
  dueDate?: string | null;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
  category?: string;
  currentCount?: number;
  targetCount?: number;
  dueDate?: string | null;
}

export class GoalService {
  // Retrieve all goals and to-dos for a given user
  public static async getUserGoals(
    userId: string,
    filter: "all" | "active" | "completed" = "all"
  ) {
    const whereClause: { userId: string; completed?: boolean } = { userId };

    if (filter === "active") {
      whereClause.completed = false;
    } else if (filter === "completed") {
      whereClause.completed = true;
    }

    return prisma.goal.findMany({
      where: whereClause,
      orderBy: [
        { completed: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  // Create new goal or to-do task
  public static async createGoal(userId: string, data: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || "GENERAL",
        targetCount: data.targetCount || 1,
        currentCount: 0,
        completed: false,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
    });
  }

  private static async findUserGoal(goalId: string, userId: string) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) {
      throw new ApiError(404, "Goal or task not found.");
    }
    return existing;
  }

  // Update existing goal or to-do task
  public static async updateGoal(
    userId: string,
    goalId: string,
    data: UpdateGoalInput
  ) {
    const existing = await this.findUserGoal(goalId, userId);

    const updatePayload: Record<string, unknown> = {};

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.targetCount !== undefined) updatePayload.targetCount = data.targetCount;
    if (data.currentCount !== undefined) {
      updatePayload.currentCount = data.currentCount;
      const target = data.targetCount ?? existing.targetCount;
      if (data.currentCount >= target) {
        updatePayload.completed = true;
      }
    }
    if (data.completed !== undefined) {
      updatePayload.completed = data.completed;
      if (data.completed && data.currentCount === undefined) {
        updatePayload.currentCount = data.targetCount ?? existing.targetCount;
      }
    }
    if (data.dueDate !== undefined) {
      updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    return prisma.goal.update({
      where: { id: goalId },
      data: updatePayload,
    });
  }

  // Toggle goal completion state
  public static async toggleGoal(userId: string, goalId: string) {
    const existing = await this.findUserGoal(goalId, userId);

    const nextCompleted = !existing.completed;
    const nextCurrentCount = nextCompleted
      ? existing.targetCount
      : Math.min(existing.currentCount, Math.max(0, existing.targetCount - 1));

    return prisma.goal.update({
      where: { id: goalId },
      data: {
        completed: nextCompleted,
        currentCount: nextCurrentCount,
      },
    });
  }

  // Delete goal or to-do item
  public static async deleteGoal(userId: string, goalId: string) {
    await this.findUserGoal(goalId, userId);

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return { id: goalId, deleted: true };
  }
}

export default GoalService;

