import http from "node:http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { initSocketServer } from "../src/sockets/index.ts";
import {
  stopRoomExpirationWatcher,
  scheduleEmptyRoomTermination,
  cancelEmptyRoomTermination,
  hasPendingEmptyRoomTermination,
} from "../src/sockets/services/roomSocket.service.ts";
import { generateAccessToken } from "../src/utils/token.utils.ts";
import { roomStateManager } from "../src/sockets/state/roomState.manager.ts";

async function runSocketVerification() {
  console.log("▶ Starting WebRTC, Non-Existent Room, Auth Gate, Empty Room & Kick Verification...");

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  initSocketServer(io);

  const TEST_PORT = 5089;
  await new Promise<void>((resolve) => server.listen(TEST_PORT, "127.0.0.1", resolve));

  const aliceToken = generateAccessToken({ userId: "user-alice-1", email: "alice@learningroom.app" });
  const bobToken = generateAccessToken({ userId: "user-bob-2", email: "bob@learningroom.app" });

  const client1 = Client(`http://127.0.0.1:${TEST_PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
    auth: { token: aliceToken },
  });
  const client2 = Client(`http://127.0.0.1:${TEST_PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
    auth: { token: bobToken },
  });
  const unauthClient = Client(`http://127.0.0.1:${TEST_PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
  });

  // Wait for connections with 5s timeout
  await Promise.race([
    Promise.all([
      new Promise<void>((resolve) => client1.on("connect", () => resolve())),
      new Promise<void>((resolve) => client2.on("connect", () => resolve())),
      new Promise<void>((resolve) => unauthClient.on("connect", () => resolve())),
    ]),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000)),
  ]);
  console.log("✔ Connected test clients to Socket.io server");

  // TEST 1: Unauthenticated user attempt to join room is blocked
  const unauthErrorPromise = new Promise<any>((resolve) => {
    unauthClient.once("room:error", resolve);
  });
  unauthClient.emit("webrtc:join-room", {
    roomId: "LR-SECURE",
  });
  const unauthError = await unauthErrorPromise;
  console.log(`✔ Unauthenticated join rejected as expected: "${unauthError.message}"`);

  // TEST 2: Random non-existent room code (e.g. LR-1002) is rejected with room:not-found
  const notFoundPromise = new Promise<any>((resolve) => {
    client1.once("room:not-found", resolve);
  });
  client1.emit("webrtc:join-room", {
    roomId: "LR-1002",
    user: { id: "user-alice-1", name: "Alice" },
  });
  const notFoundData = await notFoundPromise;
  console.log(`✔ Random non-existent room LR-1002 correctly rejected with room:not-found: "${notFoundData.message}"`);

  // Setup an authorized room in roomStateManager
  const liveRoomCode = "LR-LIVE-ROOM";
  roomStateManager.setRoomMeta(liveRoomCode, {
    id: "live-room-id-123",
    roomCode: liveRoomCode,
    isPrivate: false,
    creatorId: "user-alice-1",
    inviteToken: null,
    status: "ACTIVE",
  });

  // TEST 3: Authenticated Host (Alice) joins valid room
  const c1JoinPromise = new Promise<any>((resolve) => {
    client1.once("webrtc:room-peers", resolve);
  });
  client1.emit("webrtc:join-room", {
    roomId: liveRoomCode,
    user: { id: "user-alice-1", name: "Alice" },
  });
  const c1Data = await c1JoinPromise;
  console.log(`✔ Host (Alice) successfully joined valid room ${liveRoomCode}. Peers: ${c1Data.peers.length}`);

  // TEST 4: Client 2 (Bob) joins room -> Client 1 notified, Client 2 receives Alice
  const c1PeerJoinedPromise = new Promise<any>((resolve) => {
    client1.once("webrtc:peer-joined", resolve);
  });
  const c2JoinPromise = new Promise<any>((resolve) => {
    client2.once("webrtc:room-peers", resolve);
  });

  client2.emit("webrtc:join-room", {
    roomId: liveRoomCode,
    user: { id: "user-bob-2", name: "Bob" },
    initialMediaState: { isAudioMuted: true, isVideoOff: false },
  });

  const [newPeerForC1, c2Data] = await Promise.all([
    c1PeerJoinedPromise,
    c2JoinPromise,
  ]);
  console.log(`✔ Alice notified that ${newPeerForC1.name} joined. Bob received ${c2Data.peers.length} existing peer(s).`);

  // TEST 5: Real-time Canvas update with binary image files
  const c2CanvasPromise = new Promise<any>((resolve) => {
    client2.once("canvas:update", resolve);
  });
  const testCanvasElements = [
    { id: "elem-1", type: "rectangle", x: 10, y: 20, width: 100, height: 50, version: 1 },
    { id: "img-1", type: "image", fileId: "file-photo-1", x: 120, y: 20, width: 200, height: 150 },
  ];
  const testCanvasFiles = {
    "file-photo-1": {
      id: "file-photo-1",
      mimeType: "image/png",
      dataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    },
  };
  client1.emit("canvas:update", {
    roomId: liveRoomCode,
    elements: testCanvasElements,
    files: testCanvasFiles,
    appState: { viewBackgroundColor: "#ffffff" },
  });
  const canvasReceived = await c2CanvasPromise;
  console.log(`✔ Real-time Canvas sync received by Bob: ${canvasReceived.elements.length} element(s), files: ${Object.keys(canvasReceived.files || {}).length}`);

  // TEST 6: Host kicks participant (Bob)
  const c2KickedPromise = new Promise<any>((resolve) => {
    client2.once("room:kicked", resolve);
  });
  const c1KickSuccessPromise = new Promise<any>((resolve) => {
    client1.once("room:kick-success", resolve);
  });
  const c1PeerLeftPromise = new Promise<any>((resolve) => {
    client1.once("webrtc:peer-left", resolve);
  });

  client1.emit("room:kick-peer", {
    roomId: liveRoomCode,
    targetSocketId: client2.id,
    targetUserId: "user-bob-2",
    reason: "Host moderation kick test.",
  });

  const [kickResult, kickSuccess, peerLeft] = await Promise.all([
    c2KickedPromise,
    c1KickSuccessPromise,
    c1PeerLeftPromise,
  ]);
  console.log(`✔ Bob successfully received kick eviction: "${kickResult.reason}"`);
  console.log(`✔ Host received kick confirmation for ${kickSuccess.name}`);
  console.log(`✔ Peer-left event broadcasted for ${peerLeft.name}`);

  // Reconnect client2 (since kick disconnected it immediately)
  client2.connect();
  await new Promise<void>((resolve) => client2.once("connect", () => resolve()));

  // Verify banned user rejoin requires host permission (routed to waiting room with isRejoin: true)
  const rejoinWaitingPromise = new Promise<any>((resolve) => {
    client2.once("room:waiting", resolve);
  });
  const hostKnockPromise = new Promise<any>((resolve) => {
    client1.once("room:knock-request", resolve);
  });
  client2.emit("webrtc:join-room", {
    roomId: liveRoomCode,
    user: { id: "user-bob-2", name: "Bob" },
  });
  const [rejoinWaiting, hostAlert] = await Promise.all([rejoinWaitingPromise, hostKnockPromise]);
  console.log(`✔ Banned participant rejoin requires host request: "${rejoinWaiting.message}" (isRejoin: ${rejoinWaiting.isRejoin})`);
  console.log(`✔ Host received rejoin knock alert for: ${hostAlert.name}`);

  // TEST 7: Empty room 5-minute auto-termination countdown
  scheduleEmptyRoomTermination("LR-EMPTY-TEST", 5000);
  if (!hasPendingEmptyRoomTermination("LR-EMPTY-TEST")) {
    throw new Error("Expected empty room termination timer to be active");
  }
  console.log("✔ Empty room 5-minute auto-termination timer successfully scheduled");

  // Verify cancel on join / cancel function
  cancelEmptyRoomTermination("LR-EMPTY-TEST");
  if (hasPendingEmptyRoomTermination("LR-EMPTY-TEST")) {
    throw new Error("Expected empty room termination timer to be cancelled");
  }
  console.log("✔ Empty room auto-termination countdown successfully cancelled on activity");

  // Clean up
  client1.disconnect();
  client2.disconnect();
  unauthClient.disconnect();
  stopRoomExpirationWatcher();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log("🎉 ALL INTEGRATION TESTS (AUTH GATE, ROOM-NOT-FOUND, KICK PEER, CANVAS FILES & 5-MIN EMPTY ROOM TIMER) PASSED!");
  process.exit(0);
}

runSocketVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
