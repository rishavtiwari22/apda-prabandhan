import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, AlertTriangle, AlertCircle, Loader2, Edit2, ArrowRight, FileText, Flame, Waves, CloudLightning, Skull, Activity, Home, Info, Shield, ShieldAlert, Clock, PlusCircle, X, Globe, Landmark, Building, Layers } from "lucide-react";
import API from "../../services/api";
import DocumentManagement from "./DocumentManagement";

const COMPENSATION_CATEGORIES = [
  { value: "EX_GRATIA", label: "Ex-Gratia (अनुग्रह राशि)", icon: <Skull size={18} />, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  { value: "AGRICULTURAL", label: "Agricultural Loss (कृषि हानि)", icon: <Info size={18} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  { value: "HOUSING", label: "Housing Damage (आवास क्षति)", icon: <Home size={18} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { value: "LIVESTOCK", label: "Livestock Loss (पशुधन हानि)", icon: <Activity size={18} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { value: "OTHER", label: "Other (अन्य)", icon: <Info size={18} />, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
];

const getDisasterIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('flood')) return <Waves size={24} />;
  if (lower.includes('fire')) return <Flame size={24} />;
  if (lower.includes('death')) return <Skull size={24} />;
  return <ShieldAlert size={24} />;
};

const DisasterManagement = () => {
  const [disasters, setDisasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDisasterForDocs, setSelectedDisasterForDocs] = useState(null);
  
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    nameHindi: "",
    description: "",
    compensationCategory: "EX_GRATIA",
    slaHours: 24,
    requiredDocuments: [{ 
      name: "", 
      nameHindi: "", 
      responsibleDepartment: "individual", 
      isUserMandatory: false, 
      isDeptMandatory: true, 
      allowUserOptional: true 
    }],
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

  const handleBulkSubmit = async () => {
    try {
      setLoading(true);
      const jsonData = JSON.parse(bulkInput);
      if (typeof jsonData !== "object" || jsonData === null) throw new Error("Invalid JSON: Must be an object or array");
      
      const res = await API.post("/master/bulk-disaster-types", { data: jsonData });
      setBulkResults(res.data.results);
      setBulkInput("");
      fetchDisasters();
    } catch (err) {
      alert(err.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (disaster = null, viewMode = false) => {
    setIsViewOnly(viewMode);
    if (disaster) {
      setEditingId(disaster._id);
      setFormData({
        name: disaster.name,
        nameHindi: disaster.nameHindi,
        description: disaster.description || "",
        compensationCategory: disaster.compensationCategory || "EX_GRATIA",
        slaHours: disaster.slaHours || 24,
        requiredDocuments: disaster.requiredDocuments || [],
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        nameHindi: "",
        description: "",
        compensationCategory: "EX_GRATIA",
        slaHours: 24,
        requiredDocuments: [{ 
          name: "", 
          nameHindi: "", 
          responsibleDepartment: "individual", 
          isUserMandatory: false, 
          isDeptMandatory: true, 
          allowUserOptional: true 
        }],
      });
    }
    setShowModal(true);
  };

  const addDocRow = () => {
    setFormData(p => ({
      ...p,
      requiredDocuments: [...p.requiredDocuments, { 
        name: "", 
        nameHindi: "", 
        responsibleDepartment: "individual", 
        isUserMandatory: false, 
        isDeptMandatory: true, 
        allowUserOptional: true 
      }]
    }));
  };

  const removeDocRow = (index) => {
    setFormData(p => ({
      ...p,
      requiredDocuments: p.requiredDocuments.filter((_, i) => i !== index)
    }));
  };

  const updateDocField = (index, field, value) => {
    const updatedDocs = [...formData.requiredDocuments];
    updatedDocs[index] = { ...updatedDocs[index], [field]: value };
    setFormData(p => ({ ...p, requiredDocuments: updatedDocs }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;
    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/master/disaster-types/${editingId}`, formData);
      } else {
        await API.post("/master/disaster-types", formData);
      }
      setShowModal(false);
      fetchDisasters();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this disaster type?")) return;
    try {
      await API.delete(`/master/disaster-types/${id}`);
      fetchDisasters();
    } catch (err) {
      setError("Failed to deactivate disaster type");
    }
  };

  const filteredDisasters = disasters.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.nameHindi.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {selectedDisasterForDocs ? (
        <DocumentManagement 
          disaster={selectedDisasterForDocs} 
          onBack={() => {
            setSelectedDisasterForDocs(null);
            fetchDisasters();
          }} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-8 bg-brand-600 rounded-full shadow-lg shadow-brand-600/20"></div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">आपदा मास्टर सूची <span className="text-brand-600 font-medium text-lg ml-2 opacity-60">(Master Directory)</span></h1>
              </div>
              <p className="text-slate-500 font-semibold max-w-xl">Configure administrative standards and compensation frameworks for {disasters.length}+ disaster categories.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <input 
                  type="text"
                  placeholder="Search disasters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 outline-none text-sm font-bold shadow-premium"
                />
                <Activity size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="flex items-center gap-3">
             <button
                onClick={() => setShowBulkModal(true)}
                className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-slate-900/5 active:scale-95"
             >
                Bulk Import <Layers size={18} className="group-hover:rotate-12 transition-transform" />
             </button>
             <button
                onClick={() => handleOpenModal()}
                className="group flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
             >
                Add Disaster Type <Plus size={20} className="group-hover:rotate-90 transition-transform" />
             </button>
          </div>
            </div>
          </div>

          {error && (
            <div className="mb-10 p-6 bg-red-50 border-2 border-red-100 text-red-700 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                 <AlertTriangle size={24} />
              </div>
              <p className="font-bold">{error}</p>
              <button onClick={() => setError("")} className="ml-auto w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"><XCircle size={20} /></button>
            </div>
          )}

          {loading && !disasters.length ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-brand-50 rounded-full"></div>
                <div className="w-20 h-20 border-8 border-t-brand-600 rounded-full animate-spin absolute top-0 left-0 shadow-sm"></div>
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-black text-lg">Loading Directory...</p>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">Fetching {disasters.length || ""} Records</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Name</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hindi Mapping</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA (Hrs)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredDisasters.map((disaster) => {
                      const category = COMPENSATION_CATEGORIES.find(c => c.value === disaster.compensationCategory) || COMPENSATION_CATEGORIES[4];
                      return (
                        <tr 
                          key={disaster._id} 
                          className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => handleOpenModal(disaster, true)}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                                {getDisasterIcon(disaster.name)}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors">{disaster.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: {disaster._id.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-sm font-black text-brand-700/60 bg-brand-50/50 px-3 py-1.5 rounded-lg border border-brand-100/30">{disaster.nameHindi}</span>
                          </td>
                          <td className="px-6 py-6">
                            <div className={`inline-flex items-center gap-2 ${category.bg} ${category.color} text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${category.border}`}>
                              {category.icon} {category.label.split(' (')[0]}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-300" />
                              <span className="text-sm font-black text-slate-700">{disaster.slaHours || 24}h</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => handleOpenModal(disaster, false)}
                                className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all flex items-center justify-center border border-slate-200 hover:border-brand-100"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(disaster._id)}
                                className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center border border-slate-200 hover:border-rose-100"
                                title="Deactivate"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button 
                                onClick={() => setSelectedDisasterForDocs(disaster)}
                                className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center border border-slate-200 hover:border-indigo-100 ml-2"
                                title="Documents"
                              >
                                <FileText size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredDisasters.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 font-bold text-sm">No disaster types matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit/View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isViewOnly ? 'bg-brand-600 text-white' : 'bg-slate-900 text-white'}`}>
                  {editingId ? <Edit2 size={24} /> : <Plus size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tight">
                    {isViewOnly ? "Disaster Detail" : editingId ? "Edit Disaster Type" : "Register Disaster"}
                  </h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Master Record Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-12 h-12 rounded-2xl bg-white text-slate-400 hover:text-slate-600 hover:shadow-premium transition-all flex items-center justify-center border border-slate-200 hover:-rotate-90 transition-transform"
              >
                <XCircle size={28} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Administrative Name (EN)</label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-5 py-4 ${isViewOnly ? 'bg-slate-50 text-slate-500 font-bold' : 'bg-white'} border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all text-sm font-black shadow-sm`}
                      placeholder="e.g. Earthquake"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Name (HI)</label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.nameHindi}
                      onChange={(e) => setFormData({ ...formData, nameHindi: e.target.value })}
                      className={`w-full px-5 py-4 ${isViewOnly ? 'bg-slate-50 text-slate-500 font-bold' : 'bg-white'} border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all text-sm font-black shadow-sm`}
                      placeholder="जैसे: भूकंप"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Compensation Framework</label>
                    {isViewOnly ? (
                      <div className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-500">
                        {COMPENSATION_CATEGORIES.find(c => c.value === formData.compensationCategory)?.label}
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={formData.compensationCategory}
                          onChange={(e) => setFormData({ ...formData, compensationCategory: e.target.value })}
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all text-sm font-black shadow-sm appearance-none"
                        >
                          {COMPENSATION_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                        <ArrowRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Resolution SLA (Hours)</label>
                    <div className="relative">
                      <input
                        type="number"
                        readOnly={isViewOnly}
                        value={formData.slaHours}
                        onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value) })}
                        className={`w-full px-5 py-4 ${isViewOnly ? 'bg-slate-50 text-slate-500 font-bold' : 'bg-white'} border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all text-sm font-black shadow-sm`}
                        placeholder="24"
                      />
                      <Clock size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Operational Description</label>
                  <textarea
                    readOnly={isViewOnly}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-5 py-4 ${isViewOnly ? 'bg-slate-50 text-slate-500' : 'bg-white'} border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none transition-all text-sm font-medium shadow-sm min-h-[100px]`}
                    placeholder="Provide context and standard operating guidelines..."
                  ></textarea>
                </div>
  
                <div className="space-y-4 pt-6 border-t-2 border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 uppercase tracking-tight">Required Documentation Matrix</label>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mandatory baseline for claim processing</p>
                      </div>
                    </div>
                    {!isViewOnly && (
                      <button type="button" onClick={addDocRow} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-brand-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-900/10">
                        <Plus size={14} /> New Requirement
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                          <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsibility</th>
                          <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Citizen</th>
                          <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Dept.</th>
                          {!isViewOnly && <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {formData.requiredDocuments.length === 0 ? (
                          <tr>
                            <td colSpan={isViewOnly ? 4 : 5} className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No specific documentation requirements defined</td>
                          </tr>
                        ) : (
                          formData.requiredDocuments.map((doc, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    readOnly={isViewOnly}
                                    placeholder="English Title"
                                    value={doc.name}
                                    onChange={(e) => updateDocField(idx, 'name', e.target.value)}
                                    className={`w-full text-xs font-bold ${isViewOnly ? 'bg-transparent border-none p-0' : 'bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 focus:bg-white transition-all outline-none'}`}
                                    required
                                  />
                                  <input
                                    type="text"
                                    readOnly={isViewOnly}
                                    placeholder="हिन्दी शीर्षक"
                                    value={doc.nameHindi}
                                    onChange={(e) => updateDocField(idx, 'nameHindi', e.target.value)}
                                    className={`w-full text-xs font-bold ${isViewOnly ? 'bg-transparent border-none p-0 opacity-60' : 'bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 focus:bg-white transition-all outline-none'}`}
                                    required
                                  />
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <select
                                  disabled={isViewOnly}
                                  value={doc.responsibleDepartment}
                                  onChange={(e) => updateDocField(idx, 'responsibleDepartment', e.target.value)}
                                  className={`text-[9px] font-black uppercase tracking-wider ${isViewOnly ? 'bg-transparent border-none p-0 appearance-none' : 'bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full'}`}
                                >
                                  <option value="individual">Applicant</option>
                                  <option value="revenue">Revenue</option>
                                  <option value="police">Police</option>
                                  <option value="health">Health</option>
                                  <option value="agriculture">Agriculture</option>
                                </select>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <input 
                                  type="checkbox" 
                                  disabled={isViewOnly}
                                  checked={doc.isUserMandatory} 
                                  onChange={(e) => updateDocField(idx, 'isUserMandatory', e.target.checked)} 
                                  className="w-4 h-4 accent-brand-600 cursor-pointer" 
                                />
                              </td>
                              <td className="px-5 py-4 text-center">
                                <input 
                                  type="checkbox" 
                                  disabled={isViewOnly}
                                  checked={doc.isDeptMandatory} 
                                  onChange={(e) => updateDocField(idx, 'isDeptMandatory', e.target.checked)} 
                                  className="w-4 h-4 accent-brand-600 cursor-pointer" 
                                />
                              </td>
                              {!isViewOnly && (
                                <td className="px-5 py-4 text-right">
                                  <button type="button" onClick={() => removeDocRow(idx)} className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!isViewOnly && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black shadow-2xl shadow-slate-900/20 hover:bg-brand-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 mt-8"
                  >
                    {loading ? <Loader2 className="animate-spin text-white" size={24} /> : <>{editingId ? "COMMIT MASTER UPDATES" : "REGISTER MASTER RECORD"} <CheckCircle size={20} /></>}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/20">
                     <PlusCircle size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Disaster Import</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configure types and documents at scale</p>
                  </div>
               </div>
               <button onClick={() => { setShowBulkModal(false); setBulkResults(null); }} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8">
              {bulkResults ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Created", count: bulkResults.created, icon: PlusCircle, color: "text-emerald-600" },
                      { label: "Updated", count: bulkResults.updated, icon: Activity, color: "text-blue-600" },
                      { label: "Documents", count: bulkResults.documents, icon: FileText, color: "text-purple-600" },
                    ].map((res, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                        <res.icon size={16} className={`mx-auto mb-2 ${res.color}`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{res.label}</p>
                        <p className="text-lg font-black text-slate-900">{res.count}</p>
                      </div>
                    ))}
                  </div>

                  {bulkResults.errors.length > 0 && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <AlertCircle size={14} />
                        <p className="text-[10px] font-black uppercase">Import Errors ({bulkResults.errors.length})</p>
                      </div>
                      <div className="max-h-[100px] overflow-y-auto text-[10px] font-bold text-rose-500 space-y-1">
                        {bulkResults.errors.map((err, i) => (
                          <p key={i}>Item {err.index + 1}: {err.message}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => { setShowBulkModal(false); setBulkResults(null); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Expected JSON Format</p>
                    <pre className="text-[10px] font-mono text-brand-700 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto max-h-[150px]">
{`[
  {
    "name": "Death (जनहानि)",
    "nameHindi": "मृत्यु (जनहानि)",
    "compensationCategory": "EX_GRATIA",
    "documents": [
      { "name": "Aadhar Card", "isUserMandatory": true },
      { "name": "Post Mortem Report", "isUserMandatory": true }
    ]
  }
]`}
                    </pre>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Paste JSON Data</label>
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      className="w-full h-40 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-600/5 focus:border-brand-600 focus:bg-white outline-none transition-all text-[10px] font-mono font-bold"
                      placeholder="[ { ... }, { ... } ]"
                    />
                  </div>

                  <button
                    onClick={handleBulkSubmit}
                    disabled={loading || !bulkInput.trim()}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-brand-600 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>IMPORT DISASTER DATA <CheckCircle size={18} /></>}
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

export default DisasterManagement;
