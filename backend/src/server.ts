import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.ts";
import prisma from "./config/db.ts";
import { env } from "./config/env.ts";
import { initSocketServer } from "./sockets/index.ts";

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with production CORS & WebRTC transport settings
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize WebRTC, Media, and Live Chat handlers
initSocketServer(io);

// Start Server
server.listen(env.PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
