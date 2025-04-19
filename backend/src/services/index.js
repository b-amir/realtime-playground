const stockService = require("./stocks");

function initializeServices() {
  stockService.initializeStockUpdates();
}

module.exports = {
  ...stockService,
  initializeServices,
};
