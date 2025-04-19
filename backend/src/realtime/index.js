const { server } = require("../server");
const { app } = require("../server");
const { initializeWebSocket } = require("./websocket");
const { initializeSocketIO } = require("./socketio");
const { setupSSE } = require("./sse");

initializeWebSocket(server);
initializeSocketIO(server);
setupSSE(app);

module.exports = {
  initializeWebSocket,
  initializeSocketIO,
  setupSSE,
};
