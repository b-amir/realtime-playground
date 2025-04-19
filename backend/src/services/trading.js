const { broadcastTradingLog } = require("../utils/broadcast");

function processTradingLog(message) {
  // broadcastTradingLog(message); // Removed broadcast call
  return { status: "success" };
}

module.exports = {
  processTradingLog,
};
