const config = require("../config");

const stocks = {
  websocket: {
    price: 80,
    color: "#3b82f6",
    updateInterval: config.WEBSOCKET_UPDATE_INTERVAL,
    name: "WebSocket",
  },
  socketio: {
    price: 90,
    color: "#8b5cf6",
    updateInterval: config.SOCKETIO_UPDATE_INTERVAL,
    name: "Socket.IO",
  },
  sse: {
    price: 100,
    color: "#ec4899",
    updateInterval: config.SSE_UPDATE_INTERVAL,
    name: "SSE",
  },
};

const tradingLogs = [];
const MAX_TRADING_LOGS = 50;

module.exports = {
  stocks,
  tradingLogs,
  MAX_TRADING_LOGS,
};
