const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || /^http:\/\/localhost:\d+$/;

const WEBSOCKET_UPDATE_INTERVAL = parseInt(
  process.env.WEBSOCKET_UPDATE_INTERVAL || "500",
  10
);
const SOCKETIO_UPDATE_INTERVAL = parseInt(
  process.env.SOCKETIO_UPDATE_INTERVAL || "750",
  10
);
const SSE_UPDATE_INTERVAL = parseInt(
  process.env.SSE_UPDATE_INTERVAL || "1000",
  10
);

module.exports = {
  PORT,
  CORS_ORIGIN,
  WEBSOCKET_UPDATE_INTERVAL,
  SOCKETIO_UPDATE_INTERVAL,
  SSE_UPDATE_INTERVAL,
};
