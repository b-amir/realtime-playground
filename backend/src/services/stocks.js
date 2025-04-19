const { stocks } = require("../models/stocks");
const {
  broadcastToWebSocketClients,
  broadcastToSocketIOClients,
  broadcastToSSEClients,
} = require("../utils/broadcast");

function generateNewPrice(currentPrice) {
  const volatility = 0.002;
  const percentageChange = (Math.random() - 0.48) * volatility * currentPrice;
  const newPrice = Math.max(1, currentPrice + percentageChange);
  return parseFloat(newPrice.toFixed(2));
}

function broadcastStockPrice(stockKey) {
  try {
    const stock = stocks[stockKey];
    stock.price = generateNewPrice(stock.price);
    const data = JSON.stringify({
      stock: stockKey,
      price: stock.price,
      color: stock.color,
      name: stock.name,
      timestamp: Date.now(),
    });

    switch (stockKey) {
      case "websocket":
        broadcastToWebSocketClients(data);
        break;
      case "socketio":
        broadcastToSocketIOClients(data);
        break;
      case "sse":
        broadcastToSSEClients(data);
        break;
    }
  } catch (error) {
    console.error(`Error broadcasting stock price for ${stockKey}:`, error);
  }
}

const stockIntervals = {};

function initializeStockUpdates() {
  Object.keys(stocks).forEach((stockKey) => {
    stockIntervals[stockKey] = setInterval(
      () => broadcastStockPrice(stockKey),
      stocks[stockKey].updateInterval
    );
  });
}

module.exports = {
  generateNewPrice,
  broadcastStockPrice,
  stockIntervals,
  initializeStockUpdates,
};
