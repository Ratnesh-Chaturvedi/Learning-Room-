import prisma from "../src/config/db.ts";
import { AuthService } from "../src/services/auth.service.ts";
import { verifyAccessToken } from "../src/utils/token.utils.ts";

async function runDevLoginVerification() {
  console.log("▶ Starting Dev Login Verification...");

  // 1. Process dev login for User 1 (Ratnesh)
  const result1 = await AuthService.processDevLogin(1);
  console.log(`✔ Dev User 1 generated: ${result1.user.name} (${result1.user.email}) - ID: ${result1.user.id}`);

  // 2. Verify token signature
  const payload1 = verifyAccessToken(result1.accessToken);
  if (payload1.userId !== result1.user.id) {
    throw new Error(`Token payload mismatch: ${payload1.userId} !== ${result1.user.id}`);
  }
  console.log(`✔ Valid JWT Access Token generated and verified for User 1`);

  // 3. Process dev login for User 2 (Maya)
  const result2 = await AuthService.processDevLogin(2);
  console.log(`✔ Dev User 2 generated: ${result2.user.name} (${result2.user.email}) - ID: ${result2.user.id}`);

  const payload2 = verifyAccessToken(result2.accessToken);
  if (payload2.userId !== result2.user.id) {
    throw new Error(`Token payload mismatch: ${payload2.userId} !== ${result2.user.id}`);
  }
  console.log(`✔ Valid JWT Access Token generated and verified for User 2`);

  // 4. Verify both users exist in PostgreSQL Neon DB
  const user1Db = await prisma.user.findUnique({ where: { id: result1.user.id } });
  const user2Db = await prisma.user.findUnique({ where: { id: result2.user.id } });

  if (!user1Db || !user2Db) {
    throw new Error("Users not found in Neon DB");
  }
  console.log("✔ Both dev users verified in live PostgreSQL Neon database");

  console.log("\n🎉 DEV LOGIN FLOW IS 100% OPERATIONAL!\n");
  process.exit(0);
}

runDevLoginVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

