const express = require("express");
const router = express.Router();

// Import route modules
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const masterRoutes = require("./master.routes");

// Register routes
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/master", masterRoutes);

// Future route registrations will go here:
// router.use("/users", userRoutes);
// router.use("/applications", applicationRoutes);
// router.use("/master", masterRoutes);

module.exports = router;
