import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Shield, Upload, CheckCircle2, AlertCircle, 
  Loader2, ArrowLeft, FileText, X 
} from "lucide-react";
import { applicationApi } from "../services/api.service";
import useAuthStore from "../store/authStore";

const PublicUpload = () => {
  const { applicationNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [appData, setAppData] = useState(null);
  const [files, setFiles] = useState({}); // { docName: fileObject }

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationNumber]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await applicationApi.getTrackDocs(applicationNumber);
      setAppData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load application details.");
      if (err.response?.status === 403) {
        setError("Unauthorized. This application does not belong to your account mobile number.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (docName, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setFiles(prev => ({ ...prev, [docName]: file }));
    }
  };

  const removeFile = (docName) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[docName];
      return newFiles;
    });
  };

  const handleUploadAll = async () => {
    if (Object.keys(files).length === 0) return;
    
    setUploading(true);
    setError("");
    try {
      // Backend handles one file at a time currently, we'll loop or update backend
      // For now, let's upload each file sequentially to match current backend
      for (const [docName, file] of Object.entries(files)) {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("name", docName);
        
        // Find the original requested document to get its type ID
        const originalDoc = appData.requiredDocuments.find(d => d.name === docName);
        if (originalDoc?.documentType) {
          formData.append("documentType", originalDoc.documentType);
        }
        
        await applicationApi.uploadDocument(appData.applicationId, formData);
      }
      setSuccess(true);
      setFiles({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload documents.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold">Verifying authorization...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
          <AlertCircle className="text-red-500" size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">{error}</p>
        <button 
          onClick={() => navigate("/track")}
          className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:border-brand-200 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back to Track
        </button>
      </div>
    );
  }

  const pendingDocs = appData?.requiredDocuments.filter(req => 
    !appData.uploadedDocuments.some(up => up.name === req.name)
  ) || [];

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="text-emerald-500" size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Documents Updated!</h2>
        <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">
          Your documents have been successfully uploaded. The verifying officer will be notified to resume the review process.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate(`/track?id=${applicationNumber}`)}
            className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
          >
            Track Status
          </button>
          <button 
            onClick={() => setSuccess(false)}
            className="px-10 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Upload More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 shadow-inner">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document Submission</h1>
            <p className="text-slate-500 text-sm font-medium">Verify and upload requested proof for <span className="text-brand-600">{applicationNumber}</span></p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                   <FileText size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-900">Requested Documentation</h3>
                   <p className="text-slate-500 text-xs font-medium">Please provide the following documents to proceed with your application review.</p>
                </div>
             </div>
          </div>

          <div className="p-8 space-y-6">
            {pendingDocs.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
                <p className="text-slate-800 font-bold">All requested documents are already uploaded.</p>
                <p className="text-slate-500 text-sm mt-1">You will be notified if any further information is needed.</p>
              </div>
            ) : (
              pendingDocs.map((doc, idx) => (
                <div key={idx} className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:border-brand-200 hover:bg-white transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                        <Upload size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase tracking-wide text-xs">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">PDF, JPG or PNG (Max 5MB)</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {files[doc.name] ? (
                        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
                          <span className="text-xs font-bold text-emerald-700 truncate max-w-[120px]">{files[doc.name].name}</span>
                          <button onClick={() => removeFile(doc.name)} className="text-emerald-500 hover:text-emerald-700">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer px-6 py-2.5 bg-white border border-brand-200 text-brand-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95">
                          Select File
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(doc.name, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {pendingDocs.length > 0 && (
              <div className="pt-6">
                 <button 
                   onClick={handleUploadAll}
                   disabled={uploading || Object.keys(files).length === 0}
                   className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3"
                 >
                   {uploading ? (
                     <>
                        <Loader2 className="animate-spin" size={20} />
                        Uploading Documents...
                     </>
                   ) : (
                     <>
                        <Upload size={20} />
                        Upload Selected Files
                     </>
                   )}
                 </button>
                 <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
                   Ensure all documents are clearly legible before submitting.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicUpload;
