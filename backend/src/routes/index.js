const apiRoutes = require("./api");
const { app } = require("../server");

app.use(apiRoutes);

module.exports = {
  apiRoutes,
};
