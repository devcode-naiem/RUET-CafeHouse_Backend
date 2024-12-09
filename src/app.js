// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const cookieParser = require("cookie-parser");

const app = express();

// Middleware
app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://127.0.0.1:5500" || "http://localhost:3000",
      credentials: true,
    })
  );
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Custom request logging middleware
app.use((req, res, next) => {
  logger.request(`${req.method} ${req.url}`);
  next();
});

app.get("/test", (req, res) => {
    res.status(200).json({ message: "Welcome to RUET CafeHouse API!" });
});
// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

module.exports = app;