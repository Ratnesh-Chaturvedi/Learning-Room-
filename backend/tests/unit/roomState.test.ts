import { roomStateManager } from "../../src/sockets/state/roomState.manager.ts";
import type { PeerUser, ChatMessage } from "../../src/sockets/types/socket.types.ts";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${msg}`);
    process.exit(1);
  }
}

console.log("▶ Testing RoomStateManager canonicalization, state, and termination...");

const canonicalUUID = "9f6b9c9e-1111-2222-3333-444455556666";
const shortCode = "LR-7777";

// 1. Cache metadata linking UUID and short code
roomStateManager.setRoomMeta(canonicalUUID, {
  id: canonicalUUID,
  roomCode: shortCode,
  isPrivate: false,
  creatorId: "user-host",
  status: "ACTIVE",
});

// 2. Verify canonical key resolution
assert(
  roomStateManager.getCanonicalKey(shortCode) === canonicalUUID,
  "getCanonicalKey(shortCode) must resolve to canonicalUUID"
);
assert(
  roomStateManager.getCanonicalKey(canonicalUUID) === canonicalUUID,
  "getCanonicalKey(canonicalUUID) must resolve to canonicalUUID"
);
console.log("✔ Canonical key resolution verified for UUID and shortCode");

// 3. Peer 1 joins via canonical UUID
const peer1: PeerUser = {
  socketId: "socket-peer-1",
  userId: "user-1",
  name: "Alice",
  isAudioMuted: false,
  isVideoOff: false,
  isHandRaised: false,
  joinedAt: new Date().toISOString(),
};
roomStateManager.addPeer(canonicalUUID, peer1);

// 4. Peer 2 joins via shortCode (LR-7777)
const peer2: PeerUser = {
  socketId: "socket-peer-2",
  userId: "user-2",
  name: "Bob",
  isAudioMuted: true,
  isVideoOff: false,
  isHandRaised: false,
  joinedAt: new Date().toISOString(),
};
roomStateManager.addPeer(shortCode, peer2);

// 5. Verify both peers are in the SAME room list regardless of which identifier was used to query
const peersFromUUID = roomStateManager.getRoomPeers(canonicalUUID);
const peersFromCode = roomStateManager.getRoomPeers(shortCode);

assert(peersFromUUID.length === 2, `Expected 2 peers from UUID query, got ${peersFromUUID.length}`);
assert(peersFromCode.length === 2, `Expected 2 peers from Code query, got ${peersFromCode.length}`);
const p0 = peersFromUUID[0];
const p1 = peersFromUUID[1];
assert(Boolean(p0 && p1 && p0.name === "Alice" && p1.name === "Bob"), "Peers must match Alice and Bob");
console.log("✔ Split-brain solved: Both peers are in the exact same room list across UUID and Short Code");

// 6. Test Chat history canonical synchronization
const chatMsg: ChatMessage = {
  id: "msg-1",
  roomId: shortCode,
  sender: { id: "user-1", name: "Alice" },
  text: "Hello Bob!",
  timestamp: new Date().toISOString(),
};
roomStateManager.addChatMessage(shortCode, chatMsg);

const chatFromUUID = roomStateManager.getChatHistory(canonicalUUID);
const chatFromCode = roomStateManager.getChatHistory(shortCode);
assert(chatFromUUID.length === 1 && chatFromCode.length === 1, "Chat history must be accessible from both identifiers");
const c0 = chatFromUUID[0];
assert(Boolean(c0 && c0.text === "Hello Bob!"), "Chat content must match");
console.log("✔ Real-time chat sync verified across canonical channel aliases");

// 7. Test Canvas scene canonical synchronization
const dummyScene = [{ id: "shape-1", type: "rectangle", x: 10, y: 20 }];
roomStateManager.setCanvasScene(shortCode, dummyScene);

const sceneFromUUID = roomStateManager.getCanvasScene(canonicalUUID);
const sceneFromCode = roomStateManager.getCanvasScene(shortCode);
assert(sceneFromUUID.length === 1 && sceneFromCode.length === 1, "Canvas scene must be identical across both identifiers");
console.log("✔ Canvas scene sync verified across canonical channel aliases");

// 8. Test Room Termination & Blocked Join
roomStateManager.markRoomEnded(shortCode);

const metaAfterEnd = roomStateManager.getRoomMeta(shortCode);
assert(metaAfterEnd?.status === "ENDED", "Room metadata status must be ENDED");

const peersAfterEnd = roomStateManager.getRoomPeers(shortCode);
assert(peersAfterEnd.length === 0, "Peers must be cleared after room termination");

const metaFromUUID = roomStateManager.getRoomMeta(canonicalUUID);
assert(metaFromUUID?.status === "ENDED", "UUID metadata status must also be ENDED");
console.log("✔ Room termination verified: in-memory state purged and status marked ENDED for both aliases");

console.log("\n🎉 ALL IN-MEMORY REAL-TIME ROOM TESTS PASSED SUCCESSFULLY!");
process.exit(0);
