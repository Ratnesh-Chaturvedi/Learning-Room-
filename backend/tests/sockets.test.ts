import http from "node:http";
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { initSocketServer } from "../src/sockets/index.ts";

async function runSocketVerification() {
  console.log("▶ Starting WebRTC & Real-Time Sockets Verification...");

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  initSocketServer(io);

  const TEST_PORT = 5088;
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));

  const client1 = Client(`http://localhost:${TEST_PORT}`, {
    transports: ["websocket"],
  });
  const client2 = Client(`http://localhost:${TEST_PORT}`, {
    transports: ["websocket"],
  });

  const roomId = "test-live-room";

  // Wait for connections
  await Promise.all([
    new Promise<void>((resolve) => client1.on("connect", () => resolve())),
    new Promise<void>((resolve) => client2.on("connect", () => resolve())),
  ]);
  console.log("✔ Both clients connected to Socket.io server");

  // Test 1: Client 1 joins room
  const client1JoinPromise = new Promise<{ peers: unknown[]; self: unknown }>((resolve) => {
    client1.on("webrtc:room-peers", resolve);
  });
  client1.emit("webrtc:join-room", {
    roomId,
    user: { id: "user-1", name: "Alice" },
    initialMediaState: { isAudioMuted: false, isVideoOff: false },
  });
  const c1Data = await client1JoinPromise;
  console.log(`✔ Client 1 (Alice) joined. Existing peers: ${c1Data.peers.length} (expected 0)`);

  // Test 2: Client 2 joins room -> Client 1 notified, Client 2 receives Client 1
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
  console.log(`✔ Client 1 was notified that ${newPeerForC1.name} joined`);
  console.log(`✔ Client 2 received ${c2Data.peers.length} peer(s), peer name: ${c2Data.peers[0].name}`);

  // Test 3: WebRTC Offer / Answer exchange
  const c2OfferPromise = new Promise<{ callerSocketId: string; sdp: any }>((resolve) => {
    client2.on("webrtc:offer", resolve);
  });
  client1.emit("webrtc:offer", {
    targetSocketId: client2.id,
    sdp: { type: "offer", sdp: "dummy-offer-sdp" },
  });
  const offerReceived = await c2OfferPromise;
  console.log(`✔ WebRTC Offer relayed to Client 2 from ${offerReceived.callerSocketId}`);

  const c1AnswerPromise = new Promise<{ responderSocketId: string; sdp: any }>((resolve) => {
    client1.on("webrtc:answer", resolve);
  });
  client2.emit("webrtc:answer", {
    targetSocketId: client1.id,
    sdp: { type: "answer", sdp: "dummy-answer-sdp" },
  });
  const answerReceived = await c1AnswerPromise;
  console.log(`✔ WebRTC Answer relayed to Client 1 from ${answerReceived.responderSocketId}`);

  // Test 4: Media status toggle (Mute audio, Video toggle)
  const c2AudioStatusPromise = new Promise<any>((resolve) => {
    client2.on("media:audio-status-changed", resolve);
  });
  client1.emit("media:toggle-audio", { roomId, isMuted: true });
  const audioStatus = await c2AudioStatusPromise;
  console.log(`✔ Media toggle synchronized: Client 1 audio isMuted = ${audioStatus.isAudioMuted}`);

  // Test 5: Live Chat Message
  const c2ChatPromise = new Promise<any>((resolve) => {
    client2.on("chat:new-message", resolve);
  });
  client1.emit("chat:send-message", {
    roomId,
    text: "Hello from Alice! Can you hear me?",
  });
  const chatMsg = await c2ChatPromise;
  console.log(`✔ Live chat message received by Bob: "${chatMsg.text}" from ${chatMsg.sender.name}`);

  // Test 6: Disconnect cleanup
  const c1PeerLeftPromise = new Promise<any>((resolve) => {
    client1.on("webrtc:peer-left", resolve);
  });
  client2.disconnect();
  const leftData = await c1PeerLeftPromise;
  console.log(`✔ Client 2 disconnected. Client 1 received peer-left notification for user ${leftData.userId}`);

  // Clean up
  client1.disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log("\n🎉 ALL WEBRTC, MEDIA, AND CHAT VERIFICATIONS PASSED SUCCESSFULLY!");
}

runSocketVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
