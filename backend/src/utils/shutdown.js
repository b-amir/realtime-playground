function gracefulShutdown() {
  const { server } = require("../server");
  const { wss } = require("../realtime/websocket");
  const { io } = require("../realtime/socketio");
  const { sseClients } = require("../realtime/store");
  const { broadcastServerInfo } = require("./broadcast");
  const { stockIntervals } = require("../services/stocks");
  const { serverStartTime } = require("../realtime/store");

  console.log("Shutting down gracefully...");

  broadcastServerInfo("server_shutdown", {
    message: "Server is shutting down",
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    activeConnections: {
      websocket: wss.clients.size,
      socketio: io.engine.clientsCount,
      sse: sseClients.size,
    },
  });

  Object.keys(stockIntervals).forEach((stockKey) => {
    if (stockIntervals[stockKey]) {
      clearInterval(stockIntervals[stockKey]);
    }
  });

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = {
  gracefulShutdown,
};
