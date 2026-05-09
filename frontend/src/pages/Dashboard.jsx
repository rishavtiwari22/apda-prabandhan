import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Clock, CheckCircle2, ChevronRight, 
  AlertCircle, ArrowRight, TrendingUp, Users, 
  ArrowUpRight, BarChart3, Bell
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { dashboardApi, notificationApi, applicationApi } from "../services/api.service";
import ApplicationList from "../components/ApplicationList";

import useNotificationStore from "../store/notificationStore";

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);

  const { notifications, unreadCount, fetchNotifications } = useNotificationStore();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = isAdmin 
        ? await dashboardApi.getAdminStats() 
        : await dashboardApi.getDepartmentStats();
      setStats(res.data.data);

      const appsRes = await applicationApi.getAll({ limit: 5 });
      setRecentApplications(appsRes.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (path = "/applications") => {
    navigate(path);
  };

  const handleActionClick = (action) => {
    if (action === "Reporting Engine") {
      navigate("/reports");
    } else if (action === "Notifications View All") {
      navigate("/notifications");
    } else if (action === "Excel Export Engine") {
      // Mock a download process
      alert("Preparing Excel Report... Data is being aggregated and encrypted for secure download.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const adminStatsItems = [
    { label: "Total Applications", val: stats?.totalApplications || 0, icon: <FileText className="text-brand-600" />, color: "bg-brand-50", text: "text-brand-700", path: "/applications" },
    { label: "Pending Review", val: stats?.pendingApplications || 0, icon: <Clock className="text-amber-600" />, color: "bg-amber-50", text: "text-amber-700", path: "/applications?status=SUBMITTED" },
    { label: "Resolved Cases", val: stats?.resolvedApplications || 0, icon: <CheckCircle2 className="text-emerald-600" />, color: "bg-emerald-50", text: "text-emerald-700", path: "/applications?status=RESOLVED" },
  ];

  const deptStatsItems = [
    { label: "My Active Cases", val: stats?.myCases || 0, icon: <FileText className="text-brand-600" />, color: "bg-brand-50", text: "text-brand-700", path: "/applications" },
    { label: "Forwarded to Me", val: stats?.forwardedToMe || 0, icon: <ArrowUpRight className="text-indigo-600" />, color: "bg-indigo-50", text: "text-indigo-700", path: "/applications?tab=forwarded" },
    { label: "Pending Docs", val: stats?.pendingDocuments || 0, icon: <AlertCircle className="text-amber-600" />, color: "bg-amber-50", text: "text-amber-700", path: "/applications?status=DOCUMENTS_PENDING" },
  ];

  const statsToDisplay = isAdmin ? adminStatsItems : deptStatsItems;

  return (
    <>
      {/* Notifications Bar (If unread) */}
      {unreadCount > 0 && (
        <div className="mb-6 bg-brand-600 text-white px-6 py-4 rounded-3xl flex items-center justify-between shadow-lg shadow-brand-600/20">
          <div className="flex items-center gap-3">
            <Bell size={20} className="animate-bounce" />
            <span className="font-bold">You have {unreadCount} new notifications</span>
          </div>
          <button 
            onClick={() => handleActionClick("Notifications View All")}
            className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 truncate"
          >
            View Actions
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Session Dashboard</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            स्वागत है (Welcome), <span className="text-brand-600 uppercase">{user?.name}</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest">{isAdmin ? "System Administration Portal | प्रणाली प्रशासन" : "Official Workforce Portal | आधिकारिक कार्यदस्ता"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleActionClick("Reporting Engine")}
            className="px-6 py-3 bg-white border-2 border-slate-200 rounded text-slate-700 font-black text-[10px] uppercase tracking-widest hover:border-brand-600 hover:text-brand-600 flex items-center gap-2 transition-all shadow-sm"
          >
            <BarChart3 size={14} /> Generate Report | रिपोर्ट
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statsToDisplay.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => handleStatClick(stat.path)}
            className="bg-white p-8 rounded border border-slate-200 border-l-4 border-l-brand-600 shadow-sm hover:shadow-md transition-all cursor-pointer relative group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 ${stat.color} rounded flex items-center justify-center border border-slate-100`}>
                {stat.icon}
              </div>
              <ArrowUpRight size={20} className="text-slate-200 group-hover:text-brand-600 transition-colors" />
            </div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{stat.label.split(' (')[0]}</p>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{stat.val.toString().padStart(2, "0")}</h3>
              <div className="px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-brand-600 border border-slate-100">
                 VIEW DETAILS
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Single Column Layout */}
      <div className="space-y-10">
         {/* SECTION TITLE */}
         <div className="flex items-center justify-between px-2 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <FileText className="text-brand-600" size={20} />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">हाल की गतिविधि (Recent Activity)</h2>
            </div>
            <button 
              onClick={() => handleActionClick("Excel Export Engine")}
              className="px-3 py-1.5 bg-brand-50 text-[9px] font-black text-brand-700 uppercase tracking-widest rounded border border-brand-100 hover:bg-brand-100"
            >
              Download List (XLS)
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded">
             <ApplicationList 
               applications={recentApplications} 
               title={isAdmin ? "Central Application Queue | केंद्रीय कतार" : "Official Task Queue | कार्य कतार"} 
             />
          </div>
      </div>
    </>
  );
};

export default Dashboard;
