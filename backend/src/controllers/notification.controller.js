const notificationService = require("../services/notification.service");

/**
 * GET /notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markNotificationAsRead(id, req.user._id);
    
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    const status = error.message.includes("denied") ? 403 : 404;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /notifications/mark-all-read
 */
exports.markAllRead = async (req, res) => {
  try {
    await notificationService.markAllNotificationsAsRead(req.user._id);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
