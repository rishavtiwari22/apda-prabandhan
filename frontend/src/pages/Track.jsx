import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Search, 
  SearchX, 
  MapPin, 
  Calendar, 
  Activity, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
  User,
  History,
  AlertTriangle,
  Loader2,
  Home,
  Upload
} from "lucide-react";
import { applicationApi } from "../services/api.service";
import { format } from "date-fns";

const Track = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialId = searchParams.get("id") || "";
  
  const [appNumber, setAppNumber] = useState(initialId);
  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, not_found, error
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const handleTrack = async (number = appNumber) => {
    if (!number) return;
    
    setStatus("loading");
    setError("");
    setApplication(null);

    try {
      const res = await applicationApi.track(number);
      if (res.data.success) {
        setApplication(res.data.data);
        setStatus("success");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStatus("not_found");
      } else {
        setError(err.response?.data?.message || "Something went wrong while tracking.");
        setStatus("error");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1.5"><Clock size={12} /> Received</span>;
      case "FORWARDED":
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100 flex items-center gap-1.5"><Activity size={12} /> Under Review</span>;
      case "DOCUMENTS_PENDING":
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100 flex items-center gap-1.5"><AlertTriangle size={12} /> Documents Required</span>;
      case "RESOLVED":
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5"><CheckCircle2 size={12} /> Approved</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 bg-white p-6 border border-slate-200 rounded shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-brand-600 rounded text-white shadow-sm">
                <Search size={16} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Service Portal</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Application Tracking System</h1>
            <p className="text-slate-500 text-xs font-medium">Monitor your application status using uniquely assigned reference number.</p>
          </div>
          
          <button 
            onClick={() => navigate("/")}
            className="gov-btn border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Home size={16} /> Return Home
          </button>
        </div>

        {/* Search Bar - Gov Style */}
        <div className="bg-white rounded border border-slate-200 p-6 shadow-sm mb-8">
           <label className="gov-label mb-2">Enter Application Identity Number <span className="text-red-500">*</span></label>
           <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <ClipboardList size={18} />
              </div>
              <input
                type="text"
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value.toUpperCase())}
                placeholder="Ex: APDA-2026-XXXX"
                className="gov-input pl-12 font-mono"
              />
            </div>
            <button
              onClick={() => handleTrack()}
              disabled={status === "loading" || !appNumber}
              className="gov-btn bg-brand-600 text-white shadow-sm flex items-center justify-center gap-2 font-bold px-8"
            >
              {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : "Query Status"}
            </button>
          </div>
        </div>

        {/* Results */}
        {status === "success" && application && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Overview Card */}
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-brand-600" />
                    Application Record Detail
                  </h3>
                  {getStatusBadge(application.status)}
               </div>
               
               <div className="p-6">
                 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
                   <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400">
                      <User size={24} />
                   </div>
                   <div>
                      <h2 className="text-lg font-black text-slate-800">{application.applicantInfo?.name}</h2>
                      <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{application.applicationNumber}</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Disaster Type</p>
                     <p className="text-xs font-bold text-slate-700">{application.disasterType?.name}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Incident Date</p>
                     <p className="text-xs font-bold text-slate-700">{format(new Date(application.incidentDate), "dd MMM yyyy")}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Jurisdiction</p>
                     <p className="text-xs font-bold text-slate-700">{application.location?.block?.name}, {application.location?.district?.name}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</p>
                     <p className="text-xs font-bold text-slate-700">{format(new Date(application.createdAt), "dd MMM yyyy")}</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Workflow Progress */}
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <History size={14} className="text-brand-600" />
                    Latest Official Activity
                  </h3>
               </div>
               
               <div className="divide-y divide-slate-100">
                 {application.auditLogs?.slice(0, 5).map((log, idx) => (
                   <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0">
                               <Clock size={14} />
                            </div>
                            <div>
                               <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">{log.action.replace(/_/g, " ")}</h4>
                               <p className="text-[11px] text-slate-500 mt-0.5">{log.remarks || "No additional notes recorded"}</p>
                               <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                                  <span>Role: {log.performedByRole || "SYSTEM"}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right shrink-0">
                            <div className="text-[10px] font-bold text-slate-700">{format(new Date(log.timestamp), "HH:mm")}</div>
                            <div className="text-[9px] font-medium text-slate-400 uppercase">{format(new Date(log.timestamp), "dd MMM yy")}</div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Actions Card (Important if documents pending) */}
            {application.status === "DOCUMENTS_PENDING" && (
              <div className="bg-red-50 border border-red-200 rounded p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-600 flex-shrink-0">
                     <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-red-900 uppercase tracking-tight mb-1">Documentation Action Required</h3>
                    <p className="text-red-700 text-xs font-medium mb-4">Official review indicates missing documentation. Please rectify immediately.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                       {application.requiredDocuments?.filter(d => !application.uploadedDocuments?.some(u => u.name === d.name)).map((doc, idx) => (
                         <div key={idx} className="bg-white/80 p-3 border border-red-100 rounded text-xs font-bold text-red-900 flex items-center gap-2">
                           <FileText className="text-red-600" size={14} />
                           {doc.name}
                         </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => navigate(`/upload/${application.applicationNumber}`)}
                      className="gov-btn bg-red-600 text-white shadow-sm flex items-center gap-2 hover:bg-red-700"
                    >
                      <Upload size={16} /> Update Documentation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {status === "not_found" && (
          <div className="bg-white rounded border border-slate-200 p-10 text-center shadow-sm">
             <div className="w-16 h-16 bg-amber-50 rounded flex items-center justify-center mx-auto mb-6 text-amber-600 border border-amber-200">
               <SearchX size={32} />
             </div>
             <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2">Record Not Located</h2>
             <p className="text-slate-500 text-xs font-medium mb-6 italic">ID <span className="font-mono font-bold text-brand-600">{appNumber}</span> does not match any current records.</p>
             <button 
               onClick={() => setStatus("idle")}
               className="gov-btn border border-slate-300 text-slate-600 hover:bg-slate-50"
             >
               Try New Inquiry
             </button>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white rounded border border-red-200 p-10 text-center text-red-600 shadow-sm">
             <AlertCircle size={32} className="mx-auto mb-3" />
             <p className="font-bold text-xs uppercase tracking-widest">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
