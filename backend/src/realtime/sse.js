const {
  sseClients,
  connectedClients,
  getOrCreateBrowserSession,
} = require("./store");
const { tradingLogs } = require("../models/stocks");
const { broadcastServerInfo } = require("../utils/broadcast");

function setupSSE(app) {
  app.get("/sse", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    res.write("retry: 10000\n\n");

    const clientIp = req.ip || req.socket.remoteAddress;
    const browserSessionId = req.query.browserSessionId;

    if (!browserSessionId) {
      console.error("SSE connection rejected: Missing browserSessionId");
      res.status(400).end("Missing browserSessionId");
      return;
    }

    const session = getOrCreateBrowserSession(browserSessionId, clientIp);

    const clientInfo = {
      id: session.userId,
      role: session.role,
      browserSessionId: browserSessionId,
      ip: clientIp,
      connectedAt: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
    };

    connectedClients.sse.set(res, clientInfo);
    sseClients.add(res);

    console.log(
      `Client connected via SSE: User ${clientInfo.id} (Role: ${clientInfo.role}, Session: ${browserSessionId}) from ${clientIp}`
    );

    res.write(`event: server_info\n`);
    res.write(
      `data: ${JSON.stringify({
        type: "server_info",
        eventType: "connection",
        data: {
          protocol: "SSE",
          client: clientInfo,
        },
        timestamp: Date.now(),
      })}\n\n`
    );

    res.write(`event: server_info\n`);
    res.write(
      `data: ${JSON.stringify({
        type: "server_info",
        eventType: "connection_success",
        data: {
          protocol: "SSE",
          client: clientInfo,
          message: "Successfully connected to SSE",
        },
        timestamp: Date.now(),
      })}\n\n`
    );

    if (tradingLogs.length > 0) {
      res.write(
        `event: trading_log_history\ndata: ${JSON.stringify(tradingLogs)}\n\n`
      );
    }

    req.on("close", () => {
      const currentClientInfo = connectedClients.sse.get(res);
      if (currentClientInfo) {
        console.log(
          `Client disconnected from SSE: User ${currentClientInfo.id} (Role: ${currentClientInfo.role}, Session: ${currentClientInfo.browserSessionId}) from ${currentClientInfo.ip}`
        );
        connectedClients.sse.delete(res);
        sseClients.delete(res);

        broadcastServerInfo(
          "disconnection",
          {
            protocol: "SSE",
            client: currentClientInfo,
            reason: "Client closed connection",
          },
          "SSE"
        );
      } else {
        console.log(`Unknown SSE client disconnected from ${clientIp}`);
        sseClients.delete(res);
      }
    });
  });
}

module.exports = {
  setupSSE,
};
