import { create } from "zustand";
import { notificationApi } from "../services/api.service";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await notificationApi.getAll();
      const notifications = res.data.data;
      set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.isRead).length,
        loading: false 
      });
    } catch (err) {
      console.error("Fetch notifications error:", err);
      set({ loading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => {
      const newNotifications = [notification, ...state.notifications].slice(0, 50);
      return {
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      };
    });
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => {
        const newNotifications = state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(n => !n.isRead).length
        };
      });
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  }
}));

export default useNotificationStore;
