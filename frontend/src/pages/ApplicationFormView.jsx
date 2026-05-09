import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText, User, Phone, Activity, Calendar, MapPin,
  CheckCircle, ArrowLeft, Loader2, AlertCircle, Shield,
  Heart, IndianRupee, ChevronRight, Download, ExternalLink,
  Users, History, Fingerprint, Briefcase, Clock
} from "lucide-react";
import { applicationApi } from "../services/api.service";
import useAuthStore from "../store/authStore";
import { format } from "date-fns";
import GovHeader from "../components/GovHeader";

const OfficialSection = ({ title, hindiTitle, icon: Icon, children }) => (
  <div className="mb-8 border border-slate-200 rounded-sm overflow-hidden shadow-sm">
    <div className="bg-[#003366] text-white px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-amber-400" />
        <h3 className="text-sm font-bold tracking-wide uppercase">{title}</h3>
      </div>
      <span className="text-xs font-medium opacity-80">{hindiTitle}</span>
    </div>
    <div className="p-6 bg-white">
      {children}
    </div>
  </div>
);

const DataField = ({ label, hindiLabel, value, icon: Icon }) => (
  <div className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-medium text-slate-300">({hindiLabel})</span>
      </div>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-300 shrink-0" />}
        <span className="text-sm font-bold text-slate-800 leading-tight">
          {value || <span className="text-slate-300 italic font-normal">Not Provided</span>}
        </span>
      </div>
    </div>
  </div>
);

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  return `${baseUrl}${url}`;
};

const ApplicationFormView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getDetails(id);
      if (res.data.success) {
        setApp(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load application.");
    } finally {
      setLoading(false);
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
        <h2 className="text-xl font-black text-slate-800 mb-4">{error || "Application not found"}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#003366] text-white rounded flex items-center gap-2 mx-auto font-bold shadow-lg">
          <ArrowLeft size={16} /> Back to Records
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <GovHeader />
      
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Official Document Header */}
          <div className="bg-white border-b-2 border-slate-200 p-8 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded border border-slate-200">OFFICIAL RECORD</span>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Generated: {format(new Date(app.createdAt), "dd MMM yyyy · HH:mm:ss")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button onClick={() => window.print()} className="h-10 px-5 bg-white border-2 border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <Download size={14} /> Print Document
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => navigate(`/application/${app._id}`)} className="h-10 px-5 bg-[#003366] text-white font-bold text-xs uppercase tracking-widest rounded shadow-md hover:bg-[#002244] transition-all flex items-center gap-2">
                  <Shield size={14} /> Admin Review
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Application Body */}
            <div className="lg:col-span-12 space-y-0">
              
              <OfficialSection title="Submission Metadata" hindiTitle="प्रस्तुति मेटाडेटा" icon={Briefcase}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <DataField label="Channel Source" hindiLabel="स्रोत" value={app.source?.toUpperCase()} icon={ExternalLink} />
                  <DataField label="Submission ID" hindiLabel="आईडी" value={app._id} icon={Fingerprint} />
                </div>
              </OfficialSection>

              <OfficialSection title="Applicant Profile" hindiTitle="आवेदक का विवरण" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <DataField label="Full Name" hindiLabel="पूरा नाम" value={app.applicantInfo?.name} />
                  <DataField label="Father/Husband" hindiLabel="पिता/पति" value={app.applicantInfo?.fatherName} />
                  <DataField label="Mobile Number" hindiLabel="मोबाइल" value={app.applicantInfo?.mobile} icon={Phone} />
                  <DataField label="Aadhar Number" hindiLabel="आधार" value={app.applicantInfo?.aadhar} icon={Fingerprint} />
                  <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-slate-50">
                    <DataField label="Residential Address" hindiLabel="पता" value={app.applicantInfo?.address} icon={MapPin} />
                  </div>
                </div>
              </OfficialSection>

              <OfficialSection title="Beneficiary Context" hindiTitle="लाभार्थी का विवरण" icon={Users}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <DataField label="Beneficiary Name" hindiLabel="लाभार्थी नाम" value={app.beneficiaryInfo?.name} />
                  <DataField label="Relationship" hindiLabel="संबंध" value={app.beneficiaryInfo?.relationWithApplicant} />
                  <DataField label="Identity Proof" hindiLabel="पहचान" value={app.beneficiaryInfo?.aadhar} />
                  <div className="flex items-center mt-4">
                    <span className={`text-[10px] font-black px-3 py-1 border rounded uppercase tracking-widest ${app.beneficiaryInfo?.isSameAsApplicant ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {app.beneficiaryInfo?.isSameAsApplicant ? "Self-Application (स्वयं)" : "Third-Party Beneficiary"}
                    </span>
                  </div>
                </div>
              </OfficialSection>

              <OfficialSection title="Incident Intelligence" hindiTitle="घटना का विवरण" icon={Activity}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <DataField label="Disaster Type" hindiLabel="आपदा प्रकार" value={app.disasterType?.nameHindi || app.disasterType?.name} />
                  <DataField label="Incident Date" hindiLabel="दिनांक" value={app.incidentDate ? format(new Date(app.incidentDate), "PPP") : "—"} icon={Calendar} />
                  <DataField label="Location (Block)" hindiLabel="ब्लॉक" value={app.applicantBlock?.name} icon={MapPin} />
                  <DataField label="Location (Village)" hindiLabel="ग्राम" value={app.applicantVillage?.name} icon={MapPin} />
                  <div className="col-span-1 md:col-span-2 mt-2 pt-4 border-t border-slate-50">
                    <DataField label="Factual Narrative" hindiLabel="विवरण" value={app.cause} icon={FileText} />
                  </div>
                </div>
              </OfficialSection>

              <OfficialSection title="Loss Metrics & Compensation" hindiTitle="क्षति और मुआवजा" icon={IndianRupee}>
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Loss Categories</span>
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
                      <DataField label="Relief Demanded" hindiLabel="मुआवजा मांग" value={`₹ ${app.compensationDemand?.toLocaleString()}`} icon={IndianRupee} />
                    </div>
                    
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Evidence Repository</span>
                      <div className="space-y-2">
                        {app.uploadedDocuments?.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={14} className="text-slate-400" />
                              <span className="font-bold text-slate-600 truncate">{doc.name}</span>
                            </div>
                            <a href={getMediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="text-[#003366] hover:underline font-bold uppercase text-[10px]">
                              View
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </OfficialSection>

              <OfficialSection title="Witness Statements" hindiTitle="गवाहों का विवरण" icon={History}>
                <div className="space-y-4">
                  {app.witnesses?.map((w, i) => (
                    <div key={i} className="p-5 bg-slate-50 border-l-4 border-[#003366] rounded-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                      <DataField label="Witness Name" hindiLabel="गवाह नाम" value={w.name} />
                      <DataField label="Contact" hindiLabel="मोबाइल" value={w.mobile} />
                    </div>
                  ))}
                </div>
              </OfficialSection>

            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-12 pt-8 border-t-4 border-[#003366] flex flex-col items-center text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-2">
              End of Official Document
            </p>
            <p className="text-[9px] font-bold text-slate-300 uppercase">
              Authenticated via Disaster Relief Intelligence Network · {app._id}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ApplicationFormView;
