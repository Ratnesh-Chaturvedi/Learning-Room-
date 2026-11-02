import prisma from "../src/config/db.ts";
import { GoalService } from "../src/services/goal.service.ts";

async function runGoalServiceVerification() {
  console.log("▶ Starting Goal & To-Do Service Verification...");

  // 1. Ensure test user exists
  const testEmail = "goal.test@learningroom.app";
  let user = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: "test-google-goal-user-id",
        name: "Goal Tester",
        email: testEmail,
        avatar: "https://example.com/avatar.png",
      },
    });
  }
  console.log(`✔ Test user verified: ${user.name} (${user.id})`);

  // Clean up any old test goals
  await prisma.goal.deleteMany({ where: { userId: user.id } });

  // 2. Create a simple to-do
  const todo = await GoalService.createGoal(user.id, {
    title: "Review Dynamic Programming Ch. 4",
    category: "STUDY",
    targetCount: 1,
  });
  console.log(`✔ Created To-Do task: "${todo.title}" (completed: ${todo.completed})`);

  // 3. Create a measurable milestone/goal
  const goal = await GoalService.createGoal(user.id, {
    title: "Complete 5 System Design Mock Interviews",
    category: "MEETING",
    targetCount: 5,
  });
  console.log(`✔ Created Measurable Goal: "${goal.title}" (target: ${goal.targetCount})`);

  // 4. Retrieve user goals
  let goals = await GoalService.getUserGoals(user.id, "all");
  if (goals.length !== 2) {
    throw new Error(`Expected 2 goals, found ${goals.length}`);
  }
  console.log(`✔ Retrieved ${goals.length} goals successfully`);

  // 5. Update goal progress
  const updatedGoal = await GoalService.updateGoal(user.id, goal.id, {
    currentCount: 3,
  });
  if (updatedGoal.currentCount !== 3 || updatedGoal.completed !== false) {
    throw new Error("Goal progress update failed");
  }
  console.log(`✔ Updated progress: ${updatedGoal.currentCount}/${updatedGoal.targetCount}`);

  // 6. Complete goal by reaching target
  const completedGoal = await GoalService.updateGoal(user.id, goal.id, {
    currentCount: 5,
  });
  if (!completedGoal.completed) {
    throw new Error("Goal should be automatically marked completed when currentCount >= targetCount");
  }
  console.log(`✔ Goal auto-completed upon reaching target: completed=${completedGoal.completed}`);

  // 7. Toggle to-do status
  const toggledTodo = await GoalService.toggleGoal(user.id, todo.id);
  if (!toggledTodo.completed) {
    throw new Error("To-Do should be completed after toggle");
  }
  console.log(`✔ Toggled To-Do to completed: ${toggledTodo.completed}`);

  // Toggle back
  const uncompletedTodo = await GoalService.toggleGoal(user.id, todo.id);
  if (uncompletedTodo.completed) {
    throw new Error("To-Do should be uncompleted after second toggle");
  }
  console.log(`✔ Toggled To-Do back to uncompleted: ${uncompletedTodo.completed}`);

  // 8. Delete goal
  const deleteResult = await GoalService.deleteGoal(user.id, goal.id);
  console.log(`✔ Deleted goal: ${deleteResult.id}`);

  goals = await GoalService.getUserGoals(user.id, "all");
  if (goals.length !== 1) {
    throw new Error(`Expected 1 goal remaining, found ${goals.length}`);
  }

  // Cleanup test user
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("✔ Cleanup completed");

  console.log("\n🎉 GOAL & TO-DO BACKEND SERVICE FULLY VERIFIED!\n");
  process.exit(0);
}

runGoalServiceVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

