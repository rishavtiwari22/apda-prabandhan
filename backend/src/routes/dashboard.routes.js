const express = require("express");
const router = express.Router();
const { getAdminDashboard, getDepartmentDashboard } = require("../controllers/dashboard.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// All dashboard routes require authentication
router.use(requireAuth);

router.get("/admin", getAdminDashboard);
router.get("/department", getDepartmentDashboard);

module.exports = router;
