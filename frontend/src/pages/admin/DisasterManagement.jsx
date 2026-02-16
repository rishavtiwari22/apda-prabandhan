import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import API from "../../services/api";

const DisasterManagement = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDisaster, setNewDisaster] = useState({
    name: "",
    nameHindi: "",
    description: "",
  });

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const res = await API.get("/master/disaster-types");
      setDisasters(res.data.data);
    } catch (err) {
      setError("Failed to fetch disaster types");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDisaster = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/master/disaster-types", newDisaster);
      setShowAddModal(false);
      setNewDisaster({ name: "", nameHindi: "", description: "" });
      fetchDisasters();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add disaster type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-6 bg-brand-600 rounded-full"></div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">आपदा प्रकार (Disaster Types)</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Manage disaster categories and document requirements.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-0.5 transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
          Add New Type
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {loading && !disasters.length ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-t-brand-600 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Master Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {disasters.map((disaster) => (
            <div key={disaster._id} className="group bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-premium border border-slate-100 hover:border-brand-100 hover:shadow-brand-600/5 transition-all duration-300 relative overflow-hidden">
              {/* Card Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-brand-100 transition-colors duration-500 opacity-60"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-0.5 group-hover:text-brand-600 transition-colors">{disaster.name}</h3>
                    <p className="text-sm font-black text-brand-600 uppercase tracking-wider opacity-80">{disaster.nameHindi}</p>
                  </div>
                  {disaster.isActive ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-100">
                      <CheckCircle size={10} /> Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-200">
                      <XCircle size={10} /> Inactive
                    </div>
                  )}
                </div>
                
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-3 h-[4.5rem]">
                  {disaster.description || "Establish specialized processes and documentation standards for this disaster response category."}
                </p>
                
                <div className="border-t border-slate-50 pt-6 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                       <FileText size={14} className="text-slate-400" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {disaster.requiredDocuments?.length || 0} Requirements
                    </span>
                  </div>
                  <button className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-slate-100 hover:border-red-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Shortcut Card */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="group p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 transition-all flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]"
          >
            <div className="w-16 h-16 rounded-[2rem] bg-slate-50 text-slate-300 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all flex items-center justify-center border border-slate-100 group-hover:border-brand-200">
              <Plus size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">नया जोड़ें (Add New)</p>
              <p className="text-slate-400 text-xs font-medium">Click to register a new type</p>
            </div>
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Add Disaster Type</h3>
                <p className="text-slate-500 text-xs font-medium">Fill in the administrative details below</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-10 h-10 rounded-2xl bg-white text-slate-400 hover:text-slate-600 hover:shadow-md transition-all flex items-center justify-center border border-slate-200"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddDisaster} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={newDisaster.name}
                    onChange={(e) => setNewDisaster({ ...newDisaster, name: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-medium shadow-sm"
                    placeholder="e.g. Earthquake"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (Hindi)</label>
                  <input
                    type="text"
                    required
                    value={newDisaster.nameHindi}
                    onChange={(e) => setNewDisaster({ ...newDisaster, nameHindi: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-medium shadow-sm"
                    placeholder="जैसे: भूकंप"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea
                  value={newDisaster.description}
                  onChange={(e) => setNewDisaster({ ...newDisaster, description: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:bg-white outline-none transition-all text-sm font-medium shadow-sm min-h-[120px]"
                  placeholder="Provide context and standard operating guidelines..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin text-white" size={20} /> : <>SAVE MASTER RECORD <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterManagement;
