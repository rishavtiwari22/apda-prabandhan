import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowRight, FileText, ChevronLeft, PlusCircle, Activity, ShieldAlert, Home, Info } from "lucide-react";
import API from "../../services/api";

const DocumentManagement = ({ disaster, onBack }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: "",
    nameHindi: "",
    responsibleDepartment: "individual",
    isUserMandatory: false,
    isDeptMandatory: true,
    allowUserOptional: true,
  });
  
  const DEPARTMENTS = [
    { value: "individual", label: "Applicant (Individual)", icon: <Activity size={12} /> },
    { value: "revenue", label: "Revenue (Patwari)", icon: <FileText size={12} /> },
    { value: "police", label: "Police (Thana)", icon: <ShieldAlert size={12} /> },
    { value: "health", label: "Health (Hospital)", icon: <Activity size={12} /> },
    { value: "agriculture", label: "Agriculture", icon: <Info size={12} /> },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [disaster._id]);

  const fetchDocuments = async () => {
    try {
      const res = await API.get(`/master/document-types/${disaster._id}`);
      setDocuments(res.data.data);
    } catch (err) {
      setError("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/master/document-types", {
        ...newDoc,
        disasterType: disaster._id,
      });
      setShowAddModal(false);
      setNewDoc({
        name: "",
        nameHindi: "",
        responsibleDepartment: "individual",
        isUserMandatory: false,
        isDeptMandatory: true,
        allowUserOptional: true,
      });
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add document");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this document requirement?")) return;
    try {
      await API.delete(`/master/document-types/${id}`);
      fetchDocuments();
    } catch (err) {
      setError("Failed to delete document");
    }
  };

  return (
    <div className="animate-in slide-in-from-right-10 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-slate-400 hover:text-brand-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
               <ChevronLeft size={16} />
            </div>
            Back to Categories
          </button>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-3xl bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand-600/20">
              <FileText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">{disaster.nameHindi}</h1>
                 <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">{disaster.name}</span>
              </div>
              <p className="text-slate-500 font-semibold italic text-sm">Required Documentation Standards</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-2xl shadow-slate-900/10 hover:bg-brand-600 hover:-translate-y-1 transition-all duration-300 group"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
          Add New Requirement
        </button>
      </div>

      {error && (
        <div className="mb-10 p-6 bg-red-50 border-2 border-red-100 text-red-700 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
             <AlertTriangle size={24} />
          </div>
          <p className="font-bold">{error}</p>
          <button onClick={() => setError("")} className="ml-auto w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"><XCircle size={20} /></button>
        </div>
      )}

      {loading && !documents.length ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
           <div className="w-20 h-20 border-8 border-brand-50 rounded-full border-t-brand-600 animate-spin"></div>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Synchronizing Master Docs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col group hover:border-brand-100 hover:shadow-brand-600/5 transition-all duration-500 relative">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${doc.isUserMandatory || doc.isDeptMandatory ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                  <FileText size={24} />
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {doc.isUserMandatory && (
                    <span className="px-2 py-0.5 bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm">User Mandatory</span>
                  )}
                  {doc.isDeptMandatory && (
                    <span className="px-2 py-0.5 bg-brand-600 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm">Dept Mandatory</span>
                  )}
                  {doc.allowUserOptional && !doc.isUserMandatory && (
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm">User Optional</span>
                  )}
                </div>
              </div>
              
              <div className="flex-grow">
                <h4 className="font-black text-slate-900 text-lg mb-1 tracking-tight">{doc.nameHindi}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{doc.name}</p>
                
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600">
                    {DEPARTMENTS.find(d => d.value === doc.responsibleDepartment)?.icon || <Info size={14} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Responsible Dept</span>
                    <span className="text-xs font-bold text-slate-700 leading-none">
                       {DEPARTMENTS.find(d => d.value === doc.responsibleDepartment)?.label || doc.responsibleDepartment}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(doc._id)}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 border border-slate-100 hover:border-red-100 shadow-sm"
                title="Remove Requirement"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <div className="w-20 h-20 bg-white rounded-3xl shadow-premium mx-auto flex items-center justify-center text-slate-200 mb-6">
                  <FileText size={40} />
               </div>
               <h3 className="text-lg font-black text-slate-900 mb-1">No Documentation Defined</h3>
               <p className="text-slate-500 font-medium">Register mandatory document requirements for this disaster type.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-lg">Define Requirement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={24} /></button>
            </div>
            
            <form onSubmit={handleAddDocument} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (EN)</label>
                  <input
                    type="text"
                    required
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-xs font-bold"
                    placeholder="Doc Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (HI)</label>
                  <input
                    type="text"
                    required
                    value={newDoc.nameHindi}
                    onChange={(e) => setNewDoc({ ...newDoc, nameHindi: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-xs font-bold"
                    placeholder="दस्तावेज़ का नाम"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Responsible Department</label>
                <select
                  value={newDoc.responsibleDepartment}
                  onChange={(e) => setNewDoc({ ...newDoc, responsibleDepartment: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-xs font-bold appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Configurations</label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-black text-slate-700">Mandatory from User?</span>
                    <input
                      type="checkbox"
                      checked={newDoc.isUserMandatory}
                      onChange={(e) => setNewDoc({ ...newDoc, isUserMandatory: e.target.checked })}
                      className="w-5 h-5 accent-brand-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-black text-slate-700">Mandatory from Department?</span>
                    <input
                      type="checkbox"
                      checked={newDoc.isDeptMandatory}
                      onChange={(e) => setNewDoc({ ...newDoc, isDeptMandatory: e.target.checked })}
                      className="w-5 h-5 accent-brand-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-black text-slate-700">Allow User Optional Upload?</span>
                    <input
                      type="checkbox"
                      checked={newDoc.allowUserOptional}
                      onChange={(e) => setNewDoc({ ...newDoc, allowUserOptional: e.target.checked })}
                      className="w-5 h-5 accent-brand-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-brand-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="animate-spin text-white" size={20} /> : <>ADD REQUIREMENT <PlusCircle size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
