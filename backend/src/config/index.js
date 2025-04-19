const env = require("./env");
const os = require("os");

module.exports = {
  ...env,
  hostname: os.hostname(),
};
