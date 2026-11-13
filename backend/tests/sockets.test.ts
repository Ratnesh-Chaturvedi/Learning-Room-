import http from "node:http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { initSocketServer } from "../src/sockets/index.ts";
import { stopRoomExpirationWatcher } from "../src/sockets/services/roomSocket.service.ts";

async function runSocketVerification() {
  console.log("▶ Starting WebRTC, Canvas Sync, Screen Share & Kick Verification...");

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  initSocketServer(io);

  const TEST_PORT = 5089;
  await new Promise<void>((resolve) => server.listen(TEST_PORT, "127.0.0.1", resolve));

  const client1 = Client(`http://127.0.0.1:${TEST_PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
  });
  const client2 = Client(`http://127.0.0.1:${TEST_PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
  });

  const roomId = "test-live-room";

  client1.on("connect_error", (err) => console.error("Client 1 connect_error:", err.message));
  client2.on("connect_error", (err) => console.error("Client 2 connect_error:", err.message));

  // Wait for connections with 5s timeout
  await Promise.race([
    Promise.all([
      new Promise<void>((resolve) => client1.on("connect", () => resolve())),
      new Promise<void>((resolve) => client2.on("connect", () => resolve())),
    ]),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))
  ]);
  console.log("✔ Both clients connected to Socket.io server");

  // Test 1: Client 1 (Alice - Host) joins room
  const client1JoinPromise = new Promise<{ peers: unknown[]; self: unknown }>((resolve) => {
    client1.on("webrtc:room-peers", resolve);
  });
  client1.emit("webrtc:join-room", {
    roomId,
    user: { id: "user-1", name: "Alice" },
    initialMediaState: { isAudioMuted: false, isVideoOff: false },
  });
  const c1Data = await client1JoinPromise;
  console.log(`✔ Client 1 (Alice/Host) joined. Existing peers: ${c1Data.peers.length} (expected 0)`);

  // Test 2: Client 2 (Bob) joins room -> Client 1 notified, Client 2 receives Client 1
  const c1PeerJoinedPromise = new Promise<any>((resolve) => {
    client1.on("webrtc:peer-joined", resolve);
  });
  const c2JoinPromise = new Promise<{ peers: any[]; self: any }>((resolve) => {
    client2.on("webrtc:room-peers", resolve);
  });

  client2.emit("webrtc:join-room", {
    roomId,
    user: { id: "user-2", name: "Bob" },
    initialMediaState: { isAudioMuted: true, isVideoOff: false },
  });

  const [newPeerForC1, c2Data] = await Promise.all([
    c1PeerJoinedPromise,
    c2JoinPromise,
  ]);
  console.log(`✔ Client 1 was notified that ${newPeerForC1.name} joined the room`);
  console.log(`✔ Client 2 received peer list with ${c2Data.peers.length} peer(s), peer name: ${c2Data.peers[0].name}`);

  // Test 3: Screen sharing toggle broadcast
  const c2ScreenSharePromise = new Promise<any>((resolve) => {
    client2.on("media:screenshare-status-changed", resolve);
  });
  client1.emit("media:toggle-screenshare", {
    roomId,
    isScreenSharing: true,
  });
  const screenShareData = await c2ScreenSharePromise;
  console.log(`✔ Screen share status synced to Client 2: isScreenSharing = ${screenShareData.isScreenSharing}`);

  // Test 4: Real-time Canvas update synchronization
  const c2CanvasPromise = new Promise<any>((resolve) => {
    client2.on("canvas:update", resolve);
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
    roomId,
    elements: testCanvasElements,
    files: testCanvasFiles,
    appState: { viewBackgroundColor: "#ffffff" },
  });
  const canvasReceived = await c2CanvasPromise;
  console.log(`✔ Real-time Canvas sync received by Client 2: ${canvasReceived.elements.length} element(s), files: ${Object.keys(canvasReceived.files || {}).length}`);
  if (!canvasReceived.files || !canvasReceived.files["file-photo-1"]) {
    throw new Error("Client 2 did not receive canvas image file dataURL!");
  }

  // Test 5: Live Chat Message
  const c2ChatPromise = new Promise<any>((resolve) => {
    client2.on("chat:new-message", resolve);
  });
  client1.emit("chat:send-message", {
    roomId,
    text: "Hello Bob, screen sharing and canvas are working!",
  });
  const chatMsg = await c2ChatPromise;
  console.log(`✔ Live chat message received by Bob: "${chatMsg.text}" from ${chatMsg.sender.name}`);

  // Test 6: Host ends room session for everyone -> Client 2 receives instant room:terminated
  const c2TerminatedPromise = new Promise<any>((resolve) => {
    client2.on("room:terminated", resolve);
  });
  client1.emit("room:end-session", { roomId });
  const termData = await c2TerminatedPromise;
  console.log(`✔ Client 2 received instant room termination: "${termData.reason}"`);

  // Test 7: Kick functionality verification in new collaborative session
  const testRoom2 = "test-kick-room";
  const c1JoinedPromise = new Promise<any>((resolve) => client1.once("webrtc:room-peers", resolve));
  const c2JoinedPromise = new Promise<any>((resolve) => client2.once("webrtc:room-peers", resolve));

  client1.emit("webrtc:join-room", {
    roomId: testRoom2,
    user: { id: "user-1", name: "Alice" },
  });
  await c1JoinedPromise;

  client2.emit("webrtc:join-room", {
    roomId: testRoom2,
    user: { id: "user-2", name: "Bob" },
  });
  await c2JoinedPromise;

  const c2KickedPromise = new Promise<any>((resolve) => {
    client2.once("room:kicked", resolve);
  });
  const c1PeerLeftPromise = new Promise<any>((resolve) => {
    client1.once("webrtc:peer-left", resolve);
  });

  client1.emit("room:kick-peer", {
    roomId: testRoom2,
    targetSocketId: client2.id,
    reason: "Host requested removal from meeting.",
  });

  const [kickData, peerLeftData] = await Promise.all([
    c2KickedPromise,
    c1PeerLeftPromise,
  ]);
  console.log(`✔ Client 2 was successfully kicked: "${kickData.reason}"`);
  console.log(`✔ Client 1 received peer-left confirmation for kicked user: ${peerLeftData.name}`);

  // Clean up
  client1.disconnect();
  client2.disconnect();
  stopRoomExpirationWatcher();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log("🎉 ALL WEBRTC, SCREEN SHARING, CANVAS SYNC, CHAT, KICK & INSTANT TERMINATION VERIFICATIONS PASSED!");
  process.exit(0);
}

runSocketVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
