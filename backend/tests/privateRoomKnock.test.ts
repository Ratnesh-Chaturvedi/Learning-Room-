import http from "node:http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { initSocketServer } from "../src/sockets/index.ts";
import { roomStateManager } from "../src/sockets/state/roomState.manager.ts";

async function runKnockVerification() {
  console.log("▶ Starting Private Room Waiting Queue (Knock Flow) Verification...");

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  initSocketServer(io);

  const TEST_PORT = 5086;
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));

  const hostClient = Client(`http://localhost:${TEST_PORT}`, { transports: ["websocket"] });
  const guestClient = Client(`http://localhost:${TEST_PORT}`, { transports: ["websocket"] });
  const deniedClient = Client(`http://localhost:${TEST_PORT}`, { transports: ["websocket"] });
  const inviteClient = Client(`http://localhost:${TEST_PORT}`, { transports: ["websocket"] });

  const roomId = "private-meeting-room-101";
  const SECRET_INVITE = "secret-vip-token-999";

  // Pre-seed room metadata as private with host creator "host-user" and invite token
  roomStateManager.setRoomMeta(roomId, {
    id: roomId,
    roomCode: "LR-PRIV",
    isPrivate: true,
    creatorId: "host-user",
    inviteToken: SECRET_INVITE,
  });

  await Promise.all([
    new Promise<void>((r) => hostClient.on("connect", () => r())),
    new Promise<void>((r) => guestClient.on("connect", () => r())),
    new Promise<void>((r) => deniedClient.on("connect", () => r())),
    new Promise<void>((r) => inviteClient.on("connect", () => r())),
  ]);

  // Test 1: Host joins room directly as creator
  const hostJoinPromise = new Promise<{ peers: unknown[]; self: unknown }>((resolve) => {
    hostClient.on("webrtc:room-peers", resolve);
  });

  hostClient.emit("webrtc:join-room", {
    roomId,
    user: { id: "host-user", name: "Host Ratnesh" },
  });

  const hostData = await hostJoinPromise;
  console.log(`✔ Host (Ratnesh) admitted directly as creator (Existing peers: ${hostData.peers.length})`);

  // Test 2: Guest knocks to join private room -> intercepted to waiting room
  const guestWaitingPromise = new Promise<{ roomId: string; message: string }>((resolve) => {
    guestClient.on("room:waiting", resolve);
  });
  const hostKnockPromise = new Promise<any>((resolve) => {
    hostClient.on("room:knock-request", resolve);
  });

  guestClient.emit("webrtc:join-room", {
    roomId,
    user: { id: "guest-user-1", name: "Guest Maya" },
  });

  const [waitingData, knockRequest] = await Promise.all([
    guestWaitingPromise,
    hostKnockPromise,
  ]);
  console.log(`✔ Guest (Maya) routed to waiting room: "${waitingData.message}"`);
  console.log(`✔ Host received knock request alert for: ${knockRequest.name} (${knockRequest.socketId})`);

  // Test 3: Host queries waiting queue
  const queuePromise = new Promise<{ roomId: string; queue: any[] }>((resolve) => {
    hostClient.on("room:waiting-queue", resolve);
  });
  hostClient.emit("room:get-waiting-queue", { roomId });
  const queueData = await queuePromise;
  console.log(`✔ Host verified waiting room count: ${queueData.queue.length} user(s) waiting`);

  // Test 4: Host approves Guest Maya
  const guestApprovedPromise = new Promise<any>((resolve) => {
    guestClient.on("room:knock-approved", resolve);
  });
  const hostPeerJoinedPromise = new Promise<any>((resolve) => {
    hostClient.on("webrtc:peer-joined", resolve);
  });

  hostClient.emit("room:approve-knock", {
    roomId,
    targetSocketId: guestClient.id,
  });

  const [approvedData, peerJoinedData] = await Promise.all([
    guestApprovedPromise,
    hostPeerJoinedPromise,
  ]);
  console.log(`✔ Guest (Maya) admitted into room: ${approvedData.roomId} (Received existing peers: ${approvedData.peers.length})`);
  console.log(`✔ Host notified that ${peerJoinedData.name} has joined the call`);

  // Test 5: Denied user knocks and host denies
  const deniedWaitingPromise = new Promise<any>((resolve) => {
    deniedClient.on("room:waiting", resolve);
  });
  deniedClient.emit("webrtc:join-room", {
    roomId,
    user: { id: "intruder-user", name: "Suspicious Guest" },
  });
  await deniedWaitingPromise;

  const deniedResultPromise = new Promise<any>((resolve) => {
    deniedClient.on("room:knock-denied", resolve);
  });

  hostClient.emit("room:deny-knock", {
    roomId,
    targetSocketId: deniedClient.id,
  });

  const deniedResult = await deniedResultPromise;
  console.log(`✔ Denied user received rejection: "${deniedResult.message}"`);

  // Test 6: Direct Invite Link bypasses waiting room
  const inviteJoinPromise = new Promise<{ peers: unknown[]; self: unknown }>((resolve) => {
    inviteClient.on("webrtc:room-peers", resolve);
  });

  inviteClient.emit("webrtc:join-room", {
    roomId,
    inviteToken: SECRET_INVITE,
    user: { id: "vip-guest", name: "VIP With Invite Link" },
  });

  const inviteData = await inviteJoinPromise;
  console.log(`✔ User with private invite token bypassed waiting room directly (Peers in room: ${inviteData.peers.length})`);

  // Cleanup
  hostClient.disconnect();
  guestClient.disconnect();
  deniedClient.disconnect();
  inviteClient.disconnect();
  await new Promise<void>((r) => server.close(() => r()));

  console.log("\n🎉 FULL PRIVATE ROOM KNOCK & ADMISSION FLOW PASSED SUCCESSFULLY!");
  process.exit(0);
}

runKnockVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
