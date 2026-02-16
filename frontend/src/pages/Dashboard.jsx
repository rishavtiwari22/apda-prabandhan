import { useState } from "react";
import useAuthStore from "../store/authStore";
import {
  Shield, Home, FileText, Send, Bell,
  User as UserIcon, LogOut, Database,
  Users, Map, Menu, X, ChevronRight,
  Clock, CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../services/api";
import { ROLES } from "../constants/roles";

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      { icon: <Home size={20} />, label: "पटल (Overview)", path: "/" },
      { icon: <FileText size={20} />, label: "मेरे आवेदन", path: "/applications" },
      { icon: <Send size={20} />, label: "नया आवेदन करें", path: "/new-application" },
    ];

    if (user?.role === ROLES.ADMIN) {
      return [
        ...common,
        { type: 'divider', label: 'Administration' },
        { icon: <Database size={20} />, label: "आपदा प्रबंधन", path: "/admin/disasters" },
        { icon: <Map size={20} />, label: "भौगोलिक डेटा", path: "/admin/geography" },
        { icon: <Users size={20} />, label: "भूमिका प्रबंधन", path: "/admin/users" },
      ];
    }

    return common;
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 text-brand-600 transition-transform active:scale-95">
          <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/20">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">आपदा प्रबंधन</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto outline-none">
        {menuItems.map((item, i) => {
          if (item.type === 'divider') {
            return (
              <div key={i} className="pt-6 pb-2 px-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
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
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold premium-transition ${
                isActive
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20 translate-x-1"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              {isActive && <ChevronRight size={14} className="opacity-70" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Help Center</p>
           <p className="text-[11px] text-slate-500 leading-relaxed">Need help with registration? Contact helpdesk.</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 premium-transition"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transform transition-transform duration-300 lg:hidden shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute top-5 right-4 lg:hidden">
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative outline-none">
        {/* Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">Dashboard</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 hidden xs:block"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{user?.role?.replace('ROLE_', '')}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-lg shadow-brand-600/10 group-hover:scale-105 transition-transform duration-300">
                <UserIcon size={22} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
             {[
               { label: "Total Applications", val: "00", icon: <FileText className="text-brand-600" />, color: "bg-brand-50", text: "text-brand-700" },
               { label: "In Progress", val: "00", icon: <Clock className="text-amber-600" />, color: "bg-amber-50", text: "text-amber-700" },
               { label: "Approved/Resolved", val: "00", icon: <CheckCircle2 className="text-emerald-600" />, color: "bg-emerald-50", text: "text-emerald-700" },
             ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] shadow-premium border border-slate-100 hover:border-brand-100 transition-all hover:-translate-y-1 duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tabular-nums">{stat.val}</h3>
                </div>
             ))}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-[2rem] shadow-premium border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-brand-600 rounded-full"></div>
                <h4 className="font-bold text-slate-900">Recent Activity</h4>
              </div>
              <button className="text-[11px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-colors bg-white px-4 py-2 rounded-full border border-slate-200">View All</button>
            </div>

            <div className="p-10 sm:p-16 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 relative group">
                <div className="absolute inset-0 bg-brand-600/5 rounded-[2.5rem] scale-0 group-hover:scale-110 transition-transform duration-500"></div>
                <AlertCircle className="text-slate-300 w-12 h-12 relative z-10" />
              </div>
              <h5 className="text-lg font-bold text-slate-800 mb-2">कोई डेटा नहीं मिला (No Record)</h5>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">You haven't submitted any applications yet. Begin your process today.</p>

              <button className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-600/30 hover:bg-brand-700 hover:-translate-y-1 transition-all">
                नया आवेदन शुरू करें <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
