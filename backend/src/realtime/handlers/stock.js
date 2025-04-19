const { broadcastTradingLog } = require("../../utils/broadcast");

function setupStockHandlers(socket, clientId) {
  socket.on("trading_log", (message) => {
    message.sender = clientId;
    broadcastTradingLog(message);
  });

  socket.on("trading_action", (message) => {
    message.sender = clientId;
    broadcastTradingLog(message);
  });
}

module.exports = {
  setupStockHandlers,
};
