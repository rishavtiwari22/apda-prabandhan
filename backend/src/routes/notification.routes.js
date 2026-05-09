const express = require("express");
const router = express.Router();
const { getNotifications, markAsRead, markAllRead } = require("../controllers/notification.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.use(requireAuth);

router.get("/", getNotifications);
router.patch("/mark-all-read", markAllRead);
router.patch("/:id/read", markAsRead);

module.exports = router;
