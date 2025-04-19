const WebSocket = require("ws");

function broadcastServerInfo(type, data, protocol = null) {
  const { sseClients } = require("../realtime/store");
  const { wss } = require("../realtime/websocket");
  const { io } = require("../realtime/socketio");

  const infoData = JSON.stringify({
    type: "server_info",
    eventType: type,
    data: data,
    timestamp: Date.now(),
  });

  if (!protocol || protocol === "WebSocket") {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(infoData);
        } catch (error) {
          console.error("Error sending WebSocket server info:", error);
        }
      }
    });
  }

  if (!protocol || protocol === "Socket.IO") {
    try {
      io.emit("server_info", JSON.parse(infoData));
    } catch (error) {
      console.error("Error sending Socket.IO server info:", error);
    }
  }

  if (!protocol || protocol === "SSE") {
    sseClients.forEach((client) => {
      try {
        client.write(`event: server_info\ndata: ${infoData}\n\n`);
      } catch (error) {
        console.error("Error sending SSE server info:", error);
        sseClients.delete(client);
      }
    });
  }
}

function broadcastToWebSocketClients(data) {
  const { wss } = require("../realtime/websocket");

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  });
}

function broadcastToSocketIOClients(data) {
  const { io } = require("../realtime/socketio");

  try {
    io.emit("stockUpdate", JSON.parse(data));
  } catch (error) {
    console.error("Error sending Socket.IO message:", error);
  }
}

function broadcastToSSEClients(data) {
  const { sseClients } = require("../realtime/store");

  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error("Error sending SSE message:", error);
      sseClients.delete(client);
    }
  });
}

function broadcastTradingLog(message, protocol) {
  const { tradingLogs, MAX_TRADING_LOGS } = require("../models/stocks");
  const { connectedClients, sseClients } = require("../realtime/store");
  const { wss } = require("../realtime/websocket");
  const { io } = require("../realtime/socketio");

  if (protocol === "websocket") {
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.clientId !== message.sender
      ) {
        try {
          client.send(
            JSON.stringify({
              type: "trading_log",
              data: message,
            })
          );
        } catch (error) {
          console.error("Error sending WebSocket trading log:", error);
        }
      }
    });
  }

  if (protocol === "socketio") {
    try {
      io.sockets.sockets.forEach((socket) => {
        const clientInfo = connectedClients.socketio.get(socket.id);
        if (clientInfo && clientInfo.id !== message.sender) {
          socket.emit("trading_log", message);
        }
      });
    } catch (error) {
      console.error("Error sending Socket.IO trading log:", error);
    }
  }

  if (protocol === "sse") {
    sseClients.forEach((client) => {
      const clientInfo = connectedClients.sse.get(client);
      if (clientInfo && clientInfo.id !== message.sender) {
        try {
          client.write(
            `event: trading_log\ndata: ${JSON.stringify(message)}\n\n`
          );
        } catch (error) {
          console.error("Error sending SSE trading log:", error);
          sseClients.delete(client);
        }
      }
    });
  }

  // Only add to logs if it came from a valid protocol
  if (
    protocol === "websocket" ||
    protocol === "socketio" ||
    protocol === "sse"
  ) {
    tradingLogs.push(message);
    if (tradingLogs.length > MAX_TRADING_LOGS) {
      tradingLogs.shift();
    }
  }
}

module.exports = {
  broadcastServerInfo,
  broadcastToWebSocketClients,
  broadcastToSocketIOClients,
  broadcastToSSEClients,
  broadcastTradingLog,
};
