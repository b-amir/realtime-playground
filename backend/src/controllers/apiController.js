const os = require("os");
const { sseClients, serverStartTime } = require("../realtime/store");
const { wss } = require("../realtime/websocket");
const { io } = require("../realtime/socketio");
const { processTradingLog } = require("../services/trading");

function getHealthCheck(req, res) {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    connections: {
      websocket: wss.clients.size,
      socketio: io.engine.clientsCount,
      sse: sseClients.size,
    },
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    hostname: os.hostname(),
  });
}

function getApiInfo(req, res) {
  res.json({
    message: "Financial Dashboard API",
    endpoints: {
      websocket: "/websocket",
      socketio: "/socket.io",
      sse: "/sse",
      health: "/health",
    },
    serverStartTime: serverStartTime.toISOString(),
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
  });
}

function postTradingLog(req, res) {
  try {
    const message = req.body;
    const result = processTradingLog(message);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling trading log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getHealthCheck,
  getApiInfo,
  postTradingLog,
};
