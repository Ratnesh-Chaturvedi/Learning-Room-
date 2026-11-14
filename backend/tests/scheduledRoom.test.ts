import http from "node:http";
import { Server } from "socket.io";
import { io as Client, Socket } from "socket.io-client";
import { initSocketServer } from "../src/sockets/index.ts";
import { roomStateManager } from "../src/sockets/state/roomState.manager.ts";
import { broadcastRoomUpdated, broadcastRoomTerminated } from "../src/sockets/services/roomSocket.service.ts";

const PORT = 5088;
const TEST_SCHEDULED_ROOM = "LR-SCHED-TEST";

async function runScheduledRoomTest() {
  console.log("▶ Starting Scheduled Room Holding & Auto-Activation Test...");

  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  initSocketServer(io);

  await new Promise<void>((resolve) => server.listen(PORT, "127.0.0.1", resolve));

  const futureStart = new Date(Date.now() + 3600000).toISOString();
  const futureEnd = new Date(Date.now() + 7200000).toISOString();

  // Register scheduled room in roomStateManager
  roomStateManager.setRoomMeta(TEST_SCHEDULED_ROOM, {
    id: "sched-test-id",
    roomCode: TEST_SCHEDULED_ROOM,
    isPrivate: false,
    creatorId: "host-user-123",
    status: "SCHEDULED",
    scheduledAt: futureStart,
    scheduledEndTime: futureEnd,
    title: "System Design Prep",
  });

  const clientGuest: Socket = Client(`http://127.0.0.1:${PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
  });

  const clientHost: Socket = Client(`http://127.0.0.1:${PORT}`, {
    transports: ["polling", "websocket"],
    forceNew: true,
  });

  await new Promise<void>((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    clientGuest.on("connect", check);
    clientHost.on("connect", check);
  });

  console.log("✔ Sockets connected to test server");

  // 1. Guest attempts to join scheduled room
  const guestScheduledPromise = new Promise<{ roomId: string; title: string; scheduledAt: string }>((resolve) => {
    clientGuest.on("room:scheduled", (data) => {
      resolve(data);
    });
  });

  clientGuest.emit("webrtc:join-room", {
    roomId: TEST_SCHEDULED_ROOM,
    user: { id: "user-bob", name: "Guest Bob" },
  });

  const scheduledEvent = await guestScheduledPromise;
  console.log("✔ Guest intercepted by scheduled holding room:", scheduledEvent.title);

  // Verify guest is NOT added to live peer mesh yet
  const peersDuringHolding = roomStateManager.getRoomPeers("sched-test-id");
  if (peersDuringHolding.length !== 0) {
    throw new Error(`Expected 0 active peers in scheduled room, found ${peersDuringHolding.length}`);
  }
  console.log("✔ Verified 0 peers in active call while room is in holding state");

  // 2. Host starts meeting early -> broadcastRoomUpdated
  const guestRoomUpdatedPromise = new Promise<{ status: string }>((resolve) => {
    clientGuest.on("room:updated", (data) => {
      if (data?.status === "ACTIVE") resolve(data);
    });
  });

  broadcastRoomUpdated("sched-test-id", TEST_SCHEDULED_ROOM, {
    status: "ACTIVE",
    message: "Meeting has started!",
  });

  const updatedData = await guestRoomUpdatedPromise;
  console.log("✔ Guest received room:updated alert with status:", updatedData.status);

  // 3. Guest re-emits webrtc:join-room now that room is active
  const guestAdmittedPromise = new Promise<{ self: any; peers: any[] }>((resolve) => {
    clientGuest.on("webrtc:room-peers", (payload) => {
      resolve(payload);
    });
  });

  clientGuest.emit("webrtc:join-room", {
    roomId: TEST_SCHEDULED_ROOM,
    user: { id: "user-bob", name: "Guest Bob" },
  });

  const admittedPayload = await guestAdmittedPromise;
  console.log("✔ Guest admitted to live media mesh successfully after room became active! Self:", admittedPayload.self.name);

  // 4. Test termination when duration passes
  const guestTerminatedPromise = new Promise<{ reason: string }>((resolve) => {
    clientGuest.on("room:terminated", (data) => {
      resolve(data);
    });
  });

  broadcastRoomTerminated("sched-test-id", TEST_SCHEDULED_ROOM, "Scheduled meeting has ended.", new Date(), 3600);

  const termData = await guestTerminatedPromise;
  console.log("✔ Room termination verified:", termData.reason);

  clientGuest.disconnect();
  clientHost.disconnect();
  server.close();

  console.log("\n🎉 SCHEDULED ROOM HOLDING & ACTIVATION VERIFIED SUCCESSFULLY!");
  process.exit(0);
}

runScheduledRoomTest().catch((err) => {
  console.error("❌ Scheduled room test failed:", err);
  process.exit(1);
});
