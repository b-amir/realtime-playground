const express = require("express");
const cors = require("cors");
const config = require("../config");
const { requestLogger, errorHandler } = require("../middleware");

const app = express();

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(requestLogger);

app.use(errorHandler);

module.exports = app;
