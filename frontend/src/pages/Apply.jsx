import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, User, Phone, Activity, Calendar, MapPin,
  CheckCircle, ArrowLeft, Loader2, AlertCircle, Shield,
  Heart, IndianRupee, ChevronRight, Save, Edit3, X,
  Clock, Fingerprint, Briefcase, FileCheck, ExternalLink,
  Users, History, Send, Plus, Trash2, Upload,
  Landmark, Building, Layers, Home, Download
} from "lucide-react";
import { applicationApi, masterApi, disasterEventApi } from "../services/api.service";
import useAuthStore from "../store/authStore";
import { format } from "date-fns";
import GovHeader from "../components/GovHeader";

// ── Shared Config ──
const FORM_CONFIG = {
  sources: [
    { value: "individual", label: "Individual — Citizen", hindi: "व्यक्तिगत — नागरिक" },
    { value: "thana",      label: "Thana — Police Station", hindi: "थाना — पुलिस स्टेशन" },
    { value: "patwari",    label: "Patwari — Revenue Officer", hindi: "पटवारी — राजस्व अधिकारी" },
  ],
  lossTypes: [
    { value: "पशु",   label: "पशु (Livestock)" },
    { value: "मकान",   label: "मकान (House)" },
    { value: "जनहानि", label: "जनहानि (Human Loss)" },
    { value: "सामान",  label: "सामान (Belongings)" },
  ]
};

// ── Internal Components (Formal Government Style) ──
const FormSection = ({ title, hindiTitle, icon: Icon, children }) => (
  <div className="mb-10 border border-slate-200 rounded-sm overflow-hidden shadow-sm">
    <div className="bg-[#003366] text-white px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-amber-400" />
        <h3 className="text-sm font-black tracking-widest uppercase">{title}</h3>
      </div>
      <span className="text-xs font-bold opacity-80">{hindiTitle}</span>
    </div>
    <div className="p-8 bg-white">
      {children}
    </div>
  </div>
);

const FormField = ({ name, label, hindiLabel, icon: Icon, placeholder, value, onChange, type = "text", required, disabled, isPreview }) => (
  <div className="space-y-1.5">
    <label className="flex flex-col mb-1.5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
        {label} {required && <span className="text-gov-red">*</span>}
      </span>
      <span className="text-[10px] font-bold text-slate-300 leading-none">({hindiLabel})</span>
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isPreview ? 'text-slate-300' : 'text-slate-400'} pointer-events-none`} />}
      {isPreview ? (
        <div className={`w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-sm px-3 py-2.5 ${Icon ? 'pl-9' : ''}`}>
          {value || "—"}
        </div>
      ) : (
        <input 
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-sm px-3 py-2.5 ${Icon ? 'pl-9' : ''} focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all placeholder:text-slate-300 placeholder:font-medium`}
        />
      )}
    </div>
  </div>
);

const FormSelect = ({ name, label, hindiLabel, icon: Icon, value, onChange, children, required, disabled, isPreview, displayValue }) => (
  <div className="space-y-1.5">
    <label className="flex flex-col mb-1.5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
        {label} {required && <span className="text-gov-red">*</span>}
      </span>
      <span className="text-[10px] font-bold text-slate-300 leading-none">({hindiLabel})</span>
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isPreview ? 'text-slate-300' : 'text-slate-400'} pointer-events-none`} />}
      {isPreview ? (
        <div className={`w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-sm px-3 py-2.5 ${Icon ? 'pl-9' : ''}`}>
          {displayValue || value || "—"}
        </div>
      ) : (
        <>
          <select 
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-sm px-3 py-2.5 ${Icon ? 'pl-9' : ''} focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all appearance-none`}
          >
            {children}
          </select>
          <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
        </>
      )}
    </div>
  </div>
);

const FormTextArea = ({ name, label, hindiLabel, icon: Icon, placeholder, value, onChange, rows = 3, isPreview }) => (
  <div className="space-y-1.5">
    <label className="flex flex-col mb-1.5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
        {label}
      </span>
      <span className="text-[10px] font-bold text-slate-300 leading-none">({hindiLabel})</span>
    </label>
    <div className="relative">
      {Icon && <Icon size={14} className={`absolute left-3 top-4 ${isPreview ? 'text-slate-300' : 'text-slate-400'} pointer-events-none`} />}
      {isPreview ? (
        <div className={`w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-sm px-3 py-2.5 ${Icon ? 'pl-9' : ''} min-h-[80px] whitespace-pre-wrap`}>
          {value || "—"}
        </div>
      ) : (
        <textarea 
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 rounded-sm px-3 py-2.5 ${Icon ? 'pl-9' : ''} focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all placeholder:text-slate-300 placeholder:font-medium`}
        />
      )}
    </div>
  </div>
);

const Apply = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const isDept = isAuthenticated && user?.role !== "PUBLIC";

  const [isPreview, setIsPreview] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [appNumber, setAppNumber] = useState("");
  
  const [form, setForm] = useState({
    source: "individual",
    applicantName: "", applicantFatherName: "", applicantAadhar: "", applicantMobile: "", applicantAddress: "",
    applicantVidhanSabha: "",
    applicantTehsil: "",
    applicantBlock: "",
    applicantGP: "",
    applicantVillage: "",
    incidentDate: format(new Date(), "yyyy-MM-dd"),
    incidentHalfDay: "FIRST_HALF",
    applicationDate: new Date().toISOString().split("T")[0],
    beneficiaryType: "self",
    beneficiaryName: "", beneficiaryMobile: "", beneficiaryAddress: "", beneficiaryRelation: "", beneficiaryAadhar: "",
    subject: "", disasterType: "", cause: "",
    lossTypes: [],
    compensationDemand: "",
    witnesses: [{ name: "", mobile: "", address: "" }],
    lossDetails: {},
    disasterEventId: "",
  });

  const [masters, setMasters] = useState({
    disasterTypes: [], districts: [], blocks: [], tehsils: [], panchayats: [], villages: [], activeIncidents: [], lossMetrics: [],
  });
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});

  // ── Master Data Lifecycles ──
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [disastersRes, districtsRes, lossMetricsRes] = await Promise.all([
          masterApi.getDisasterTypes(),
          masterApi.getDistricts(),
          masterApi.getLossMetrics()
        ]);

        const disasterData = disastersRes.data.data || disastersRes.data || [];
        const districtData = districtsRes.data.data || districtsRes.data || [];

        setMasters(p => ({
          ...p,
          disasterTypes: Array.isArray(disasterData) ? disasterData : [],
          districts: Array.isArray(districtData) ? districtData : [],
          lossMetrics: lossMetricsRes.data.data || []
        }));
      } catch (err) {
        console.error("Master Fetch Error:", err);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    if (!form.district) { setMasters(p => ({ ...p, blocks: [], tehsils: [], panchayats: [], villages: [] })); return; }
    Promise.all([
      masterApi.getBlocks(form.district),
      masterApi.getTehsils(form.district)
    ]).then(([blocksRes, tehsilsRes]) => {
      setMasters(p => ({ 
        ...p, 
        blocks: blocksRes.data.data || blocksRes.data,
        tehsils: tehsilsRes.data.data || tehsilsRes.data,
        panchayats: [],
        villages: []
      }));
    }).catch(() => setMasters(p => ({ ...p, blocks: [], tehsils: [], panchayats: [], villages: [] })));
  }, [form.district]);

  useEffect(() => {
    if (!form.applicantBlock) { setMasters(p => ({ ...p, panchayats: [], villages: [] })); return; }
    masterApi.getPanchayats(form.applicantBlock)
      .then(r => setMasters(p => ({ ...p, panchayats: r.data.data || r.data, villages: [] })))
      .catch(() => setMasters(p => ({ ...p, panchayats: [], villages: [] })));
  }, [form.applicantBlock]);

  useEffect(() => {
    if (!form.applicantGP) { setMasters(p => ({ ...p, villages: [] })); return; }
    masterApi.getVillages(form.applicantGP)
      .then(r => setMasters(p => ({ ...p, villages: r.data.data || r.data })))
      .catch(() => setMasters(p => ({ ...p, villages: [] })));
  }, [form.applicantGP]);

  useEffect(() => {
    if (!form.disasterType) { setRequiredDocs([]); return; }
    masterApi.getDocumentTypes(form.disasterType)
      .then(r => {
        const docs = r.data.data || r.data;
        setRequiredDocs(docs.filter(d => d.isUserMandatory || d.allowUserOptional));
      })
      .catch(() => setRequiredDocs([]));
  }, [form.disasterType]);

  // ── Incident Discovery ──
  useEffect(() => {
    if (!form.district || !form.applicantBlock || !form.incidentDate || !form.disasterType) {
       setMasters(p => ({ ...p, activeIncidents: [] }));
       return;
    }
    disasterEventApi.getAll({
      district: form.district,
      block: form.applicantBlock,
      incidentDate: form.incidentDate,
      incidentHalfDay: form.incidentHalfDay,
      disasterType: form.disasterType,
      status: "ACTIVE"
    })
    .then(r => setMasters(p => ({ ...p, activeIncidents: r.data.data || [] })))
    .catch(() => setMasters(p => ({ ...p, activeIncidents: [] })));
  }, [form.district, form.applicantBlock, form.incidentDate, form.disasterType, form.incidentHalfDay]);

  // ── Form Actions ──
  const setField = (e) => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
  const toggleLoss = (v) => {
    setForm(p => {
      const isSelected = p.lossTypes.includes(v);
      const newLossTypes = isSelected 
        ? p.lossTypes.filter(x => x !== v) 
        : [...p.lossTypes, v];
      
      const newLossDetails = { ...p.lossDetails };
      if (isSelected) {
        delete newLossDetails[v];
      }
      
      return { ...p, lossTypes: newLossTypes, lossDetails: newLossDetails };
    });
  };

  const setLossDetail = (metricKey, field, value) => {
    setForm(p => ({
      ...p,
      lossDetails: {
        ...p.lossDetails,
        [metricKey]: {
          ...(p.lossDetails[metricKey] || {}),
          [field]: value
        }
      }
    }));
  };
  const setWitness = (i, field, val) => {
    const w = [...form.witnesses]; w[i] = { ...w[i], [field]: val };
    setForm(p => ({ ...p, witnesses: w }));
  };
  const addWitness = () => setForm(p => ({ ...p, witnesses: [...p.witnesses, { name: "", mobile: "", address: "" }] }));
  const removeWitness = (i) => setForm(p => ({ ...p, witnesses: p.witnesses.filter((_, idx) => idx !== i) }));
  
  const handleFileChange = (key, file) => {
    setUploadedFiles(p => ({ ...p, [key]: file }));
  };

  const handleSubmit = async () => {
    if (!form.applicantName || !form.applicantMobile || !form.district || !form.incidentDate || !form.disasterType || !form.subject) {
      setError("Please fill all mandatory fields (marked with *).");
      return;
    }
    setStatus("loading");
    setError("");

    const data = {
      source: form.source,
      applicantInfo: {
        name: form.applicantName, fatherName: form.applicantFatherName, aadhar: form.applicantAadhar,
        mobile: form.applicantMobile, address: form.applicantAddress,
        village: form.applicantVillage, gp: form.applicantGP, block: form.applicantBlock, tehsil: form.applicantTehsil, vidhanSabha: form.applicantVidhanSabha,
      },
      beneficiaryInfo: form.beneficiaryType === "self"
        ? { name: form.applicantName, mobile: form.applicantMobile, address: form.applicantAddress, aadhar: form.applicantAadhar, relationWithApplicant: "SELF", isSameAsApplicant: true }
        : { name: form.beneficiaryName, mobile: form.beneficiaryMobile, address: form.beneficiaryAddress, aadhar: form.beneficiaryAadhar, relationWithApplicant: form.beneficiaryRelation, isSameAsApplicant: false },
      subject: form.subject, disasterType: form.disasterType, cause: form.cause,
      lossTypes: form.lossTypes,
      compensationDemand: form.compensationDemand ? Number(form.compensationDemand) : undefined,
      witnesses: form.witnesses.filter(w => w.name),
      incidentDate: form.incidentDate,
      applicationDate: form.applicationDate,
      disasterEventId: form.disasterEventId,
      location: { district: form.district || undefined, block: form.applicantBlock || undefined, tehsil: form.applicantTehsil || undefined, panchayat: form.applicantGP || undefined, village: form.applicantVillage },
      uploadedDocuments: requiredDocs.map((rd, i) => ({
        documentType: rd._id,
        name: rd.nameHindi || rd.name,
        fileUrl: "" 
      })),
    };

    const formData = new FormData();
    formData.append("applicantInfo", JSON.stringify(data.applicantInfo));
    formData.append("beneficiaryInfo", JSON.stringify(data.beneficiaryInfo));
    formData.append("location", JSON.stringify(data.location));
    formData.append("witnesses", JSON.stringify(data.witnesses));
    formData.append("uploadedDocuments", JSON.stringify(data.uploadedDocuments));
    formData.append("lossTypes", JSON.stringify(data.lossTypes));
    
    formData.append("source", data.source);
    formData.append("subject", data.subject);
    formData.append("disasterType", data.disasterType);
    formData.append("cause", data.cause);
    formData.append("compensationDemand", data.compensationDemand || "");
    formData.append("incidentDate", data.incidentDate);
    formData.append("incidentHalfDay", form.incidentHalfDay);
    formData.append("applicationDate", data.applicationDate);
    formData.append("disasterEventId", data.disasterEventId);
    formData.append("lossDetails", JSON.stringify(form.lossDetails));

    Object.keys(uploadedFiles).forEach(key => {
      if (uploadedFiles[key]) formData.append(key, uploadedFiles[key]);
    });

    // ── Dynamic Field Validation ──
    for (const ltKey of form.lossTypes) {
      const metric = masters.lossMetrics.find(m => m.key === ltKey);
      if (metric && metric.fields) {
        for (const f of metric.fields) {
          if (f.required && !form.lossDetails[ltKey]?.[f.name]) {
            setError(`Please fill required field: ${f.label} in ${metric.name}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      }
    }

    try {
      const res = isDept 
        ? await applicationApi.submitDepartment(formData) 
        : await applicationApi.submitPublic(formData);
      
      if (res.data.success) {
        setAppNumber(res.data.applicationNumber);
        setStatus("success");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong during submission.");
      setStatus("error");
    }
  };

  if (status === "success") return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
      <div className="max-w-xl w-full bg-white rounded-sm shadow-2xl p-12 text-center border-t-8 border-[#003366]">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
          <CheckCircle className="text-emerald-600 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#003366] mb-3 tracking-tighter uppercase">Submission Acknowledged</h2>
        <p className="text-slate-400 mb-10 font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed">The application has been officially recorded in the Disaster Relief Database.</p>
        
        <div className="bg-slate-50 border border-slate-200 p-8 mb-10">
          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Official Application Number</span>
          <span className="text-3xl font-mono font-bold text-[#003366] tracking-wider select-all">{appNumber}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate(`/track?id=${appNumber}`)} className="h-12 bg-[#003366] text-white font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-3 shadow-lg">
            Track Status <ChevronRight size={16} />
          </button>
          <button onClick={() => navigate("/dashboard")} className="h-12 border-2 border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-3 hover:bg-slate-50">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <GovHeader />
      
      <div className="flex-1 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Official Form Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                <button onClick={() => navigate("/dashboard")} className="hover:text-[#003366]">Portal</button>
                <ChevronRight size={12} />
                <span className="text-slate-900">New Registration</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={handleSubmit}
                 disabled={status === "loading"}
                 className="h-12 px-8 bg-[#003366] text-white font-bold text-xs uppercase tracking-[0.2em] rounded shadow-xl hover:bg-[#002244] transition-all flex items-center gap-3"
               >
                 {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                 Submit Form
               </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded text-rose-700 flex items-center gap-3">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Content */}
            <div className="lg:col-span-12 space-y-0">
              
              <FormSection title="Source Selection" hindiTitle="स्रोत चयन" icon={Briefcase}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Select the authority or channel filing this record:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {FORM_CONFIG.sources.map(s => (
                      <button 
                        key={s.value} 
                        type="button" 
                        onClick={() => !isPreview && setForm(p => ({ ...p, source: s.value }))}
                        className={`p-5 border-2 text-left transition-all relative group ${
                          form.source === s.value 
                          ? "border-[#003366] bg-slate-50" 
                          : "border-slate-100 hover:border-slate-200"
                        }`}>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-tight mb-1 ${form.source === s.value ? "text-[#003366]" : "text-slate-800"}`}>{s.label.split(' — ')[0]}</span>
                          <span className="text-[9px] font-bold text-slate-300 uppercase leading-none">{s.hindi.split(' — ')[0]}</span>
                        </div>
                        <div className={`absolute top-4 right-4 w-4 h-4 border-2 flex items-center justify-center ${
                          form.source === s.value ? "border-[#003366] bg-[#003366]" : "border-slate-200"
                        }`}>
                          {form.source === s.value && <div className="w-1.5 h-1.5 bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
              </FormSection>

              <FormSection title="Applicant Identification" hindiTitle="आवेदक की पहचान" icon={User}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <FormField name="applicantName" label="Full Name" hindiLabel="पूरा नाम" icon={User} placeholder="Enter as per Aadhar" value={form.applicantName} isPreview={isPreview} onChange={setField} required />
                    <FormField name="applicantFatherName" label="Father/Husband Name" hindiLabel="पिता/पति का नाम" icon={Heart} placeholder="Legal Name" value={form.applicantFatherName} isPreview={isPreview} onChange={setField} />
                    <FormField name="applicantMobile" label="Phone Number" hindiLabel="मोबाइल नंबर" icon={Phone} placeholder="10 Digit Number" value={form.applicantMobile} isPreview={isPreview} onChange={setField} required />
                    <FormField name="applicantAadhar" label="Aadhar ID" hindiLabel="आधार संख्या" icon={Fingerprint} placeholder="12 Digit UID" value={form.applicantAadhar} isPreview={isPreview} onChange={setField} />
                    <div className="col-span-1 md:col-span-2">
                      <FormTextArea name="applicantAddress" label="Permanent Address" hindiLabel="स्थायी पता" icon={MapPin} placeholder="Enter full address details..." value={form.applicantAddress} isPreview={isPreview} onChange={setField} />
                    </div>
                  </div>
              </FormSection>

              <FormSection title="Beneficiary Context" hindiTitle="लाभार्थी का विवरण" icon={Users}>
                  <div className="flex border-b border-slate-100 mb-10 gap-8">
                     <button 
                       onClick={() => !isPreview && setForm(p => ({ ...p, beneficiaryType: "self" }))} 
                       className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${form.beneficiaryType === "self" ? "text-[#003366]" : "text-slate-300"}`}
                     >
                       Self Submission (स्वयं)
                       {form.beneficiaryType === "self" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#003366]" />}
                     </button>
                     <button 
                       onClick={() => !isPreview && setForm(p => ({ ...p, beneficiaryType: "other" }))} 
                       className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${form.beneficiaryType === "other" ? "text-[#003366]" : "text-slate-300"}`}
                     >
                       Third-Party (अन्य)
                       {form.beneficiaryType === "other" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#003366]" />}
                     </button>
                  </div>
                  {form.beneficiaryType === "other" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                       <FormField name="beneficiaryName" label="Beneficiary Name" hindiLabel="लाभार्थी का नाम" value={form.beneficiaryName} isPreview={isPreview} onChange={setField} />
                       <FormField name="beneficiaryRelation" label="Relation" hindiLabel="संबंध" value={form.beneficiaryRelation} isPreview={isPreview} onChange={setField} />
                       <FormField name="beneficiaryMobile" label="Mobile" hindiLabel="मोबाइल" value={form.beneficiaryMobile} isPreview={isPreview} onChange={setField} />
                       <FormField name="beneficiaryAadhar" label="Aadhar" hindiLabel="आधार" value={form.beneficiaryAadhar} isPreview={isPreview} onChange={setField} />
                    </div>
                  )}
              </FormSection>

              <FormSection title="Geographic & Event Intelligence" hindiTitle="भौगोलिक और घटना का विवरण" icon={Activity}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                     <FormSelect 
                       name="district" label="District" hindiLabel="जिला" icon={MapPin} value={form.district} isPreview={isPreview} 
                       displayValue={masters.districts.find(d => d._id === form.district)?.name} 
                       onChange={setField} required
                     >
                        <option value="">Select District</option>
                        {masters.districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                     </FormSelect>
                     <FormSelect 
                       name="applicantTehsil" label="Tehsil" hindiLabel="तहसील" icon={Landmark} value={form.applicantTehsil} isPreview={isPreview}
                       displayValue={masters.tehsils.find(t => t._id === form.applicantTehsil)?.name}
                       onChange={setField} disabled={!form.district}
                     >
                        <option value="">{form.district ? "Select Tehsil" : "Select District First"}</option>
                        {masters.tehsils.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                     </FormSelect>
                     <FormSelect 
                       name="applicantBlock" label="Block" hindiLabel="ब्लॉक" icon={Building} value={form.applicantBlock} isPreview={isPreview}
                       displayValue={masters.blocks.find(b => b._id === form.applicantBlock)?.name}
                       onChange={setField} disabled={!form.district}
                     >
                        <option value="">{form.district ? "Select Block" : "Select District First"}</option>
                        {masters.blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                     </FormSelect>
                     <FormSelect 
                       name="applicantGP" label="Gram Panchayat" hindiLabel="ग्राम पंचायत" icon={Layers} value={form.applicantGP} isPreview={isPreview}
                       displayValue={masters.panchayats.find(p => p._id === form.applicantGP)?.name}
                       onChange={setField} disabled={!form.applicantBlock}
                     >
                        <option value="">{form.applicantBlock ? "Select GP" : "Select Block First"}</option>
                        {masters.panchayats.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                     </FormSelect>
                     <FormSelect 
                       name="applicantVillage" label="Village" hindiLabel="ग्राम" icon={Home} value={form.applicantVillage} isPreview={isPreview}
                       displayValue={masters.villages.find(v => v._id === form.applicantVillage)?.name}
                       onChange={setField} disabled={!form.applicantGP}
                     >
                        <option value="">{form.applicantGP ? "Select Village" : "Select GP First"}</option>
                        {masters.villages.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                     </FormSelect>
                     
                     <div className="col-span-1 md:col-span-2 pt-8 mt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormField name="incidentDate" label="Incident Date" hindiLabel="घटना दिनांक" icon={Calendar} type="date" value={form.incidentDate} isPreview={isPreview} onChange={setField} required />
                        <FormSelect 
                          name="incidentHalfDay" label="Incident Time" hindiLabel="समय" icon={Clock} value={form.incidentHalfDay} isPreview={isPreview}
                          displayValue={form.incidentHalfDay === "FIRST_HALF" ? "First Half (AM)" : "Second Half (PM)"}
                          onChange={setField} required
                        >
                           <option value="FIRST_HALF">First Half (AM)</option>
                           <option value="SECOND_HALF">Second Half (PM)</option>
                        </FormSelect>
                        <FormSelect 
                          name="disasterType" label="Disaster Type" hindiLabel="आपदा प्रकार" icon={Shield} value={form.disasterType} isPreview={isPreview}
                          displayValue={masters.disasterTypes.find(d => d._id === form.disasterType)?.nameHindi}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(p => ({
                              ...p,
                              disasterType: val,
                              lossTypes: [],
                              lossDetails: {}
                            }));
                          }} 
                          required
                        >
                           <option value="">Select Disaster Type</option>
                           {masters.disasterTypes.map(d => (
                             <option key={d._id} value={d._id}>
                               {d.nameHindi} ({d.name})
                             </option>
                           ))}
                        </FormSelect>
                     </div>

                     <div className="col-span-1 md:col-span-2">
                       <FormField name="subject" label="Record Subject" hindiLabel="विषय" icon={FileText} placeholder="e.g. Relief Claim for House Damage" value={form.subject} isPreview={isPreview} onChange={setField} required />
                     </div>
                     <div className="col-span-1 md:col-span-2">
                       <FormTextArea name="cause" label="Detailed Factual Statement" hindiLabel="विस्तृत विवरण" placeholder="Describe the incident and how it occurred..." value={form.cause} isPreview={isPreview} onChange={setField} />
                     </div>
                  </div>

                  {masters.activeIncidents.length > 0 && (
                    <div className="mt-10 p-6 bg-slate-50 border-l-4 border-amber-400 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <Activity size={24} className="text-amber-500" />
                        <div>
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Event Detected</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Existing record found in this location. Link application?</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setForm(p => ({ ...p, disasterEventId: masters.activeIncidents[0]._id }))}
                        className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          form.disasterEventId === masters.activeIncidents[0]._id 
                          ? 'bg-[#003366] border-[#003366] text-white' 
                          : 'bg-white border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white'
                        }`}
                      >
                        {form.disasterEventId === masters.activeIncidents[0]._id ? "Linked" : "Link Record"}
                      </button>
                    </div>
                  )}
              </FormSection>

              <FormSection title="Loss Metrics & Evidence" hindiTitle="क्षति और साक्ष्य" icon={IndianRupee}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <FormSelect 
                          label="Add Damage Categories"
                          hindiLabel="क्षति श्रेणी जोड़ें"
                          icon={Plus}
                          value="" 
                          onChange={(e) => { if (e.target.value) toggleLoss(e.target.value); e.target.value = ""; }}
                        >
                           <option value="">+ Select Category</option>
                           {(masters.disasterTypes.find(d => d._id === form.disasterType)?.allowedLossMetrics || []).map(lt => (
                             <option key={lt.key} value={lt.key} disabled={form.lossTypes.includes(lt.key)}>{lt.nameHindi || lt.name}</option>
                           ))}
                        </FormSelect>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                           {form.lossTypes.map(ltKey => {
                             const metric = masters.lossMetrics.find(m => m.key === ltKey);
                             if (!metric) return null;
                             return (
                               <div key={ltKey} className="w-full p-4 border border-slate-100 bg-slate-50/50 rounded-sm space-y-4">
                                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#003366]">{metric.nameHindi || metric.name}</span>
                                    <button onClick={() => toggleLoss(ltKey)} className="text-slate-400 hover:text-gov-red transition-colors"><X size={14} /></button>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {metric.fields?.map(f => (
                                      <div key={f.name}>
                                        {f.type === 'select' || f.type === 'boolean' ? (
                                          <FormSelect
                                            label={f.label}
                                            hindiLabel={f.labelHindi}
                                            value={form.lossDetails[ltKey]?.[f.name] || ""}
                                            onChange={(e) => setLossDetail(ltKey, f.name, e.target.value)}
                                            isPreview={isPreview}
                                            displayValue={
                                              f.type === 'boolean' 
                                                ? (form.lossDetails[ltKey]?.[f.name] === "true" ? "Yes (हाँ)" : form.lossDetails[ltKey]?.[f.name] === "false" ? "No (नहीं)" : "") 
                                                : form.lossDetails[ltKey]?.[f.name]
                                            }
                                          >
                                            <option value="">Select Option</option>
                                            {f.type === 'boolean' ? (
                                              <>
                                                <option value="true">Yes (हाँ)</option>
                                                <option value="false">No (नहीं)</option>
                                              </>
                                            ) : (
                                              f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)
                                            )}
                                          </FormSelect>
                                        ) : (
                                          <FormField
                                            label={f.label}
                                            hindiLabel={f.labelHindi}
                                            type={f.type}
                                            placeholder={f.placeholder}
                                            value={form.lossDetails[ltKey]?.[f.name] || ""}
                                            onChange={(e) => setLossDetail(ltKey, f.name, e.target.value)}
                                            isPreview={isPreview}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                               </div>
                             );
                           })}
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                          <FormField name="compensationDemand" label="Expected Relief (₹)" hindiLabel="मुआवजा राशि" icon={IndianRupee} type="number" placeholder="Enter Amount" value={form.compensationDemand} isPreview={isPreview} onChange={setField} />
                        </div>
                      </div>
                     
                     {form.disasterType && (
                       <div className="space-y-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Required Documents (साक्ष्य दस्तावेज)</span>
                         <div className="grid grid-cols-1 gap-3">
                           {requiredDocs.map((rd, i) => (
                             <div key={rd._id} className="p-3 border border-slate-200 rounded flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3 min-w-0">
                                   <FileText size={14} className="text-slate-400" />
                                   <div className="truncate">
                                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{rd.nameHindi || rd.name}</p>
                                     <p className="text-[8px] font-bold text-slate-400 uppercase">{rd.isUserMandatory ? "Required" : "Optional"}</p>
                                   </div>
                                </div>
                                <input type="file" onChange={(e) => handleFileChange(`doc_${i}`, e.target.files[0])} className="hidden" id={`file_${i}`} disabled={isPreview} />
                                <label 
                                  htmlFor={isPreview ? "" : `file_${i}`} 
                                  className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                                    uploadedFiles[`doc_${i}`] 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-[#003366] hover:text-[#003366] cursor-pointer'
                                  }`}
                                >
                                   {uploadedFiles[`doc_${i}`] ? "Ready" : "Upload"}
                                </label>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                  </div>
              </FormSection>

              <FormSection title="Witness Registry" hindiTitle="गवाहों का पंजीकरण" icon={History}>
                  <div className="space-y-4">
                    {form.witnesses.map((w, i) => (
                      <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded flex flex-col md:flex-row gap-8 relative group">
                        <div className="flex-1">
                          <FormField label="Witness Name" hindiLabel="गवाह नाम" value={w.name} isPreview={isPreview} onChange={e => setWitness(i, "name", e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <FormField label="Contact Number" hindiLabel="मोबाइल" value={w.mobile} isPreview={isPreview} onChange={e => setWitness(i, "mobile", e.target.value)} />
                        </div>
                        {!isPreview && form.witnesses.length > 1 && (
                          <button onClick={() => removeWitness(i)} className="absolute -right-2 -top-2 w-7 h-7 bg-white shadow border border-slate-100 rounded-full text-gov-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {!isPreview && (
                      <button onClick={addWitness} className="w-full py-4 border-2 border-dashed border-slate-200 rounded text-[10px] font-black text-slate-400 hover:border-[#003366] hover:text-[#003366] transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
                        <Plus size={14} /> Add Additional Witness
                      </button>
                    )}
                  </div>
              </FormSection>

              {/* Final Review Actions */}
              <div className="mt-12 p-10 bg-[#003366] text-white rounded flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl">
                 <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                       <Shield size={20} className="text-amber-400" />
                       <h4 className="text-xs font-black uppercase tracking-[0.2em]">Official Declaration</h4>
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase">
                      I hereby declare that the information provided is correct to the best of my knowledge. I understand that any false statement will lead to rejection of the claim and legal proceedings.
                    </p>
                 </div>
                 
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    {isPreview ? (
                      <>
                        <button onClick={() => setIsPreview(false)} className="h-12 px-8 border-2 border-white/20 text-white font-black text-xs uppercase tracking-widest rounded hover:bg-white/5 transition-all flex items-center gap-2">
                          <ArrowLeft size={16} /> Edit
                        </button>
                        <button 
                          onClick={handleSubmit} 
                          disabled={status === "loading"}
                          className="h-12 px-10 bg-amber-500 text-[#003366] font-black text-xs uppercase tracking-widest rounded shadow-xl hover:bg-amber-400 transition-all flex items-center gap-3 flex-1 md:flex-none"
                        >
                          {status === "loading" ? "Processing..." : "Final Submit"}
                          <Send size={16} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setIsPreview(true)} className="h-12 px-12 bg-white text-[#003366] font-black text-xs uppercase tracking-widest rounded shadow-xl hover:bg-slate-50 transition-all flex items-center gap-3 w-full md:w-auto">
                        Preview Record
                        <ChevronRight size={16} />
                      </button>
                    )}
                 </div>
              </div>

              {/* Technical Footer */}
              <div className="mt-12 text-center pb-20">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">
                  Disaster Relief Intelligence System · Official Filing Portal
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;
