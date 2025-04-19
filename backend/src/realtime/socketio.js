const { Server } = require("socket.io");
const {
  connectedClients,
  getOrCreateBrowserSession,
  getNextUserId: _getNextUserId,
  isAdminAssigned: _isAdminAssigned,
  setAdminAssigned: _setAdminAssigned,
} = require("./store");
const {
  broadcastServerInfo,
  broadcastTradingLog,
} = require("../utils/broadcast");
const { tradingLogs } = require("../models/stocks");
const config = require("../config");

let io;

function initializeSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    path: "/socket.io",
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    const ip = socket.handshake.address;
    const browserSessionId = socket.handshake.query.browserSessionId;

    if (!browserSessionId) {
      console.error(
        `${new Date().toISOString()} - Socket.IO connection rejected: Missing browserSessionId from ${ip}`
      );
      socket.disconnect(true);
      return;
    }

    const session = getOrCreateBrowserSession(browserSessionId, ip);

    const clientInfo = {
      id: session.userId,
      role: session.role,
      browserSessionId: browserSessionId,
      ip: ip,
      connectedAt: new Date().toISOString(),
      userAgent: socket.handshake.headers["user-agent"],
    };

    connectedClients.socketio.set(socket.id, clientInfo);
    socket.userId = session.userId;
    socket.role = session.role;

    console.log(
      `${new Date().toISOString()} - Client connected via Socket.IO: User ${
        clientInfo.id
      } (Role: ${clientInfo.role}, Session: ${browserSessionId}, SocketID: ${
        socket.id
      }) from ${ip}`
    );

    broadcastServerInfo(
      "connection",
      {
        protocol: "Socket.IO",
        client: clientInfo,
      },
      "Socket.IO"
    );

    socket.emit("server_info", {
      type: "server_info",
      eventType: "connection_success",
      data: {
        protocol: "Socket.IO",
        client: clientInfo,
        message: `Successfully connected to Socket.IO as ${clientInfo.role}`,
      },
      timestamp: Date.now(),
    });

    if (tradingLogs.length > 0) {
      socket.emit("trading_log_history", tradingLogs);
    }

    socket.on("trading_action", (message) => {
      const clientInfo = connectedClients.socketio.get(socket.id);
      if (clientInfo && clientInfo.id) {
        console.log(
          `${new Date().toISOString()} - Received trading_action via Socket.IO from User ${
            clientInfo.id
          }:`,
          message
        );
        const messageWithSender = {
          ...message,
          sender: clientInfo.id,
          timestamp: Date.now(),
        };
        broadcastTradingLog(messageWithSender, "socketio");
      } else {
        console.error(
          `${new Date().toISOString()} - Received trading_action from unknown Socket.IO client (SocketID: ${
            socket.id
          })`,
          message
        );
      }
    });

    socket.on("disconnect", (reason) => {
      const currentClientInfo = connectedClients.socketio.get(socket.id);
      if (currentClientInfo) {
        console.log(
          `${new Date().toISOString()} - Client disconnected from Socket.IO: User ${
            currentClientInfo.id
          } (Role: ${currentClientInfo.role}, Session: ${
            currentClientInfo.browserSessionId
          }, SocketID: ${socket.id}), Reason: ${reason}`
        );
        connectedClients.socketio.delete(socket.id);
        broadcastServerInfo(
          "disconnection",
          {
            protocol: "Socket.IO",
            client: currentClientInfo,
            reason: reason,
          },
          "Socket.IO"
        );
      } else {
        console.log(
          `${new Date().toISOString()} - Unknown Socket.IO client disconnected (SocketID: ${
            socket.id
          })`
        );
      }
    });

    socket.on("error", (error) => {
      const currentClientInfo = connectedClients.socketio.get(socket.id);
      console.error(
        `${new Date().toISOString()} - Socket.IO error for User ${
          currentClientInfo?.id || "(unknown)"
        } (SocketID: ${socket.id}):`,
        error
      );
      if (currentClientInfo) {
        broadcastServerInfo(
          "connection_error",
          {
            protocol: "Socket.IO",
            client: currentClientInfo,
            error: error.message || "Unknown error",
          },
          "Socket.IO"
        );
      }
    });
  });
}

module.exports = {
  initializeSocketIO,
  get io() {
    return io;
  },
};
