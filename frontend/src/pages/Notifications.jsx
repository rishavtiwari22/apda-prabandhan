import { useState } from "react";
import { 
  Bell, Check, Clock, AlertCircle, Inbox, 
  ChevronRight, Filter, Search, CheckCircle2 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import useNotificationStore from "../store/notificationStore";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState("all"); // all, unread, read

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 border border-slate-200 rounded shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
            <Bell size={20} className="text-brand-600" /> Dispatch Center
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Official Notifications & Activity Ledger</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => markAllAsRead()}
            className="gov-btn border border-brand-200 text-brand-600 hover:bg-brand-50 flex items-center gap-2"
          >
            <CheckCircle2 size={14} /> Clear All Alerts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded border text-[9px] font-black uppercase tracking-widest transition-all ${
              filter === f 
                ? "bg-brand-600 text-white border-brand-600 shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:border-brand-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600 mx-auto"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center bg-slate-50">
            <Inbox className="text-slate-300 mx-auto mb-3" size={32} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">No Dispatch Records</h3>
            <p className="text-slate-400 text-xs">Official communications will appear here as they are issued.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification._id}
                onClick={() => {
                  if (notification.relatedApplicationId) {
                    navigate(`/applications/${notification.relatedApplicationId}`);
                  }
                }}
                className={`p-5 flex gap-5 hover:bg-slate-50 cursor-pointer transition-colors relative group ${
                  !notification.isRead ? "bg-brand-50/10 border-l-2 border-l-brand-600" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${
                  !notification.isRead 
                    ? "bg-brand-50 border-brand-100 text-brand-600 shadow-sm" 
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  {notification.title.toLowerCase().includes("resolve") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-black text-xs uppercase tracking-tight ${!notification.isRead ? "text-slate-900" : "text-slate-600"}`}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="p-1 hover:bg-brand-50 rounded text-brand-600 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-brand-100"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mb-3 leading-relaxed">{notification.message}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                      <Clock size={10} /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.relatedApplicationId && (
                      <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest flex items-center gap-1">
                        Examine Case Record <ChevronRight size={10} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
