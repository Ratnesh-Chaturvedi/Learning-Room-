import { EventEmitter } from "node:events";
import { roomStateManager } from "../../src/sockets/state/roomState.manager.ts";
import { registerWebRtcHandlers } from "../../src/sockets/handlers/webrtc.handler.ts";
import { registerChatHandlers } from "../../src/sockets/handlers/chat.handler.ts";
import { registerCanvasHandlers } from "../../src/sockets/handlers/canvas.handler.ts";
import { registerMediaHandlers } from "../../src/sockets/handlers/media.handler.ts";

// Lightweight in-memory Mock Socket implementation
class MockSocket extends EventEmitter {
  public id: string;
  public data: Record<string, any> = {};
  public rooms: Set<string> = new Set();
  public emittedEvents: Array<{ event: string; data: any; targetRooms?: string[] }> = [];
  private server: MockServer;

  constructor(id: string, server: MockServer) {
    super();
    this.id = id;
    this.server = server;
    this.rooms.add(id);
  }

  public join(room: string) {
    this.rooms.add(room);
    this.server.addSocketToRoom(room, this);
  }

  public leave(room: string) {
    this.rooms.delete(room);
    this.server.removeSocketFromRoom(room, this);
  }

  public override emit(event: string, ...args: any[]): boolean {
    this.emittedEvents.push({ event, data: args[0] });
    return super.emit(event, ...args);
  }

  public to(rooms: string | string[]) {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    return {
      emit: (event: string, data: any) => {
        this.server.broadcastToRooms(roomList, event, data, this.id);
      },
    };
  }
}

class MockServer {
  public sockets: Map<string, MockSocket> = new Map();
  public roomSockets: Map<string, Set<MockSocket>> = new Map();

  public createSocket(id: string): MockSocket {
    const socket = new MockSocket(id, this);
    this.sockets.set(id, socket);
    return socket;
  }

  public addSocketToRoom(room: string, socket: MockSocket) {
    if (!this.roomSockets.has(room)) {
      this.roomSockets.set(room, new Set());
    }
    this.roomSockets.get(room)!.add(socket);
  }

  public removeSocketFromRoom(room: string, socket: MockSocket) {
    this.roomSockets.get(room)?.delete(socket);
  }

  public to(rooms: string | string[]) {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    return {
      emit: (event: string, data: any) => {
        this.broadcastToRooms(roomList, event, data);
      },
    };
  }

  public in(rooms: string | string[]) {
    return this.to(rooms);
  }

  public broadcastToRooms(roomList: string[], event: string, data: any, excludeSocketId?: string) {
    const recipients = new Set<MockSocket>();
    for (const room of roomList) {
      const roomMembers = this.roomSockets.get(room);
      if (roomMembers) {
        for (const s of roomMembers) {
          if (!excludeSocketId || s.id !== excludeSocketId) {
            recipients.add(s);
          }
        }
      }
    }
    for (const s of recipients) {
      s.emit(event, data);
    }
  }
}

async function runMockSocketsTest() {
  console.log("▶ Starting in-memory WebRTC, Chat, Canvas & Termination Test...");

  const server = new MockServer();
  const socket1 = server.createSocket("socket-alice-1");
  const socket2 = server.createSocket("socket-bob-2");

  // Register all handlers on both mock sockets
  registerWebRtcHandlers(server as any, socket1 as any);
  registerChatHandlers(server as any, socket1 as any);
  registerCanvasHandlers(server as any, socket1 as any);
  registerMediaHandlers(server as any, socket1 as any);

  registerWebRtcHandlers(server as any, socket2 as any);
  registerChatHandlers(server as any, socket2 as any);
  registerCanvasHandlers(server as any, socket2 as any);
  registerMediaHandlers(server as any, socket2 as any);

  const roomId = "LR-LIVE-TEST";

  // 1. Alice (User 1) joins room
  const alicePeersPromise = new Promise<any>((resolve) => {
    socket1.on("webrtc:room-peers", resolve);
  });

  socket1.emit("webrtc:join-room", {
    roomId,
    user: { id: "user-alice", name: "Alice" },
    initialMediaState: { isAudioMuted: false, isVideoOff: false },
  });

  const aliceData = await alicePeersPromise;
  if (!aliceData || aliceData.peers.length !== 0) {
    throw new Error(`Alice should have 0 existing peers, got ${aliceData?.peers?.length}`);
  }
  console.log("✔ Alice joined successfully as first participant (peers: 0)");

  // 2. Bob (User 2) joins same room
  const aliceSawPeerPromise = new Promise<any>((resolve) => {
    socket1.on("webrtc:peer-joined", resolve);
  });
  const bobPeersPromise = new Promise<any>((resolve) => {
    socket2.on("webrtc:room-peers", resolve);
  });

  socket2.emit("webrtc:join-room", {
    roomId,
    user: { id: "user-bob", name: "Bob" },
    initialMediaState: { isAudioMuted: true, isVideoOff: false },
  });

  const [peerForAlice, bobData] = await Promise.all([
    aliceSawPeerPromise,
    bobPeersPromise,
  ]);

  if (!bobData || bobData.peers.length !== 1 || bobData.peers[0].name !== "Alice") {
    throw new Error(`Bob should see Alice as an existing peer, got ${JSON.stringify(bobData)}`);
  }
  if (!peerForAlice || peerForAlice.name !== "Bob") {
    throw new Error("Alice did not receive webrtc:peer-joined for Bob!");
  }
  console.log("✔ Bob joined and received Alice in peers list, Alice received webrtc:peer-joined for Bob");

  // 3. Chat sync: Alice sends chat message, Bob receives it
  const bobChatPromise = new Promise<any>((resolve) => {
    socket2.on("chat:new-message", resolve);
  });

  socket1.emit("chat:send-message", {
    roomId,
    text: "Hello Bob! Testing live real-time chat sync.",
  });

  const bobReceivedChat = await bobChatPromise;
  if (!bobReceivedChat || bobReceivedChat.text !== "Hello Bob! Testing live real-time chat sync.") {
    throw new Error("Bob did not receive Alice's chat message!");
  }
  console.log("✔ Real-time chat message broadcast and received successfully");

  // 4. Canvas sync: Bob updates canvas, Alice receives it
  const aliceCanvasPromise = new Promise<any>((resolve) => {
    socket1.on("canvas:update", resolve);
  });

  const sampleElements = [{ id: "shape-1", type: "rectangle", x: 100, y: 100 }];
  socket2.emit("canvas:update", {
    roomId,
    elements: sampleElements,
  });

  const aliceReceivedCanvas = await aliceCanvasPromise;
  if (!aliceReceivedCanvas || !Array.isArray(aliceReceivedCanvas.elements) || aliceReceivedCanvas.elements.length !== 1) {
    throw new Error("Alice did not receive Bob's canvas drawing update!");
  }
  console.log("✔ Real-time canvas drawing scene broadcast and received successfully");

  // 5. Media status sync: Bob toggles mute
  const aliceAudioPromise = new Promise<any>((resolve) => {
    socket1.on("media:audio-status-changed", resolve);
  });

  socket2.emit("media:toggle-audio", {
    roomId,
    isMuted: true,
  });

  const aliceReceivedAudioStatus = await aliceAudioPromise;
  if (!aliceReceivedAudioStatus || !aliceReceivedAudioStatus.isAudioMuted) {
    throw new Error("Alice did not receive Bob's audio mute status change!");
  }
  console.log("✔ Live mic mute status change synchronized across peers");

  // 6. Host ends room session: Alice emits room:end-session
  const bobTerminatedPromise = new Promise<any>((resolve) => {
    socket2.on("room:terminated", resolve);
  });

  socket1.emit("room:end-session", { roomId });

  const bobTerminated = await bobTerminatedPromise;
  if (!bobTerminated) {
    throw new Error("Bob was not notified that the room session was ended!");
  }
  console.log("✔ Host room termination broadcasted to all participants");

  // 7. Prevent joining ended room: Charlie (User 3) attempts to join
  const socket3 = server.createSocket("socket-charlie-3");
  registerWebRtcHandlers(server as any, socket3 as any);

  const charlieTerminatedPromise = new Promise<any>((resolve) => {
    socket3.on("room:terminated", resolve);
  });

  socket3.emit("webrtc:join-room", {
    roomId,
    user: { id: "user-charlie", name: "Charlie" },
  });

  const charlieTerminated = await charlieTerminatedPromise;
  if (!charlieTerminated) {
    throw new Error("Charlie was able to join an already ended room!");
  }
  console.log("✔ Charlie was blocked from joining the ended room");

  console.log("\n🎉 ALL 7 REAL-TIME COLLABORATION & TERMINATION TESTS PASSED 100%!");
}

runMockSocketsTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
