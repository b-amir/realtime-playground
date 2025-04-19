const WebSocket = require("ws");
const url = require("url");
const { connectedClients, getOrCreateBrowserSession } = require("./store");
const { broadcastServerInfo } = require("../utils/broadcast");
const { tradingLogs } = require("../models/stocks");

const wss = new WebSocket.Server({
  noServer: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024,
  },
});

function setupPingPong(ws) {
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("close", () => {
    clearInterval(pingInterval);
  });
}

function initializeWebSocket(server) {
  wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;

    const queryParams = url.parse(req.url, true).query;
    const browserSessionId = queryParams.browserSessionId;

    if (!browserSessionId) {
      console.error(
        `${new Date().toISOString()} - WebSocket connection rejected: Missing browserSessionId from ${ip}`
      );
      ws.close(1008, "Missing browserSessionId");
      return;
    }

    const session = getOrCreateBrowserSession(browserSessionId, ip);

    const clientInfo = {
      id: session.userId,
      role: session.role,
      browserSessionId: browserSessionId,
      ip: ip,
      connectedAt: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
      path: req.url,
    };

    ws.clientId = session.userId;
    connectedClients.websocket.set(ws.clientId, clientInfo);

    console.log(
      `${new Date().toISOString()} - Client connected via WebSocket: User ${
        clientInfo.id
      } (Role: ${clientInfo.role}, Session: ${browserSessionId}) from ${ip}`
    );

    broadcastServerInfo(
      "connection",
      {
        protocol: "WebSocket",
        client: clientInfo,
      },
      "WebSocket"
    );

    try {
      ws.send(
        JSON.stringify({
          type: "server_info",
          eventType: "connection_success",
          data: {
            protocol: "WebSocket",
            client: clientInfo,
            message: "Successfully connected to WebSocket",
          },
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error sending welcome message to WebSocket client User ${
          ws.clientId
        }:`,
        error
      );
    }

    setupPingPong(ws);

    if (tradingLogs.length > 0) {
      try {
        ws.send(
          JSON.stringify({
            type: "trading_log_history",
            data: tradingLogs,
          })
        );
      } catch (error) {
        console.error(
          `${new Date().toISOString()} - Error sending trading log history to User ${
            ws.clientId
          }:`,
          error
        );
      }
    }

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        if (
          message.type === "trading_log" ||
          message.type === "trading_action"
        ) {
          const messageData = message.data;
          messageData.sender = ws.clientId;

          const { broadcastTradingLog } = require("../utils/broadcast");
          broadcastTradingLog(messageData, "websocket");
        }
      } catch (error) {
        console.error(
          `${new Date().toISOString()} - Error handling WebSocket message from User ${
            ws.clientId
          }:`,
          error
        );
        // Optionally send error back to client if needed
        // ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on("error", (error) => {
      const currentClientInfo = connectedClients.websocket.get(ws.clientId);
      console.error(
        `${new Date().toISOString()} - WebSocket error for User ${
          currentClientInfo?.id || "(unknown)"
        } (Session: ${currentClientInfo?.browserSessionId || "N/A"}):`,
        error
      );
      if (currentClientInfo) {
        broadcastServerInfo(
          "connection_error",
          {
            protocol: "WebSocket",
            client: currentClientInfo,
            error: error.message || "Unknown error",
          },
          "WebSocket"
        );
      }
    });

    ws.on("close", (code, reason) => {
      const currentClientInfo = connectedClients.websocket.get(ws.clientId);
      if (currentClientInfo) {
        const reasonStr = reason instanceof Buffer ? reason.toString() : reason;
        console.log(
          `${new Date().toISOString()} - Client disconnected from WebSocket: User ${
            currentClientInfo.id
          } (Role: ${currentClientInfo.role}, Session: ${
            currentClientInfo.browserSessionId
          }), Code: ${code}, Reason: ${reasonStr || "No reason"}`
        );
        connectedClients.websocket.delete(ws.clientId);
        broadcastServerInfo(
          "disconnection",
          {
            protocol: "WebSocket",
            client: currentClientInfo,
            code: code,
            reason: reasonStr || "No reason provided",
          },
          "WebSocket"
        );
      } else {
        console.log(
          `${new Date().toISOString()} - Unknown WebSocket client disconnected (ID: ${
            ws.clientId
          })`
        );
      }
    });
  });

  server.on("upgrade", (request, socket, head) => {
    try {
      const pathname = url.parse(request.url).pathname;
      const clientIp = request.socket.remoteAddress;

      console.log(
        `${new Date().toISOString()} - WebSocket upgrade request from ${clientIp} for path ${pathname}`
      );

      if (pathname === "/websocket") {
        const _upgradeInfo = {
          protocol: "WebSocket",
          ip: clientIp,
          path: pathname,
          headers: {
            upgrade: request.headers.upgrade,
            connection: request.headers.connection,
            userAgent: request.headers["user-agent"],
          },
        };

        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else if (pathname.startsWith("/socket.io/")) {
        // Allow socket.io to handle its upgrade
      } else {
        console.log(
          `${new Date().toISOString()} - Destroying socket for unknown upgrade path: ${pathname} from ${clientIp}`
        );

        broadcastServerInfo(
          "upgrade_rejected",
          {
            protocol: "Unknown",
            ip: clientIp,
            path: pathname,
            reason: "Unknown protocol or path",
          },
          "Unknown"
        );

        socket.destroy();
      }
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error during WebSocket upgrade: ${
          error.message
        }`,
        error
      );
      socket.destroy();

      broadcastServerInfo(
        "upgrade_error",
        {
          error: error.message || "Unknown error during connection upgrade",
        },
        null
      );
    }
  });
}

module.exports = {
  wss,
  initializeWebSocket,
};
