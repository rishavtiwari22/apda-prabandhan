const express = require("express");
const router = express.Router();

// Import route modules
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const masterRoutes = require("./master.routes");

const applicationRoutes = require("./application.routes");
const notificationRoutes = require("./notification.routes");
const dashboardRoutes = require("./dashboard.routes");
const disasterEventRoutes = require("./disasterEvent.routes");

// Register routes
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/master", masterRoutes);
router.use("/applications", applicationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/disaster-events", disasterEventRoutes);

module.exports = router;
