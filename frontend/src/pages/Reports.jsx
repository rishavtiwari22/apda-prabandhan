import { useState, useEffect } from "react";
import { dashboardApi } from "../services/api.service";
import { BarChart3, PieChart, TrendingUp, ArrowLeft, Download, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  submitted: "bg-brand-500",
  under_verification: "bg-indigo-500",
  forwarded: "bg-purple-500",
  documents_pending: "bg-amber-500",
  authorized: "bg-blue-500",
  resolved: "bg-emerald-500",
  rejected: "bg-rose-500",
};

const STATUS_LABELS = {
  submitted: "Submitted",
  under_verification: "Under Verification",
  forwarded: "Forwarded",
  documents_pending: "Pending Documents",
  authorized: "Authorized",
  resolved: "Resolved",
  rejected: "Rejected",
};

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ byStatus: [], byDisaster: [], totals: {} });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getAdminStats();
      const stats = res.data?.data || {};

      // Build byStatus from statusCounts returned by the dashboard service
      const statusCounts = stats.statusCounts || {};
      const byStatus = Object.entries(statusCounts).map(([key, count]) => ({
        label: STATUS_LABELS[key] || key,
        count,
        color: STATUS_COLORS[key] || "bg-slate-500",
      }));

      // Build byDisaster from disasterStats if available
      const byDisaster = (stats.disasterStats || []).map((d) => ({
        label: d.label || d._id || "Unknown",
        count: d.count || 0,
      }));

      const totals = {
        total: stats.totalApplications || 0,
        pending: stats.pendingApplications || 0,
        resolved: stats.resolvedApplications || 0,
      };

      setData({ byStatus, byDisaster, totals });
    } catch (err) {
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadCSV = () => {
    const rows = [
      ["Report Type", "Label", "Count"],
      ...data.byStatus.map((s) => ["By Status", s.label, s.count]),
      ...data.byDisaster.map((d) => ["By Disaster", d.label, d.count]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `apda-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const maxStatusCount = Math.max(...data.byStatus.map((s) => s.count), 1);
  const maxDisasterCount = Math.max(...data.byDisaster.map((d) => d.count), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-6 border border-slate-200 rounded shadow-sm">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-2 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-600" /> Statistical Intelligence Report
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Official Impact Assessment & Case Analytics</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="gov-btn border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={loading || data.byStatus.length === 0}
            className="gov-btn bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Download size={14} /> Generate CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-slate-200 rounded shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest font-bold text-sm">Compiling Official Records...</p>
        </div>
      ) : error ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-slate-200 rounded shadow-sm">
          <p className="text-rose-500 font-bold text-xs mb-4 uppercase tracking-tight">{error}</p>
          <button
            onClick={fetchData}
            className="gov-btn bg-brand-600 text-white hover:bg-brand-700"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white p-6 border border-slate-200 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <PieChart size={18} className="text-brand-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Application Lifecycle Status</h3>
            </div>

            {data.byStatus.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium text-center py-8">Insufficient data for visualization</p>
            ) : (
              <div className="space-y-5">
                {data.byStatus.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                      <span className="text-xs font-black text-slate-900">{s.count} Cases</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 border border-slate-100 rounded-sm overflow-hidden">
                      <div
                        className={`h-full ${s.color} transition-all duration-1000 shadow-sm`}
                        style={{ width: `${(s.count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disaster Type Distribution */}
          <div className="bg-white p-6 border border-slate-200 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <TrendingUp size={18} className="text-amber-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Event Impact Distribution</h3>
            </div>

            {data.byDisaster.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium text-center py-8">Insufficient disaster data</p>
            ) : (
              <div className="flex items-end justify-between h-48 pt-4 gap-4 px-4 overflow-x-auto">
                {data.byDisaster.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 min-w-[50px] flex-1">
                    <div
                      className="w-full bg-brand-600 border border-brand-700/20 rounded-t-sm transition-all duration-1000 hover:brightness-110 cursor-pointer relative group shadow-sm"
                      style={{ height: `${(d.count / maxDisasterCount) * 100}%`, minHeight: "4px" }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-800 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {d.count}
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center leading-tight h-8">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Applications Processed", value: data.totals.total ?? "-", icon: BarChart3, color: "text-brand-600" },
              { label: "Pending Administrative Review", value: data.totals.pending ?? "-", icon: RefreshCw, color: "text-amber-600" },
              { label: "Finalized Case Resolutions", value: data.totals.resolved ?? "-", icon: TrendingUp, color: "text-emerald-600" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 border border-slate-200 rounded shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon size={14} className={stat.color} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
                <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                <div className="mt-2 text-[9px] font-bold text-slate-400 uppercase">Authenticated Live Data</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
