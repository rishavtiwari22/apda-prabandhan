import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FileText, Calendar, MapPin, User, ChevronLeft,
  Loader2, AlertCircle, Phone, Heart, Activity,
  Download, CheckCircle, Clock, Shield, ArrowRight,
  ExternalLink, FileCheck, Info, Users, Briefcase, IndianRupee,
  Send, FilePlus, Share2, Plus, X, Forward,
  Upload, MessageSquare, RotateCcw, LayoutDashboard, Fingerprint, History,
  Search, Link as LinkIcon, Landmark, ChevronRight
} from "lucide-react";
import { applicationApi, authApi, masterApi, disasterEventApi } from "../services/api.service";
import useAuthStore from "../store/authStore";
import { format } from "date-fns";
import GovHeader from "../components/GovHeader";

const OfficialSection = ({ title, hindiTitle, icon: Icon, children, action }) => (
  <div className="mb-8 border border-slate-200 rounded-sm overflow-hidden shadow-sm">
    <div className="bg-[#003366] text-white px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-amber-400" />
        <h3 className="text-sm font-bold tracking-wide uppercase">{title}</h3>
      </div>
      <div className="flex items-center gap-4">
        {action}
        <span className="text-xs font-medium opacity-80">{hindiTitle}</span>
      </div>
    </div>
    <div className="p-6 bg-white">
      {children}
    </div>
  </div>
);

const DataField = ({ label, hindiLabel, value, icon: Icon, color = "text-slate-800" }) => (
  <div className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-medium text-slate-300">({hindiLabel})</span>
      </div>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-300 shrink-0" />}
        <span className={`text-sm font-bold leading-tight ${color}`}>
          {value || <span className="text-slate-300 italic font-normal">Not Provided</span>}
        </span>
      </div>
    </div>
  </div>
);

const AuditTrail = ({ logs }) => {
  if (!logs || logs.length === 0) return (
    <div className="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm">
      <Clock size={24} className="text-slate-300 mx-auto mb-3" />
      <p className="text-xs font-bold text-slate-400 uppercase">No activity recorded yet.</p>
    </div>
  );

  return (
    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
      {logs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, i) => (
        <div key={i} className="relative pl-12">
          <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
            log.action?.includes("RESOLVED") ? "bg-emerald-600 text-white" :
            log.action?.includes("REJECT") ? "bg-rose-600 text-white" :
            log.action?.includes("FORWARD") ? "bg-[#003366] text-white" :
            "bg-slate-200 text-slate-600"
          }`}>
            {log.action?.includes("RESOLVED") ? <CheckCircle size={14} /> :
             log.action?.includes("REJECT") ? <X size={14} /> :
             log.action?.includes("FORWARD") ? <Forward size={14} /> :
             <Clock size={14} />}
          </div>
          
          <div className="bg-white p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
                {log.action?.replace(/_/g, ' ')}
              </h4>
              <span className="text-[9px] font-bold text-slate-400">
                {format(new Date(log.timestamp), "dd MMM yyyy · HH:mm")}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-slate-600">
                Performed by: <span className="text-[#003366]">{log.performedBy?.name || "System"}</span> 
                <span className="text-slate-400 ml-2 px-1.5 py-0.5 bg-slate-50 border border-slate-100 uppercase text-[8px]">
                  {log.performedBy?.designation || log.performedByRole || "System"}
                </span>
              </span>
            </div>

            {log.remarks && (
              <div className="p-3 bg-slate-50 border-l-2 border-slate-200 text-xs font-medium text-slate-600 italic">
                "{log.remarks}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${url}`;
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [app, setApp] = useState(null);
  const [clusterStats, setClusterStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All available users for forwarding / sharing
  const [availableUsers, setAvailableUsers] = useState([]);

  // Modals state
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardData, setForwardData] = useState({ userId: "", remarks: "" });
  const [forwardLoading, setForwardLoading] = useState(false);

  const [showBackwardModal, setShowBackwardModal] = useState(false);
  const [backwardData, setBackwardData] = useState({ userId: "", remarks: "" });
  const [backwardLoading, setBackwardLoading] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveData, setResolveData] = useState({ resolutionNote: "", paymentAmount: "", paymentDate: "" });
  const [resolveLoading, setResolveLoading] = useState(false);

  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsRemarks, setDocsRemarks] = useState("");
  const [documentRequests, setDocumentRequests] = useState([{ name: "", isMandatory: true }]);
  const [docsLoading, setDocsLoading] = useState(false);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentSearch, setIncidentSearch] = useState({ date: "", block: "" });
  const [potentialIncidents, setPotentialIncidents] = useState([]);
  const [incidentLoading, setIncidentLoading] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  
  const [uploadData, setUploadData] = useState({ file: null, type: "" });
  const [remarkData, setRemarkData] = useState({ remarks: "" });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectDocId, setRejectDocId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [showAdminActionModal, setShowAdminActionModal] = useState(false);
  const [adminActionType, setAdminActionType] = useState(""); 
  const [adminRemarks, setAdminRemarks] = useState("");
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
    if (user?.role === "admin" || user?.role === "department") {
      fetchUsers();
    }
  }, [id]);

  const fetchDocTypes = async () => {
    try {
      if (app?.disasterType?._id || app?.disasterType) {
        const dres = await masterApi.getDocumentTypes(app?.disasterType?._id || app?.disasterType);
        setDocTypes(dres.data.data);
      }
    } catch (err) {
      console.error("Failed to load doc types", err);
    }
  };

  useEffect(() => {
    if (app?.disasterType) fetchDocTypes();
  }, [app?.disasterType]);

  useEffect(() => {
    if (actionSuccess || actionError) {
      const t = setTimeout(() => { setActionSuccess(""); setActionError(""); }, 5000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess, actionError]);

  const fetchUsers = async () => {
    try {
      const res = await authApi.getUsers();
      setAvailableUsers(res.data.data.filter(u => u._id !== user._id));
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getDetails(id);
      if (res.data.success) {
        setApp(res.data.data);
        setClusterStats(res.data.clusterStats);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isHandler = app?.currentHandler?._id === user?._id;
  const isSharedWith = (app?.sharedWith || []).some(u => (u._id || u) === user?._id);
  const canAct = isAdmin || isHandler || isSharedWith;
  const isAuthorizedForType = isAdmin || (user?.authorizedDisasterTypes || []).some(
    dt => (dt._id || dt).toString() === (app?.disasterType?._id || app?.disasterType)?.toString()
  );
  const canResolve = canAct && isAuthorizedForType;

  const handleForward = async (e) => {
    e.preventDefault();
    if (!forwardData.userId) return;
    try {
      setForwardLoading(true);
      await applicationApi.forward(id, { forwardToId: forwardData.userId, remarks: forwardData.remarks });
      setShowForwardModal(false);
      setForwardData({ userId: "", remarks: "" });
      setActionSuccess("Case forwarded successfully!");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Forwarding failed");
    } finally {
      setForwardLoading(false);
    }
  };

  const handleBackward = async (e) => {
    e.preventDefault();
    if (!backwardData.userId) return;
    try {
      setBackwardLoading(true);
      await applicationApi.backward(id, { backwardToId: backwardData.userId, remarks: backwardData.remarks });
      setShowBackwardModal(false);
      setBackwardData({ userId: "", remarks: "" });
      setActionSuccess("Case returned for correction successfully!");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Return action failed");
    } finally {
      setBackwardLoading(false);
    }
  };

  const fetchPotentialIncidents = async () => {
    try {
      setIncidentLoading(true);
      const res = await disasterEventApi.getAll({
        disasterType: app.disasterType?._id || app.disasterType,
        status: "ACTIVE",
        district: app.location?.district?._id || app.location?.district,
        block: incidentSearch.block || app.location?.block?._id || app.location?.block,
        incidentDate: incidentSearch.date || app.incidentDate
      });
      setPotentialIncidents(res.data.data || []);
    } catch (err) {
      setActionError("Failed to fetch potential incidents");
    } finally {
      setIncidentLoading(false);
    }
  };

  const handleRelink = async (eventId) => {
    if (!window.confirm("Are you sure you want to move this application to another incident cluster?")) return;
    try {
      await applicationApi.update(id, { disasterEventId: eventId });
      setActionSuccess("Application successfully re-linked to new incident!");
      setShowIncidentModal(false);
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Re-linking failed");
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      setResolveLoading(true);
      await applicationApi.resolve(id, {
        resolutionNote: resolveData.resolutionNote,
        paymentAmount: Number(resolveData.paymentAmount),
        paymentDate: resolveData.paymentDate,
      });
      setShowResolveModal(false);
      setResolveData({ resolutionNote: "", paymentAmount: "", paymentDate: "" });
      setActionSuccess("Case resolved and compensation approved!");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Resolution failed");
    } finally {
      setResolveLoading(false);
    }
  };

  const handleRequestDocs = async (e) => {
    e.preventDefault();
    try {
      setDocsLoading(true);
      await applicationApi.requestDocuments(id, {
        documentTypes: documentRequests.filter(d => d.name.trim()),
        remarks: docsRemarks,
      });
      setShowDocsModal(false);
      setDocumentRequests([{ name: "", isMandatory: true }]);
      setDocsRemarks("");
      setActionSuccess("Document request sent to applicant!");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Document request failed");
    } finally {
      setDocsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.type) return;
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("type", uploadData.type);
      await applicationApi.uploadDocument(id, formData);
      setShowUploadModal(false);
      setUploadData({ file: null, type: "" });
      setActionSuccess("Document uploaded successfully!");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleVerify = async (docMappingId) => {
    try {
      await applicationApi.verifyDocument(id, docMappingId);
      setActionSuccess("Document verified successfully!");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleRejectDocument = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    try {
      setRejectLoading(true);
      await applicationApi.rejectDocument(id, rejectDocId, { rejectionReason });
      setShowRejectModal(false);
      setRejectionReason("");
      setActionSuccess("Document rejected and applicant notified.");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleAdminAction = async (e) => {
    e.preventDefault();
    try {
      setAdminActionLoading(true);
      await applicationApi.adminAction(id, {
        action: adminActionType === "OVERRIDE" ? "ADMIN_OVERRIDE" : "RETURN_TO_USER",
        remarks: adminRemarks,
        documentMappingId: adminActionType === "OVERRIDE" ? rejectDocId : null
      });
      setShowAdminActionModal(false);
      setAdminRemarks("");
      setActionSuccess(`Action ${adminActionType} performed successfully.`);
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed");
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remarkData.remarks.trim()) return;
    try {
      setRemarkLoading(true);
      await applicationApi.addRemark(id, { remarks: remarkData.remarks });
      setRemarkData({ remarks: "" });
      setShowRemarkModal(false);
      setActionSuccess("Remark added successfully.");
      fetchDetail();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to add remark.");
    } finally {
      setRemarkLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-[#003366]" size={40} />
    </div>
  );

  if (error || !app) return (
    <div className="min-h-screen p-10 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">{error || "Application not found"}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#003366] text-white rounded flex items-center gap-2 mx-auto font-bold shadow-lg">
          <ChevronLeft size={16} /> Back to Records
        </button>
      </div>
    </div>
  );

  const isResolved = app.status === "resolved";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <GovHeader />
      
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb & Summary Header */}
          <div className="bg-white border-b-2 border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm mb-8">
            <div className="space-y-2">
              <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                <button onClick={() => navigate("/dashboard")} className="hover:text-[#003366]">Dashboard</button>
                <ChevronRight size={10} />
                <button onClick={() => navigate("/applications")} className="hover:text-[#003366]">Applications</button>
                <ChevronRight size={10} />
                <span className="text-[#003366]">{app.applicationNumber}</span>
              </nav>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded border border-slate-200 uppercase tracking-widest">Administrative Review</span>
                <span className={`px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-wider ${
                  app.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-brand-50 text-brand-600 border-brand-100'
                }`}>
                  {app.status}
                </span>
              </div>
              <h1 className="text-3xl font-black text-[#003366] tracking-tighter uppercase">
                {app.applicationNumber}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Submitted: {format(new Date(app.createdAt), "dd MMM yyyy · HH:mm")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate(`/application-view/${app._id}`)} className="h-10 px-5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <FileText size={14} /> Full Record
              </button>
              <button onClick={() => window.print()} className="h-10 px-5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <Download size={14} /> Print
              </button>
            </div>
          </div>

          {(actionSuccess || actionError) && (
            <div className={`mb-8 p-4 rounded border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${actionSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
              {actionSuccess ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <p className="text-xs font-black uppercase tracking-tight">{actionSuccess || actionError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-0">
              
              {/* Decision Console */}
              {canAct && !isResolved && (
                <div className="mb-8 border-2 border-[#003366]/10 bg-white p-6 rounded-sm shadow-sm flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 mr-4">
                    <Shield size={16} className="text-[#003366]" />
                    <span className="text-[10px] font-black text-[#003366] uppercase tracking-[0.2em]">Decision Console</span>
                  </div>
                  
                  {user?.role === "admin" && (
                    <button onClick={() => setShowForwardModal(true)} className="h-9 px-4 bg-[#003366] text-white text-[10px] font-black uppercase tracking-widest rounded shadow hover:bg-[#002244] flex items-center gap-2">
                      <Forward size={14} /> Forward
                    </button>
                  )}
                  
                  {canResolve && (
                    <button onClick={() => setShowResolveModal(true)} className="h-9 px-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow hover:bg-emerald-700 flex items-center gap-2">
                      <CheckCircle size={14} /> Resolve Case
                    </button>
                  )}

                  <button onClick={() => setShowDocsModal(true)} className="h-9 px-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded shadow hover:bg-amber-600 flex items-center gap-2">
                    <FilePlus size={14} /> Request Docs
                  </button>

                  <button onClick={() => setShowRemarkModal(true)} className="h-9 px-4 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded border border-slate-200 hover:bg-slate-200 flex items-center gap-2">
                    <MessageSquare size={14} /> Internal Remark
                  </button>

                  {isAdmin && (
                    <button onClick={() => setShowIncidentModal(true)} className="h-9 px-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded shadow hover:bg-indigo-600 flex items-center gap-2">
                      <LinkIcon size={14} /> Change Case
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <OfficialSection title="Applicant Identity" hindiTitle="आवेदक की पहचान" icon={User}>
                  <div className="space-y-4">
                    <DataField label="Full Name" hindiLabel="पूरा नाम" value={app.applicantInfo?.name} />
                    <DataField label="Father/Husband" hindiLabel="पिता/पति" value={app.applicantInfo?.fatherName} />
                    <DataField label="Mobile Number" hindiLabel="मोबाइल" value={app.applicantInfo?.mobile} icon={Phone} />
                    <DataField label="Aadhar (UID)" hindiLabel="आधार" value={app.applicantInfo?.aadhar} icon={Fingerprint} />
                  </div>
                </OfficialSection>

                <OfficialSection title="Incident Scope" hindiTitle="घटना का क्षेत्र" icon={Activity}>
                  <div className="space-y-4">
                    <DataField label="Disaster Type" hindiLabel="आपदा प्रकार" value={app.disasterType?.nameHindi || app.disasterType?.name} icon={Shield} color="text-[#003366]" />
                    <DataField label="Incident Date" hindiLabel="दिनांक" value={app.incidentDate ? format(new Date(app.incidentDate), "dd MMM yyyy") : "—"} icon={Calendar} />
                    <DataField label="Location" hindiLabel="स्थान" value={`${app.applicantVillage?.name}, ${app.applicantBlock?.name}`} icon={MapPin} />
                    <DataField label="District" hindiLabel="जिला" value={app.location?.district?.name || app.district?.name} icon={Landmark} />
                  </div>
                </OfficialSection>
              </div>

              <OfficialSection title="Damage & Financials" hindiTitle="क्षति और वित्त" icon={IndianRupee}>
                <div className="space-y-8">
                  {/* Detailed Breakdown if available */}
                  {app.lossDetails && Object.keys(app.lossDetails).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 border-b border-slate-100 pb-8">
                       {Object.entries(app.lossDetails).map(([metricKey, details]) => (
                         <div key={metricKey} className="p-4 bg-slate-50 border border-slate-200 rounded-sm">
                           <h5 className="text-[10px] font-black text-[#003366] uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                             {metricKey.replace(/_LOSS/g, '').replace(/_/g, ' ')} Details
                           </h5>
                           <div className="space-y-2">
                             {Object.entries(details).map(([fieldName, fieldValue]) => (
                               <div key={fieldName} className="flex justify-between items-center text-xs gap-4">
                                 <span className="text-slate-400 font-bold uppercase tracking-tight text-[9px] truncate">{fieldName.replace(/([A-Z])/g, ' $1').trim()}</span>
                                 <span className="text-slate-800 font-black uppercase whitespace-nowrap">
                                   {fieldValue === "true" || fieldValue === true ? "Yes (हाँ)" : fieldValue === "false" || fieldValue === false ? "No (नहीं)" : fieldValue}
                                 </span>
                               </div>
                             ))}
                           </div>
                         </div>
                       ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Loss Categories</span>
                      <div className="flex flex-wrap gap-2">
                        {app.lossTypes?.length === 0 ? (
                          <span className="text-xs text-slate-300 italic">No categories recorded</span>
                        ) : (
                          app.lossTypes?.map(lt => (
                            <span key={lt} className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200 uppercase tracking-tight">
                              {lt}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <DataField label="Relief Expected" hindiLabel="मुआवजा मांग" value={`₹ ${app.compensationDemand?.toLocaleString()}`} icon={IndianRupee} color="text-emerald-700" />
                  </div>
                  
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Verification Documents</span>
                    <div className="space-y-2">
                      {app.uploadedDocuments?.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded text-xs group">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={14} className="text-slate-400" />
                            <span className="font-bold text-slate-600 truncate">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <a href={getMediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="text-[#003366] hover:underline font-bold uppercase text-[9px]">
                              View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </OfficialSection>

              <OfficialSection title="Official Activity Log" hindiTitle="आधिकारिक गतिविधि लॉग" icon={History}>
                <div className="pt-2">
                  <AuditTrail logs={app.auditLogs} />
                </div>
              </OfficialSection>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                  <Clock size={16} className="text-[#003366]" />
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Processing Workflow</h4>
                </div>
                
                <div className="space-y-8">
                  <div className="relative pl-8 before:absolute before:left-3 before:top-6 before:bottom-[-20px] before:w-0.5 before:bg-slate-100 last:before:hidden">
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${app.status === 'resolved' ? 'bg-emerald-500' : 'bg-[#003366]'}`}>
                       {app.status === 'resolved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    </div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Filing Status</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Submitted Successfully</p>
                  </div>

                  <div className="relative pl-8">
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${app.currentHandler ? 'bg-[#003366] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                       <User size={12} />
                    </div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Current Custodian</p>
                    <p className="text-[10px] text-[#003366] font-black mt-0.5">{app.currentHandler?.name || "Unassigned"}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter mt-1">{app.currentHandler?.designation || "Department Official"}</p>
                  </div>
                </div>
              </div>

              <OfficialSection title="Certified Files" hindiTitle="प्रमाणित फाइलें" icon={Upload} action={
                <button onClick={() => setShowUploadModal(true)} className="p-1 bg-white/20 hover:bg-white/30 rounded text-white transition-colors">
                  <Plus size={16} />
                </button>
              }>
                <div className="space-y-3">
                  {app.documents?.length === 0 && (
                    <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded text-[10px] font-bold text-slate-400 uppercase">
                      No certified files attached
                    </div>
                  )}
                  {app.documents?.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-sm group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-[#003366] shadow-sm">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-900 uppercase truncate">{doc.type}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Digital Copy</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={getMediaUrl(doc.url)} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-[#003366] transition-colors"><ExternalLink size={14} /></a>
                        <button onClick={() => { setRejectDocId(doc._id); setShowRejectModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowUploadModal(true)} className="w-full mt-2 py-3 border-2 border-dashed border-slate-200 rounded-sm text-[10px] font-black text-slate-400 uppercase hover:border-[#003366] hover:text-[#003366] transition-all flex items-center justify-center gap-2">
                    <Upload size={14} /> Add Official Document
                  </button>
                </div>
              </OfficialSection>

              <div className="bg-[#003366] p-6 text-white rounded-sm shadow-lg">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4">Authority Protocol</h4>
                <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">
                  This interface is restricted to authorized personnel of the Disaster Management Department. All actions are cryptographically logged and auditable.
                </p>
                <div className="mt-8 pt-8 border-t border-white/10 flex justify-center">
                   <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                      <Shield size={24} className="opacity-20" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - Formal Re-styling */}
      {showForwardModal && (
        <ModalWrapper onClose={() => setShowForwardModal(false)} title="Case Forwarding" subtitle="Institutional Handover">
          <form onSubmit={handleForward} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Receiving Official</label>
              <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm font-bold text-slate-900 focus:border-[#003366] outline-none transition-all"
                value={forwardData.userId} onChange={(e) => setForwardData({ ...forwardData, userId: e.target.value })}>
                <option value="">Select Official...</option>
                {availableUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.designation || u.role})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Justification</label>
              <textarea required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium text-slate-900 focus:border-[#003366] outline-none transition-all min-h-[120px]"
                value={forwardData.remarks} onChange={(e) => setForwardData({ ...forwardData, remarks: e.target.value })} placeholder="State the reason for this transfer..." />
            </div>
            <SubmitBtn loading={forwardLoading} label="Confirm Forwarding" color="#003366" />
          </form>
        </ModalWrapper>
      )}

      {showResolveModal && (
        <ModalWrapper onClose={() => setShowResolveModal(false)} title="Final Resolution" subtitle="Compensation Settlement">
          <form onSubmit={handleResolve} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Resolution Summary</label>
              <textarea required className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm font-medium text-slate-900 focus:border-emerald-500 outline-none transition-all min-h-[100px]"
                value={resolveData.resolutionNote} onChange={(e) => setResolveData({ ...resolveData, resolutionNote: e.target.value })} placeholder="Final assessment notes..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Approved Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">₹</span>
                  <input type="number" required className="w-full pl-8 pr-4 py-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm font-black text-slate-900 focus:border-emerald-500 outline-none"
                    value={resolveData.paymentAmount} onChange={(e) => setResolveData({ ...resolveData, paymentAmount: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Disbursement Date</label>
                <input type="date" required className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm font-black text-slate-900 focus:border-emerald-500 outline-none"
                  value={resolveData.paymentDate} onChange={(e) => setResolveData({ ...resolveData, paymentDate: e.target.value })} />
              </div>
            </div>
            <SubmitBtn loading={resolveLoading} label="Approve & Resolve" color="#059669" />
          </form>
        </ModalWrapper>
      )}

      {showDocsModal && (
        <ModalWrapper onClose={() => setShowDocsModal(false)} title="Evidence Request" subtitle="Document Deficiency Notice">
          <form onSubmit={handleRequestDocs} className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Mandatory Requirements</label>
              {documentRequests.map((req, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={req.name} onChange={(e) => {
                    const newReqs = [...documentRequests];
                    newReqs[i].name = e.target.value;
                    setDocumentRequests(newReqs);
                  }} className="flex-1 px-4 py-2 bg-amber-50 border border-amber-100 rounded-sm text-xs font-bold outline-none" placeholder="e.g. Police Report, Medical Cert" />
                </div>
              ))}
              <button type="button" onClick={() => setDocumentRequests([...documentRequests, { name: "", isMandatory: true }])} className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1 hover:underline">
                <Plus size={12}/> Add Requirement
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Official Notice Text</label>
              <textarea required value={docsRemarks} onChange={(e) => setDocsRemarks(e.target.value)} className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-sm text-sm font-medium text-slate-900 focus:border-amber-500 outline-none min-h-[100px]" placeholder="Explain the deficiency..." />
            </div>
            <SubmitBtn loading={docsLoading} label="Issue Notice" color="#d97706" />
          </form>
        </ModalWrapper>
      )}

      {showUploadModal && (
        <ModalWrapper onClose={() => setShowUploadModal(false)} title="Digital Archival" subtitle="Certified Upload">
          <form onSubmit={handleUpload} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-10 border-2 border-dashed border-slate-200 bg-slate-50 rounded-sm text-center hover:border-[#003366] transition-all cursor-pointer relative">
                <input type="file" required onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <Upload size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{uploadData.file ? uploadData.file.name : "Select Document Path"}</p>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</label>
                 <select required value={uploadData.type} onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm text-sm font-black text-slate-900 outline-none focus:border-[#003366]">
                    <option value="">Select Category...</option>
                    {docTypes.map(dt => <option key={dt._id} value={dt._id}>{dt.name}</option>)}
                 </select>
              </div>
            </div>
            <SubmitBtn loading={uploadLoading} label="Certify & Upload" color="#003366" />
          </form>
        </ModalWrapper>
      )}

      {showRemarkModal && (
        <ModalWrapper onClose={() => setShowRemarkModal(false)} title="Internal Notation" subtitle="Restricted Record">
           <div className="p-8 space-y-6">
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm font-medium text-slate-900 min-h-[140px] focus:border-[#003366] outline-none"
                placeholder="Type internal remarks..."
                value={remarkData.remarks}
                onChange={(e) => setRemarkData({ ...remarkData, remarks: e.target.value })}
              />
              <SubmitBtn loading={remarkLoading} label="Save Notation" color="#003366" onClick={handleAddRemark} />
           </div>
        </ModalWrapper>
      )}

      {showRejectModal && (
        <ModalWrapper onClose={() => setShowRejectModal(false)} title="Invalidation Notice" subtitle="Evidence Rejection">
          <form onSubmit={handleRejectDocument} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Grounds for Rejection</label>
              <textarea required value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full px-4 py-3 bg-rose-50 border border-rose-100 rounded-sm text-sm font-medium text-slate-900 focus:border-rose-500 outline-none min-h-[140px]" placeholder="Describe the discrepancy..." />
            </div>
            <SubmitBtn loading={rejectLoading} label="Reject Document" color="#e11d48" />
          </form>
        </ModalWrapper>
      )}

      {showIncidentModal && (
        <ModalWrapper 
          onClose={() => setShowIncidentModal(false)} 
          title="Manual Incident Relinking" 
          subtitle="Administrative Override"
        >
          <div className="p-8 space-y-6">
             <div className="flex gap-4">
                <div className="flex-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference Date</label>
                   <input 
                      type="date" 
                      value={incidentSearch.date} 
                      onChange={(e) => setIncidentSearch(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold outline-none"
                   />
                </div>
                <div className="flex items-end">
                   <button 
                      onClick={fetchPotentialIncidents}
                      className="h-10 px-6 bg-[#003366] text-white rounded-sm font-black text-[10px] uppercase tracking-widest"
                   >
                      Search
                   </button>
                </div>
             </div>

             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {incidentLoading ? (
                   <div className="py-20 text-center"><Activity className="animate-spin mx-auto text-[#003366] mb-2" /> <p className="text-[10px] font-black text-slate-400 uppercase">Synchronizing...</p></div>
                ) : potentialIncidents.length === 0 ? (
                   <div className="py-12 text-center bg-slate-50 rounded border-2 border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase">No active cases found</p>
                   </div>
                ) : (
                   potentialIncidents.map(event => (
                      <div key={event._id} className="p-4 border border-slate-200 rounded-sm hover:border-[#003366] transition-all bg-white">
                         <div className="flex justify-between items-start mb-2">
                            <div>
                               <span className="text-[9px] font-black text-[#003366] uppercase tracking-[0.2em]">{event.eventNumber}</span>
                               <h4 className="font-bold text-slate-900 text-xs">{event.location?.panchayat?.name || "Global Event"}</h4>
                            </div>
                            <button 
                               onClick={() => handleRelink(event._id)}
                               className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded shadow hover:bg-emerald-600 transition-all"
                            >
                               Link
                            </button>
                         </div>
                         <p className="text-[10px] text-slate-500 font-medium mb-3 line-clamp-1">{event.description}</p>
                         <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase">
                            <span className="flex items-center gap-1"><Calendar size={10}/> {format(new Date(event.incidentDate), "dd MMM yyyy")}</span>
                            <span className="flex items-center gap-1"><MapPin size={10}/> {event.location?.village}</span>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

const ModalWrapper = ({ onClose, title, subtitle, children }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-sm w-full max-w-lg shadow-2xl overflow-hidden border-t-4 border-[#003366] max-h-[95vh] flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">{title}</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded bg-white text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center border border-slate-200">
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  </div>
);

const SubmitBtn = ({ loading, label, color, onClick }) => (
  <button onClick={onClick} type={onClick ? "button" : "submit"} disabled={loading}
    className="w-full text-white py-4 rounded-sm font-black shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em]"
    style={{ backgroundColor: color.startsWith("slate") ? "#0f172a" : color.startsWith("#") ? color : "#003366" }}
  >
    {loading ? <Loader2 className="animate-spin" size={16} /> : label}
  </button>
);

export default ApplicationDetail;
