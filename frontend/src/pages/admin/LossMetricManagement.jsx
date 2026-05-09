import { useState, useEffect } from "react";
import { 
  Plus, Trash2, CheckCircle, XCircle, AlertTriangle, AlertCircle, 
  Loader2, Edit2, FileText, Activity, Shield, Layers, 
  PlusCircle, X, Search, ChevronRight, Settings2, Trash
} from "lucide-react";
import API from "../../services/api";

const FIELD_TYPES = [
  { value: "text", label: "Text Input (छोटा उत्तर)" },
  { value: "number", label: "Number (संख्या)" },
  { value: "select", label: "Dropdown (विकल्प चुनें)" },
  { value: "date", label: "Date (दिनांक)" },
  { value: "boolean", label: "Yes/No (हाँ/नहीं)" },
];

const LossMetricManagement = () => {
  const [metrics, setMetrics] = useState([]);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResults, setBulkResults] = useState(null);

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    nameHindi: "",
    fields: [],
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([
        API.get("/master/loss-metrics"),
        API.get("/master/disaster-types")
      ]);
      setMetrics(mRes.data.data);
      setDisasterTypes(dRes.data.data);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (metric = null, viewMode = false) => {
    setIsViewOnly(viewMode);
    if (metric) {
      setEditingId(metric._id);
      setFormData({
        key: metric.key,
        name: metric.name,
        nameHindi: metric.nameHindi,
        fields: metric.fields || [],
        isActive: metric.isActive !== undefined ? metric.isActive : true
      });
    } else {
      setEditingId(null);
      setFormData({
        key: "",
        name: "",
        nameHindi: "",
        fields: [{ name: "", label: "", labelHindi: "", type: "text", required: false }],
        isActive: true
      });
    }
    setShowModal(true);
  };

  const addFieldRow = () => {
    setFormData(p => ({
      ...p,
      fields: [...p.fields, { name: "", label: "", labelHindi: "", type: "text", required: false }]
    }));
  };

  const removeFieldRow = (idx) => {
    setFormData(p => ({
      ...p,
      fields: p.fields.filter((_, i) => i !== idx)
    }));
  };

  const updateFieldData = (idx, field, value) => {
    const updatedFields = [...formData.fields];
    updatedFields[idx] = { ...updatedFields[idx], [field]: value };
    setFormData(p => ({ ...p, fields: updatedFields }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/master/loss-metrics/${editingId}`, formData);
      } else {
        await API.post("/master/loss-metrics", formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    try {
      setLoading(true);
      let jsonData = JSON.parse(bulkInput);
      if (jsonData && !Array.isArray(jsonData)) jsonData = [jsonData];
      
      const res = await API.post("/master/bulk-loss-metrics", { data: jsonData });
      setBulkResults(res.data.results);
      setBulkInput("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this metric? This will hide it from the application form.")) return;
    setLoading(true);
    try {
      await API.delete(`/master/loss-metrics/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredMetrics = metrics.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nameHindi.includes(searchTerm) ||
    m.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisastersForMetric = (metricId) => {
    return disasterTypes.filter(d => d.allowedLossMetrics?.some(id => (id._id || id) === metricId));
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-8 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/20"></div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">क्षति मानक प्रबंधन <span className="text-emerald-600 font-medium text-lg ml-2 opacity-60">(Loss Metrics)</span></h1>
          </div>
          <p className="text-slate-500 font-semibold max-w-xl">Configure dynamic data collection fields for different types of disaster losses.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <input 
              type="text"
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-bold shadow-premium"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-slate-900/5"
            >
              Bulk Import <Layers size={18} />
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="group flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/10"
            >
              Add Metric <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border-2 border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-bold text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto p-1 hover:bg-rose-100 rounded-full"><X size={16} /></button>
        </div>
      )}

      {loading && metrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
          <p className="text-slate-500 font-bold">Loading metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMetrics.map(metric => {
            const linkedDisasters = getDisastersForMetric(metric._id);
            return (
              <div key={metric._id} className="bg-white border border-slate-100 rounded-[2rem] shadow-premium p-6 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Activity size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(metric, false)} className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-slate-100"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(metric._id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-1">{metric.name}</h3>
                <p className="text-sm font-bold text-emerald-600 mb-3">{metric.nameHindi}</p>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md uppercase tracking-widest border border-slate-200">KEY: {metric.key}</span>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md uppercase tracking-widest border border-slate-200">{metric.fields?.length || 0} FIELDS</span>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Disasters</p>
                   <div className="flex flex-wrap gap-2">
                      {linkedDisasters.length > 0 ? linkedDisasters.map(d => (
                        <span key={d._id} className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">{d.nameHindi}</span>
                      )) : (
                        <span className="text-[9px] font-bold text-slate-300 italic uppercase">Not linked yet</span>
                      )}
                   </div>
                </div>

                <button 
                  onClick={() => handleOpenModal(metric, true)}
                  className="w-full mt-6 py-3 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all"
                >
                  View Details & Fields
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-3xl overflow-hidden my-8 animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Settings2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">{editingId ? "Edit Metric" : "New Loss Metric"}</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Configuration Schema</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all"><X size={24} /></button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar flex-grow">
               <form onSubmit={handleFormSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Metric Key (UNIQUE)</label>
                        <input
                          type="text"
                          required
                          readOnly={editingId || isViewOnly}
                          value={formData.key}
                          onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                          className={`w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-black ${isViewOnly ? 'bg-slate-50' : 'bg-white'}`}
                          placeholder="e.g. CATTLE_LOSS"
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (EN)</label>
                        <input
                          type="text"
                          required
                          readOnly={isViewOnly}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-black ${isViewOnly ? 'bg-slate-50' : 'bg-white'}`}
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name (HI)</label>
                        <input
                          type="text"
                          required
                          readOnly={isViewOnly}
                          value={formData.nameHindi}
                          onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                          className={`w-full px-5 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-black ${isViewOnly ? 'bg-slate-50' : 'bg-white'}`}
                        />
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Dynamic Field Schema</h4>
                        {!isViewOnly && (
                          <button type="button" onClick={addFieldRow} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2">
                             <PlusCircle size={14} /> Add Field
                          </button>
                        )}
                     </div>

                     <div className="space-y-4">
                        {formData.fields.length === 0 ? (
                          <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                             <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">No fields defined yet</p>
                          </div>
                        ) : (
                          formData.fields.map((field, idx) => (
                            <div key={idx} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2">
                               <div className="md:col-span-3">
                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">ID (Variable Name)</label>
                                  <input 
                                    type="text" readOnly={isViewOnly} placeholder="e.g. cropType" value={field.name}
                                    onChange={(e) => updateFieldData(idx, 'name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                  />
                               </div>
                               <div className="md:col-span-3">
                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Label (English)</label>
                                  <input 
                                    type="text" readOnly={isViewOnly} placeholder="e.g. Type of Crop" value={field.label}
                                    onChange={(e) => updateFieldData(idx, 'label', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                  />
                               </div>
                               <div className="md:col-span-3">
                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Field Type</label>
                                  <select 
                                    disabled={isViewOnly} value={field.type}
                                    onChange={(e) => updateFieldData(idx, 'type', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none"
                                  >
                                     {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                  </select>
                               </div>
                               <div className="md:col-span-2 flex items-center justify-center pb-2.5">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                     <input 
                                       type="checkbox" disabled={isViewOnly} checked={field.required}
                                       onChange={(e) => updateFieldData(idx, 'required', e.target.checked)}
                                       className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500"
                                     />
                                     <span className="text-[9px] font-black text-slate-400 uppercase group-hover:text-slate-600">Required</span>
                                  </label>
                               </div>
                               <div className="md:col-span-1 flex justify-end">
                                  {!isViewOnly && (
                                    <button type="button" onClick={() => removeFieldRow(idx)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                       <Trash size={16} />
                                    </button>
                                  )}
                               </div>
                               
                               {field.type === 'select' && (
                                 <div className="md:col-span-12 mt-2">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Options (Comma Separated)</label>
                                    <input 
                                      type="text" readOnly={isViewOnly} placeholder="e.g. Cow, Buffalo, Goat" 
                                      value={Array.isArray(field.options) ? field.options.join(", ") : ""}
                                      onChange={(e) => updateFieldData(idx, 'options', e.target.value.split(",").map(o => o.trim()))}
                                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                                    />
                                 </div>
                               )}
                            </div>
                          ))
                        )}
                     </div>
                  </div>

                  {!isViewOnly && (
                    <div className="pt-8 shrink-0">
                      <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
                        {loading ? <Loader2 className="animate-spin" /> : <>SAVE METRIC CONFIGURATION <CheckCircle size={20} /></>}
                      </button>
                    </div>
                  )}
               </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                     <PlusCircle size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Metrics Import</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Import schema from JSON</p>
                  </div>
               </div>
               <button onClick={() => { setShowBulkModal(false); setBulkResults(null); }} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8">
               {bulkResults ? (
                  <div className="space-y-6">
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Created</p>
                           <p className="text-xl font-black text-emerald-600">{bulkResults.created}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Updated</p>
                           <p className="text-xl font-black text-blue-600">{bulkResults.updated}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Linked</p>
                           <p className="text-xl font-black text-amber-600">{bulkResults.linked}</p>
                        </div>
                     </div>
                     <button onClick={() => { setShowBulkModal(false); setBulkResults(null); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">Done</button>
                  </div>
               ) : (
                 <div className="space-y-6">
                    <textarea 
                      value={bulkInput} onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Paste JSON array here..."
                      className="w-full h-48 px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-emerald-600/5 outline-none font-mono text-[10px] font-bold"
                    />
                    <button onClick={handleBulkSubmit} disabled={!bulkInput.trim() || loading} className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                       {loading ? <Loader2 className="animate-spin" /> : <>IMPORT DATA <CheckCircle size={18} /></>}
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LossMetricManagement;
