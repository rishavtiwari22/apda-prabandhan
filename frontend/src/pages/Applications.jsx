import { useState, useEffect, useCallback } from "react";
import { applicationApi } from "../services/api.service";
import ApplicationList from "../components/ApplicationList";
import { Search, Filter, Loader2, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Registration" },
  { value: "under_department_review", label: "Department Review" },
  { value: "rejected_by_department", label: "Correction Required" },
  { value: "ready_for_admin", label: "Admin Pending" },
  { value: "approved", label: "Approved" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE = 50;

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const navigate = useNavigate();

  const fetchApplications = useCallback(async (currentSkip = 0) => {
    try {
      setLoading(true);
      const params = { limit: PAGE_SIZE, skip: currentSkip };
      if (statusFilter) params.status = statusFilter;
      const res = await applicationApi.getAll(params);
      setApplications(res.data.data || []);
      setTotal(res.data.total || 0);
      setSkip(currentSkip);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications(0);
  }, [fetchApplications]);

  const handleLoadMore = () => {
    fetchApplications(skip + PAGE_SIZE);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
  };

  // Client-side search on already-fetched page
  const filteredApplications = applications.filter((app) =>
    app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicantInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasActiveFilters = statusFilter !== "";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Applications</h1>
          <p className="text-slate-500 font-medium">Browse and manage all submitted claims.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 bg-white border rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all ${
              hasActiveFilters
                ? "border-brand-400 text-brand-600"
                : "border-slate-200 text-slate-700 hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            <Filter size={18} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-600" />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-premium border border-slate-100">
          <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
          <p className="text-slate-400 font-bold text-sm">Loading records...</p>
        </div>
      ) : (
        <>
          <ApplicationList
            applications={filteredApplications}
            title={`Records (${filteredApplications.length} of ${total} total)`}
            onLoadMore={skip + PAGE_SIZE < total ? handleLoadMore : null}
          />
        </>
      )}
    </div>
  );
};

export default Applications;
