import { useState, useEffect, cloneElement } from "react";
import useAuthStore from "../store/authStore";
import {
  Shield, Home, FileText, Send, Bell,
  User as UserIcon, LogOut, Database,
  Users, Map, Menu, X, ChevronRight, AlertCircle, Activity
} from "lucide-react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import API from "../services/api";
import { ROLES } from "../constants/roles";
import NotificationDropdown from "./NotificationDropdown";
import { authApi } from "../services/api.service";

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Profile Sync Logic
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await authApi.getMe();
        if (res.data?.data?.user) {
          useAuthStore.getState().updateUser(res.data.data.user);
        }
      } catch (err) {
        console.error("Profile sync failed:", err);
      }
    };
    syncProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      logout();
      navigate("/login");
    }
  };

  const getMenuItems = () => {
    const common = [
      { icon: <Home size={18} />, label: "पटल (Overview)", path: "/dashboard" },
      { icon: <FileText size={18} />, label: "सभी आवेदन (All Applications)", path: "/applications" },
      { icon: <Send size={18} />, label: "नया आवेदन करें (Apply)", path: "/apply" },
    ];

    if (user?.role === ROLES.ADMIN) {
      return [
        ...common,
        { type: 'divider', label: 'System Administration' },
        { icon: <AlertCircle size={18} />, label: "घटना विश्लेषण (Incidents)", path: "/admin/disaster-events" },
        { icon: <Database size={18} />, label: "आपदा प्रकार", path: "/admin/disasters" },
        { icon: <Activity size={18} />, label: "क्षति मानक (Loss Metrics)", path: "/admin/loss-metrics" },
        { icon: <Map size={18} />, label: "भौगोलिक डेटा", path: "/admin/geography" },
        { icon: <Users size={18} />, label: "भूमिका प्रबंधन", path: "/admin/users" },
      ];
    }

    return common;
  };

  const menuItems = getMenuItems();

  const SidebarContent = ({ isCollapsed = false }) => (
    <>
      <div className={`p-5 border-b border-slate-100 flex items-center bg-slate-50/50 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <span className={`font-black text-[10px] text-slate-400 tracking-[0.2em] transition-all duration-300 overflow-hidden whitespace-nowrap uppercase ${
          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        }`}>
          Portal Navigation
        </span>
      </div>

      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-1 overflow-y-auto`}>
        {menuItems.map((item, i) => {
          if (item.type === 'divider') {
            return (
              <div key={i} className={`pt-6 pb-2 border-t border-slate-100 mt-6 mx-2`}>
                {!isCollapsed && (
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                    {item.label}
                  </span>
                )}
              </div>
            );
          }

          const isActive = location.pathname === item.path;

          return (
            <button
              key={i}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              title={isCollapsed ? item.label : ""}
              className={`w-full flex items-center gap-3 py-3 rounded transition-all duration-200 group relative ${
                isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
              } ${
                isActive
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                : "text-slate-600 hover:bg-slate-50 hover:text-brand-600"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-600"}`}>
                {item.icon}
              </span>
              <span className={`text-base font-bold tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"
              }`}>
                {item.label}
              </span>
              {isActive && !isCollapsed && <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-600 rounded-r-full" />}
            </button>
          )
        })}
      </nav>

      <div className={`mt-auto border-t border-slate-100 p-4`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 py-3 px-3 rounded text-sm font-bold text-slate-500 hover:text-gov-red hover:bg-red-50 transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Sign Out | लॉग आउट</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-[#f1f5f9] overflow-hidden font-sans">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside 
          className={`${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 hidden lg:flex flex-col relative transition-all duration-300 ease-in-out z-20`}
        >
          <SidebarContent isCollapsed={isSidebarCollapsed} />
          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-300 shadow-sm transition-all z-30"
          >
            <ChevronRight size={14} className={`transition-transform ${isSidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </aside>

        {/* Mobile Sidebar Content */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 lg:hidden shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="font-black text-xs text-[#003366] uppercase tracking-widest">Digital Portal Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <SidebarContent />
        </aside>

        {/* Desktop Navbar for mobile toggle etc */}
        <div className="flex-1 flex flex-col overflow-hidden">
           <header className="lg:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-600"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white shadow-sm">
                   <Shield size={18} />
                 </div>
                 <h2 className="text-xs font-black text-[#003366] tracking-tight">JASHPUR PORTAL</h2>
              </div>
           </header>

          {/* User Status Bar */}
          <div className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center z-50 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="flex flex-col">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Territory</p>
                   <p className="text-xs font-bold text-slate-800">{user?.assignedDistrict?.name || user?.assignedBlock?.name || "State Headquarters"}</p>
                </div>
             </div>
             
             <div className="flex items-center gap-6">
                <NotificationDropdown />
                <div className="h-6 w-[1px] bg-slate-200 hidden xs:block"></div>
                <div 
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-[#003366] leading-none mb-1 group-hover:text-brand-700 transition-colors">{user?.name}</p>
                    <span className="text-[9px] font-black text-gov-red uppercase tracking-widest">
                      {user?.role?.toUpperCase()} | {user?.designation?.toUpperCase() || user?.departmentType?.toUpperCase() || "CITIZEN"}
                    </span>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 group-hover:border-brand-300 group-hover:bg-brand-50 transition-all">
                    <UserIcon size={18} />
                  </div>
                </div>
             </div>
          </div>

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-10">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
