import { useState, useEffect, useRef } from "react";
import { Bell, Check, Clock, AlertCircle, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { notificationApi } from "../services/api.service";
import { useNavigate } from "react-router-dom";

import useNotificationStore from "../store/notificationStore";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white border border-slate-200 rounded text-slate-500 hover:text-brand-600 hover:bg-slate-50 transition-all"
      >
        <Bell size={18} className={unreadCount > 0 ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded border border-slate-200 shadow-xl z-[999] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Notifications</h4>
             <button 
               onClick={() => markAllAsRead()}
               className="text-[9px] font-bold text-brand-600 uppercase tracking-widest hover:underline"
             >
               Clear All
             </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
             {notifications.length === 0 ? (
               <div className="py-8 text-center">
                  <Inbox className="mx-auto text-slate-200 mb-2" size={24} />
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No New Alerts</p>
               </div>
             ) : (
               <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id}
                      onClick={() => {
                        if (notification.relatedApplicationId) {
                           // Navigate to the official detail view (singular)
                           navigate(`/application/${notification.relatedApplicationId}`);
                        }
                        setIsOpen(false);
                      }}
                      className={`px-4 py-3 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors relative group ${!notification.isRead ? "bg-brand-50/20" : ""}`}
                    >
                       <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${!notification.isRead ? "bg-brand-100 border-brand-200 text-brand-600" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                          {notification.title.includes("Resolve") ? <Check size={14} /> : <AlertCircle size={14} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-bold truncate ${!notification.isRead ? "text-slate-900" : "text-slate-600"}`}>{notification.title}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mb-1">{notification.message}</p>
                          <p className="text-[8px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                             <Clock size={8} /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
             <button 
               onClick={() => {
                 navigate("/notifications");
                 setIsOpen(false);
               }}
               className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-brand-600 transition-colors"
             >
               View All Record
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
