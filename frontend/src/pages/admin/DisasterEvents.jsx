import { useState, useEffect } from "react";
import { 
  AlertCircle, Search, Filter, ChevronRight, 
  Plus, Calendar, MapPin, Users, CheckCircle, Clock,
  ArrowRight, Download, BarChart3, TrendingUp
} from "lucide-react";
import { disasterEventApi, masterApi } from "../../services/api.service";
import { Link } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-amber-50 text-amber-600 border-amber-100",
    RESOLVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    CLOSED: "bg-slate-50 text-slate-400 border-slate-100"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.CLOSED}`}>
      {status}
    </span>
  );
};

const DisasterEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    district: "",
    block: "",
    status: ""
  });
  const [masters, setMasters] = useState({ districts: [], blocks: [] });

  useEffect(() => {
    masterApi.getDistricts().then(r => setMasters(p => ({ ...p, districts: r.data.data || [] })));
    fetchEvents();
  }, []);

  useEffect(() => {
    if (filters.district) {
      masterApi.getBlocks(filters.district).then(r => setMasters(p => ({ ...p, blocks: r.data.data || [] })));
    } else {
      setMasters(p => ({ ...p, blocks: [] }));
    }
    fetchEvents();
  }, [filters.district, filters.status, filters.block]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await disasterEventApi.getAll(filters);
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Disaster Incidents</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and analyze grouped disaster cases by location and event.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Incidents", val: events.filter(e => e.status === 'ACTIVE').length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Cases", val: events.reduce((s, e) => s + e.totalCases, 0), icon: Users, color: "text-brand-600", bg: "bg-brand-50" },
          { label: "Total Resolved", val: events.reduce((s, e) => s + e.totalResolved, 0), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Compensation", val: `₹${(events.reduce((s, e) => s + (e.totalCompensationAmount || 0), 0) / 100000).toFixed(2)}L`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <h3 className="text-xl font-black text-slate-900">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600" size={18} />
          <input 
            type="text" 
            placeholder="Search by Incident Number..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        
        <select 
          value={filters.district}
          onChange={e => setFilters(p => ({ ...p, district: e.target.value }))}
          className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none"
        >
          <option value="">All Districts</option>
          {masters.districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        <select 
          value={filters.status}
          onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
          className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Incident Data...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
            <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No Incidents Found</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((ev) => (
            <Link 
              key={ev._id} 
              to={`/admin/disaster-events/${ev._id}`}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-600/5 hover:-translate-y-1 transition-all group overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-500">
                      <AlertCircle size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{ev.eventNumber}</span>
                        <StatusBadge status={ev.status} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors uppercase">
                        {ev.disasterType?.name || "Unknown Disaster"}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Date</p>
                    <p className="text-sm font-black text-slate-900">{new Date(ev.incidentDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><MapPin size={16} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Location</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{ev.location?.panchayat?.name || "GP Name"}, {ev.location?.block?.name || "Block"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-400"><TrendingUp size={16} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Resolved Amount</p>
                        <p className="text-xs font-bold text-slate-700">₹{(ev.totalCompensationAmount || 0).toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(ev.totalCases, 3))].map((_, i) => (
                           <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400 text-center"><Users size={12}/></div>
                        ))}
                        {ev.totalCases > 3 && (
                          <div className="w-8 h-8 rounded-full bg-brand-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-brand-600">+{ev.totalCases - 3}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Impacted Cases</p>
                        <p className="text-xs font-black text-slate-900">{ev.totalCases} Households</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-brand-600 font-black text-[10px] uppercase tracking-widest">
                      Analyze Impact <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisasterEvents;
