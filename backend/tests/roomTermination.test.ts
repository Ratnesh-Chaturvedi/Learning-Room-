import http from "node:http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { initSocketServer } from "../src/sockets/index.ts";
import { broadcastRoomTerminated, broadcastRoomUpdated } from "../src/sockets/services/roomSocket.service.ts";
import { roomStateManager } from "../src/sockets/state/roomState.manager.ts";

async function runTerminationVerification() {
  console.log("▶ Starting Room Termination & Broadcast Verification...");

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  initSocketServer(io);

  const TEST_PORT = 5087;
  await new Promise<void>((resolve) => server.listen(TEST_PORT, "127.0.0.1", () => resolve()));

  const client1 = Client(`http://127.0.0.1:${TEST_PORT}`, { transports: ["polling", "websocket"] });
  const client2 = Client(`http://127.0.0.1:${TEST_PORT}`, { transports: ["polling", "websocket"] });

  const roomId = "term-test-room";
  const roomCode = "LR-9999";

  roomStateManager.setRoomMeta(roomId, {
    id: roomId,
    roomCode,
    isPrivate: false,
    creatorId: "host-1",
  });

  await Promise.all([
    new Promise<void>((resolve) => client1.on("connect", () => resolve())),
    new Promise<void>((resolve) => client2.on("connect", () => resolve())),
  ]);

  // Wait for both clients to complete join
  const join1Promise = new Promise((resolve) => client1.on("webrtc:room-peers", resolve));
  const join2Promise = new Promise((resolve) => client2.on("webrtc:room-peers", resolve));

  client1.emit("webrtc:join-room", { roomId, user: { id: "host-1", name: "HostAlice" } });
  client2.emit("webrtc:join-room", { roomId, user: { id: "user-bob-1", name: "GuestBob" } });

  await Promise.all([join1Promise, join2Promise]);
  console.log("✔ Both clients joined room successfully");

  // Test 1: Live room update broadcast
  const updatePromise = new Promise<any>((resolve) => {
    client2.on("room:updated", resolve);
  });

  broadcastRoomUpdated(roomId, roomCode, {
    title: "Updated Algorithms Review",
    category: "STUDY",
    scheduledEndTime: new Date(Date.now() + 3600000).toISOString(),
  });

  const updatedData = await updatePromise;
  console.log(`✔ Client 2 received live room update: title="${updatedData.title}", category="${updatedData.category}"`);

  // Test 2: Live room termination broadcast
  const terminationPromise = new Promise<any>((resolve) => {
    client2.on("room:terminated", resolve);
  });

  const endedAt = new Date();
  const duration = 1800; // 30 minutes
  broadcastRoomTerminated(roomId, roomCode, "The host has ended this meeting.", endedAt, duration);

  const termData = await terminationPromise;
  console.log(`✔ Client 2 received room termination: reason="${termData.reason}", duration=${termData.duration}s`);

  // Test 3: Verify that after room termination, attempting to join is blocked
  const client3 = Client(`http://127.0.0.1:${TEST_PORT}`, { transports: ["polling", "websocket"] });
  await new Promise<void>((resolve) => client3.on("connect", () => resolve()));

  const rejectedPromise = new Promise<any>((resolve) => {
    client3.on("room:terminated", resolve);
  });

  client3.emit("webrtc:join-room", { roomId, user: { id: "late-user", name: "LateUser" } });
  const rejectData = await rejectedPromise;
  console.log(`✔ Blocked late join on terminated room: reason="${rejectData.reason}"`);

  // Clean up
  client1.disconnect();
  client2.disconnect();
  client3.disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log("\n🎉 ROOM TERMINATION & REAL-TIME BROADCAST VERIFIED SUCCESSFULLY!");
  process.exit(0);
}

runTerminationVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
