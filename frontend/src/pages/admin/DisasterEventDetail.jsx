import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  AlertCircle, ArrowLeft, Calendar, MapPin, 
  Users, CheckCircle, Clock, IndianRupee,
  ChevronRight, Filter, Search, BarChart3,
  TrendingDown, FileText, LayoutDashboard,
  MessageSquare, Trash2, ShieldCheck, 
  Activity, Home, User, Send, CheckSquare,
  AlertTriangle, Info, X
} from "lucide-react";
import { disasterEventApi, applicationApi, authApi, masterApi } from "../../services/api.service";
import useAuthStore from "../../store/authStore";
import { format } from "date-fns";

// High-Density Info Row Component
const InfoRow = ({ label, value, icon: Icon, color = "text-slate-400" }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 px-2 rounded-lg transition-all">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 bg-white border border-slate-100 rounded-lg group-hover:border-brand-100 transition-colors ${color}`}>
        <Icon size={14} />
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xs font-black text-slate-800 tracking-tight">{value || "N/A"}</span>
  </div>
);

// Vertical Audit Trail Component
const AuditTrail = ({ logs }) => (
  <div className="space-y-0.5 relative after:absolute after:left-[17px] after:top-8 after:bottom-4 after:w-px after:bg-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {logs && logs.length > 0 ? (
      logs.map((log, index) => (
        <div key={index} className="flex gap-6 p-4 rounded-3xl transition-all hover:bg-slate-50 group relative z-10">
          <div className="relative flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border-2 transition-all ${
              log.action.includes('RESOLVE') ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
              log.action.includes('FORWARD') ? "bg-brand-50 border-brand-100 text-brand-600" :
              "bg-white border-slate-200 text-slate-400"
            }`}>
              {log.action.includes('RESOLVE') ? <ShieldCheck size={16} /> : <Activity size={16} />}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest leading-none mb-1.5">{log.action.replace(/_/g, ' ')}</span>
                <span className="text-sm font-black text-slate-900 tracking-tight">
                  {log.performedBy?.name || "System Automated"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Authenticated At</p>
                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 border border-slate-100 rounded-lg">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:border-brand-100 transition-colors">
              <div className="flex items-start gap-2 mb-2">
                <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-black uppercase tracking-widest">{log.performedBy?.designation || log.performedBy?.role || "OFFICIAL"}</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                 "{log.remarks || 'No formal remarks provided for this systemic transition.'}"
              </p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
        <Clock size={40} className="mx-auto mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Initial Verification Log...</p>
      </div>
    )}
  </div>
);

const ApplicationRow = ({ app, isPublic }) => (
  <Link 
    to={isPublic ? `/applications/${app._id}` : `/admin/applications/${app._id}`}
    className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-all">
        <FileText size={18} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 group-hover:text-brand-600 tracking-tight transition-colors">{app.applicationNumber}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.applicantInfo?.name || "Citizen"}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-8">
      <div className="text-right min-w-[80px]">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shadow-sm ${
            app.status === 'resolved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
            app.status === 'forwarded' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
            "bg-amber-50 text-amber-600 border-amber-100"
        }`}>
          {app.status}
        </span>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 group-hover:text-brand-600 transition-all" />
    </div>
  </Link>
);

const DisasterEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");

  const isAdmin = user?.role === "admin";
  const isSubAdmin = user?.role === "sub-admin";
  const isPublic = user?.role === "public";
  const canManage = isAdmin || isSubAdmin;
  
  // Batch Action States
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchData, setBatchData] = useState({
    forwardToId: "",
    remarks: "",
    resolutionNote: "",
    paymentAmount: 0
  });

  useEffect(() => {
    fetchEventDetails();
    fetchUsers();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const res = await disasterEventApi.getDetails(id);
      setEvent(res.data.data);
      setApplications(res.data.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authApi.getAllUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users for batch forward", err);
    }
  };

  const handleBatchAction = async (action) => {
    setBatchLoading(true);
    try {
      const res = await disasterEventApi.batchAction(id, {
        action,
        payload: batchData
      });
      alert(res.data.message);
      setShowForwardModal(false);
      setShowResolveModal(false);
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Batch action failed");
    } finally {
      setBatchLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating Institutional Portfolio...</p>
    </div>
  );

  if (!event) return (
    <div className="p-20 text-center">
      <AlertCircle size={48} className="mx-auto text-rose-500 mb-4 opacity-20" />
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Incident Intelligence Not Found</h2>
      <button onClick={() => navigate(-1)} className="text-brand-600 font-bold mt-4 inline-flex items-center gap-2 hover:gap-3 transition-all"><ArrowLeft size={16}/> Return Back</button>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-200 rounded-3xl text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/5 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-brand-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                {isPublic ? "Community Response Analysis" : "Central Case Analysis"}
              </p>
            </div>
            <div className="flex items-center gap-4">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 {event.eventNumber}
                 <div className="px-3 py-1 bg-brand-50 text-brand-600 border border-brand-100 rounded-xl text-[10px] uppercase tracking-widest font-black shadow-sm">INCIDENT CLUSTER</div>
               </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="px-6 py-4 bg-white border border-slate-100 rounded-[2rem] flex items-center gap-4 shadow-sm">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cluster Status</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.status}</p>
              </div>
              <div className={`w-3 h-3 rounded-full animate-pulse ${event.status === 'ACTIVE' ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"}`}></div>
           </div>
           
           <button className="gov-btn bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10">
              <BarChart3 size={16} /> Impact Report
           </button>
        </div>
      </div>

      {/* Main High-Density Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Analytics & Quick Stats */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
           <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                <LayoutDashboard size={16} className="text-brand-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Cluster Metrics</h3>
             </div>
             
             <div className="space-y-2">
                <InfoRow label="Total Cases" value={event.totalCases} icon={Users} color="text-blue-500" />
                <InfoRow label="Resolved" value={event.totalResolved} icon={CheckCircle} color="text-emerald-500" />
                <InfoRow label="Recovery Rate" value={`${((event.totalResolved / (event.totalCases || 1)) * 100).toFixed(1)}%`} icon={TrendingUp} color="text-amber-500" />
                <div className="pt-4 mt-2 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Aggregate Payout</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">₹{(event.totalCompensationAmount || 0).toLocaleString()}</p>
                </div>
             </div>
           </div>

           <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-[3rem] p-8 text-white shadow-xl shadow-brand-600/20 relative overflow-hidden group">
              <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Loss Distribution</p>
              <div className="space-y-4 relative z-10">
                 {['Loss (जनहानि)', 'Livestock (पशु)', 'House (मकान)'].map((l, i) => {
                    const count = applications.filter(a => a.lossTypes?.some(lt => l.includes(lt))).length;
                    const perc = applications.length ? (count / applications.length) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black uppercase mb-1.5 font-bold">
                           <span>{l}</span>
                           <span>{count}</span>
                        </div>
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                           <div className="h-full bg-white rounded-full" style={{ width: `${perc}%` }}></div>
                        </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Center Column: Scoped Content (Applications / Audit) */}
        <div className="lg:col-span-6 space-y-6">
           <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
              <div className="flex items-center bg-slate-50/50 px-10 border-b border-slate-100">
                {[
                  { id: "applications", label: "Associated Cases", icon: Users },
                  { id: "timeline", label: "Incident History", icon: Clock },
                  { id: "details", label: "Spatial Intelligence", icon: MapPin }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-8 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all flex items-center gap-2 ${
                      activeTab === tab.id ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <tab.icon size={14} className={activeTab === tab.id ? "text-brand-600" : "text-slate-300"} />
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"></div>}
                  </button>
                ))}
              </div>

              <div className="p-10">
                {activeTab === "applications" && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                       <div className="relative flex-1 max-w-md group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-600" size={16} />
                          <input type="text" placeholder="Search cluster applications..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:bg-white transition-all shadow-inner" />
                       </div>
                       <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-100 transition-all shadow-sm group">
                          <Filter size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                       </button>
                    </div>

                    <div className="divide-y divide-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                      {applications.length > 0 ? (
                        applications.map(app => <ApplicationRow key={app._id} app={app} isPublic={isPublic} />)
                      ) : (
                        <div className="py-20 text-center text-slate-300">
                           <FileText size={48} className="mx-auto mb-4 opacity-10" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No cases synchronized with this record.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "timeline" && <AuditTrail logs={event.auditLogs} />}

                {activeTab === "details" && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Temporal Context</p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-600"><Calendar size={20}/></div>
                              <div>
                                <p className="text-xs font-black text-slate-900">{new Date(event.incidentDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reporting Date Baseline</p>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Incident Magnitude</p>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-600"><AlertCircle size={20}/></div>
                              <div>
                                <p className="text-xs font-black text-slate-900">{event.disasterType?.name || "Incident"}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validated Event Type</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
                        <MapPin className="absolute top-4 right-4 w-24 h-24 text-white/5" />
                        <h4 className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-4">Location Integrity</h4>
                        <div className="space-y-3 relative z-10">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                              <span className="text-sm font-black tracking-tight">{event.location?.village}, {event.location?.panchayat?.name}</span>
                           </div>
                           <div className="flex items-center gap-3 opacity-60">
                              <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                              <span className="text-xs font-bold">{event.location?.block?.name} Block, {event.location?.district?.name} District</span>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Official Narrative</h4>
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                           "{event.description || "No systemic narrative provided for this cluster. All reporting follows standard institutional protocols based on spatial and temporal matching."}"
                        </p>
                     </div>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Right Column: Sticky Meta & Batch Controls */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
           {canManage && (
             <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Administrative Actions</h3>
               </div>
               
               <div className="space-y-3">
                  <button 
                    onClick={() => setShowForwardModal(true)}
                    className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all hover:-translate-y-1"
                  >
                    <Send size={16} /> Mass Forward All
                  </button>
                  <button 
                     onClick={() => setShowResolveModal(true)}
                     className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:-translate-y-1"
                  >
                    <CheckSquare size={16} /> Bulk Resolve Cases
                  </button>
                  <p className="text-[9px] font-bold text-slate-400 text-center px-4 leading-relaxed mt-4 italic">
                    * Batch actions affect all currently active and synchronized cases in this cluster.
                  </p>
               </div>
             </div>
           )}

           <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Metadata</h4>
              <div className="space-y-4">
                 <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Created By</p>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center"><User size={12} className="text-slate-400" /></div>
                       <span className="text-[10px] font-black text-slate-700">{event.createdBy?.name || "System"}</span>
                    </div>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Created On</p>
                    <span className="text-[10px] font-black text-slate-700">{new Date(event.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* --- Batch Forward All Modal --- */}
      {showForwardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowForwardModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-slate-50">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                      <Send className="text-brand-600" /> Batch Forwarding
                   </h3>
                   <button onClick={() => setShowForwardModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><X size={20} /></button>
                </div>
                <p className="text-xs font-semibold text-slate-500">Redirect all active cases in this cluster to another official for verification.</p>
             </div>
             
             <div className="p-8 space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Official / Handler</label>
                   <select 
                      value={batchData.forwardToId}
                      onChange={(e) => setBatchData({...batchData, forwardToId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/10 focus:outline-none"
                   >
                      <option value="">Select Official...</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role?.toUpperCase() || "N/A"})</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Administrative Remarks</label>
                   <textarea 
                     rows="3"
                     value={batchData.remarks}
                     onChange={(e) => setBatchData({...batchData, remarks: e.target.value})}
                     placeholder="State the reason for this mass transition..."
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/10 focus:outline-none resize-none"
                   ></textarea>
                </div>
             </div>
             
             <div className="p-8 bg-slate-50 flex items-center gap-4">
                <button onClick={() => setShowForwardModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">Discard</button>
                <button 
                  disabled={batchLoading || !batchData.forwardToId}
                  onClick={() => handleBatchAction("FORWARD_ALL")}
                  className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-600/20 hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {batchLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
                  Confirm Mass Forward
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- Batch Resolve All Modal --- */}
      {showResolveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowResolveModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-8 border-b border-slate-50">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                      <CheckSquare className="text-emerald-600" /> Bulk Resolution
                   </h3>
                   <button onClick={() => setShowResolveModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><X size={20} /></button>
                </div>
                <p className="text-xs font-bold text-slate-500">Authorize final compensation for all linked cases in this incident cluster.</p>
             </div>
             
             <div className="p-8 space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Compensation Amount (₹)</label>
                   <p className="text-[9px] font-bold text-amber-600 mb-3 uppercase tracking-tighter">* This amount will be applied to EACH case individually.</p>
                   <div className="relative">
                     <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input 
                        type="number" 
                        value={batchData.paymentAmount}
                        onChange={(e) => setBatchData({...batchData, paymentAmount: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black focus:ring-2 focus:ring-emerald-500/10 focus:outline-none" 
                        placeholder="0.00" 
                     />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Final Resolution Note</label>
                   <textarea 
                     rows="3"
                     value={batchData.resolutionNote}
                     onChange={(e) => setBatchData({...batchData, resolutionNote: e.target.value})}
                     placeholder="State the official resolution outcome..."
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/10 focus:outline-none resize-none"
                   ></textarea>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                   <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                   <p className="text-[10px] font-black text-amber-700 leading-relaxed uppercase tracking-tight">
                     Critical: Mass resolution will mark all cases as 'RESOLVED' and initiate the central payment workflow. This action is recorded in the institutional audit log.
                   </p>
                </div>
             </div>
             
             <div className="p-8 bg-slate-50 flex items-center gap-4">
                <button onClick={() => setShowResolveModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">Abort</button>
                <button 
                  disabled={batchLoading || !batchData.paymentAmount || !batchData.resolutionNote}
                  onClick={() => handleBatchAction("RESOLVE_ALL")}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {batchLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <CheckSquare size={16} />}
                  Execute Bulk Payout
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterEventDetail;
