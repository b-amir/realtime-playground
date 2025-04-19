const express = require("express");
const { body } = require("express-validator");
const {
  getHealthCheck,
  getApiInfo,
  postTradingLog,
} = require("../controllers/apiController");
const { validateRequest } = require("../middleware");

const router = express.Router();

router.get("/health", getHealthCheck);
router.get("/", getApiInfo);

const tradingLogValidators = [
  body("userId").notEmpty().isString(),
  body("action").notEmpty().isString().isIn(["buy", "sell"]),
  body("symbol").notEmpty().isString(),
  body("amount").notEmpty().isNumeric(),
  body("price").notEmpty().isNumeric(),
];

router.post(
  "/api/trading-log",
  validateRequest(tradingLogValidators),
  postTradingLog
);

module.exports = router;
