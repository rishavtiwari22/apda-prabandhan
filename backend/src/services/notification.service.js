const Notification = require("../models/notification.model");

class NotificationService {
  /**
   * Create a new notification for a specific user
   */
  async createNotification(userId, title, message, applicationId = null) {
    if (!userId) return null; // Silence if no user (e.g. public submission)

    const notification = await Notification.create({
      userId,
      title,
      message,
      relatedApplicationId: applicationId,
    });

    // Real-time notification emit
    if (global.io) {
      global.io.to(userId.toString()).emit("notification:new", notification);
      if (process.env.NODE_ENV === "development") console.log(`Notification emitted to room ${userId}`);
    }

    return notification;
  }

  /**
   * Get all notifications for a user, sorted by unread and newest first
   */
  async getUserNotifications(userId) {
    return await Notification.find({ userId })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(50);
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      throw new Error("Notification not found or access denied.");
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllNotificationsAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}


module.exports = new NotificationService();
