require("dotenv").config();

const config = require("./config");
const { app: _app, server } = require("./server");
const { initializeServices } = require("./services");
const { serverStartTime } = require("./realtime/store");

require("./realtime");
require("./routes");

initializeServices();

server.listen(config.PORT, () => {
  const serverInfo = {
    startTime: serverStartTime.toISOString(),
    port: config.PORT,
    hostname: config.hostname,
    nodeVersion: process.version,
    platform: process.platform,
    endpoints: {
      websocket: `/websocket`,
      socketio: `/socket.io`,
      sse: `/sse`,
      health: `/health`,
    },
  };

  console.log(`Server running on port ${config.PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${config.PORT}/websocket`);
  console.log(`Socket.IO endpoint: http://localhost:${config.PORT}/socket.io`);
  console.log(`SSE endpoint: http://localhost:${config.PORT}/sse`);

  setTimeout(() => {
    const { broadcastServerInfo } = require("./utils/broadcast");
    broadcastServerInfo("server_start", serverInfo);
  }, 1000);
});
