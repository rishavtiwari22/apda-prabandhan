import React, { useState, useEffect } from "react";
import { 
  Plus, ChevronRight, MapPin, Building, Home, 
  PlusCircle, Loader2, AlertCircle, Edit2, Trash2, 
  Search, ArrowLeft, MoreVertical, Globe, Layers,
  ChevronDown, CheckCircle, Activity, Landmark, X
} from "lucide-react";
import API from "../../services/api";

const LEVELS = [
  { id: "district", label: "District (जिला)", icon: <Globe size={18} />, endpoint: "districts" },
  { id: "tehsil", label: "Tehsil (तहसील)", icon: <Landmark size={18} />, endpoint: "tehsils", parent: "district" },
  { id: "block", label: "Block (विकासखंड)", icon: <Building size={18} />, endpoint: "blocks", parent: "district" },
  { id: "panchayat", label: "Panchayat (पंचायत)", icon: <Layers size={18} />, endpoint: "panchayats", parent: "block" },
  { id: "village", label: "Village (ग्राम)", icon: <Home size={18} />, endpoint: "villages", parent: "panchayat" },
];

const GeographyManagement = () => {
  const [data, setData] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(LEVELS[0]);
  const [selections, setSelections] = useState({
    district: null,
    tehsil: null,
    block: null,
    panchayat: null,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResults, setBulkResults] = useState(null);
  const [modalConfig, setModalConfig] = useState({ mode: "add", item: null, name: "" });

  useEffect(() => {
    fetchData();
  }, [currentLevel, selections]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/master/${currentLevel.endpoint}`;
      if (currentLevel.parent) {
        const parentId = selections[currentLevel.parent]?._id;
        if (!parentId) {
          setData([]);
          setLoading(false);
          return;
        }
        url += `/${parentId}`;
      }
      const res = await API.get(url);
      setData(res.data.data || []);
    } catch (err) {
      setError(`Failed to fetch ${currentLevel.id}s`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrillDown = (item) => {
    const nextLevelIndex = LEVELS.indexOf(currentLevel) + 1;
    if (nextLevelIndex < LEVELS.length) {
      setSelections(prev => ({ ...prev, [currentLevel.id]: item }));
      setCurrentLevel(LEVELS[nextLevelIndex]);
      setSearchTerm("");
    }
  };

  const handleBreadcrumbClick = (index) => {
    setCurrentLevel(LEVELS[index]);
    // Clear selections for subsequent levels
    const newSelections = { ...selections };
    for (let i = index; i < LEVELS.length; i++) {
      newSelections[LEVELS[i].id] = null;
    }
    setSelections(newSelections);
    setSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: modalConfig.name };
      if (currentLevel.parent) {
        payload[currentLevel.parent] = selections[currentLevel.parent]._id;
      }

      if (modalConfig.mode === "add") {
        await API.post(`/master/${currentLevel.endpoint}`, payload);
      } else {
        await API.put(`/master/${currentLevel.endpoint}/${modalConfig.item._id}`, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(`Failed to ${modalConfig.mode} ${currentLevel.id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    try {
      setLoading(true);
      const jsonData = JSON.parse(bulkInput);
      if (typeof jsonData !== "object" || jsonData === null) throw new Error("Invalid JSON: Must be an object or array");
      
      const res = await API.post("/master/bulk-geography", { data: jsonData });
      setBulkResults(res.data.results);
      setBulkInput("");
      fetchData();
    } catch (err) {
      alert(err.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${currentLevel.id}?`)) return;
    try {
      await API.delete(`/master/${currentLevel.endpoint}/${id}`);
      fetchData();
    } catch (err) {
      setError("Deletion failed");
    }
  };

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
              <Globe size={22} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Geography Master</h1>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest ml-1 opacity-70">Administrative Hierarchy Management</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-600" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${currentLevel.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-600/5 focus:border-brand-600 outline-none w-64 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowBulkModal(true)}
               className="px-5 py-3 bg-brand-50 text-brand-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-100 transition-all flex items-center gap-2 border border-brand-100"
             >
               <PlusCircle size={16} /> Bulk Upload
             </button>
             <button 
               onClick={() => {
                 setModalConfig({ mode: "add", item: null, name: "" });
                 setShowModal(true);
               }}
               className="px-5 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-600 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
             >
               <Plus size={16} /> Add {currentLevel.label.split(" ")[0]}
             </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center flex-wrap gap-2 mb-8 bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => handleBreadcrumbClick(0)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentLevel.id === 'district' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-brand-600'}`}
        >
          Chhattisgarh
        </button>
        {LEVELS.map((level, idx) => {
          if (!selections[level.id] && level.id !== currentLevel.id) return null;
          return (
            <React.Fragment key={level.id}>
              <ChevronRight size={14} className="text-slate-300" />
              <button 
                onClick={() => handleBreadcrumbClick(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentLevel.id === level.id ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {selections[level.id] ? `${level.label.split(' (')[0]}: ${selections[level.id].name}` : level.label.split(' (')[0]}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">S.No.</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentLevel.label} Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Creation Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action Cluster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying Hierarchy...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Layers size={48} className="text-slate-300" />
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Records Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr 
                    key={item._id} 
                    className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                    onClick={() => handleDrillDown(item)}
                  >
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-black text-slate-300 group-hover:text-brand-600 transition-colors">#{idx + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                          {currentLevel.icon}
                        </div>
                        <span className="text-sm font-black text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => { setModalConfig({ mode: "edit", name: item.name, item }); setShowModal(true); }}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                        {LEVELS.indexOf(currentLevel) < LEVELS.length - 1 && (
                          <button className="w-10 h-10 rounded-xl bg-brand-600 text-white hover:bg-slate-900 transition-all flex items-center justify-center shadow-lg shadow-brand-600/20">
                            <ChevronRight size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">
                  {modalConfig.mode === "add" ? "Register" : "Update"} {currentLevel.id}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Master Record</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-2xl bg-white text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center border border-slate-200 shadow-sm">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Name (Hindi/English)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={modalConfig.name}
                  onChange={(e) => setModalConfig({ ...modalConfig, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-600/5 focus:border-brand-600 focus:bg-white outline-none transition-all text-sm font-bold"
                  placeholder={`Enter ${currentLevel.id} name...`}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:bg-brand-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>{modalConfig.mode === "add" ? "Commit Entry" : "Save Changes"} <CheckCircle size={18} /></>}
              </button>
            </form>
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
                     <h2 className="text-xl font-black text-slate-900 tracking-tight">Bulk Geography Import</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add thousands of records in seconds</p>
                  </div>
               </div>
               <button onClick={() => { setShowBulkModal(false); setBulkResults(null); }} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X size={20} />
               </button>
            </div>

            <div className="p-8">
              {bulkResults ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { label: "Districts", count: bulkResults.districts, icon: Globe, color: "text-blue-600" },
                      { label: "Tehsils", count: bulkResults.tehsils, icon: Landmark, color: "text-amber-600" },
                      { label: "Blocks", count: bulkResults.blocks, icon: Building, color: "text-emerald-600" },
                      { label: "Panchayats", count: bulkResults.panchayats, icon: Layers, color: "text-purple-600" },
                      { label: "Villages", count: bulkResults.villages, icon: Home, color: "text-rose-600" },
                    ].map((res, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl text-center border border-slate-100">
                        <res.icon size={16} className={`mx-auto mb-2 ${res.color}`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{res.label}</p>
                        <p className="text-lg font-black text-slate-900">{res.count}</p>
                      </div>
                    ))}
                  </div>

                  {bulkResults.dbCounts && (
                    <div className="bg-slate-900 text-white rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Live Stats</p>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-black uppercase">Verified</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { label: "Districts", val: bulkResults.dbCounts.districts },
                          { label: "Tehsils", val: bulkResults.dbCounts.tehsils },
                          { label: "Blocks", val: bulkResults.dbCounts.blocks },
                          { label: "Panchayats", val: bulkResults.dbCounts.panchayats },
                          { label: "Villages", val: bulkResults.dbCounts.villages },
                        ].map((stat, i) => (
                          <div key={i}>
                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{stat.label}</p>
                            <p className="text-sm font-black tracking-tight">{stat.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {bulkResults.errors.length > 0 && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <AlertCircle size={14} />
                        <p className="text-[10px] font-black uppercase">Import Errors ({bulkResults.errors.length})</p>
                      </div>
                      <div className="max-h-[100px] overflow-y-auto text-[10px] font-bold text-rose-500 space-y-1">
                        {bulkResults.errors.map((err, i) => (
                          <p key={i}>Row {err.index + 1}: {err.message}</p>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Expected JSON Format (Array of Objects)</p>
                    <pre className="text-[10px] font-mono text-brand-700 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto">
{`{
  "state": "Chhattisgarh",
  "district": "Jashpur",
  "blocks": [
    {
      "blockName": "Bagicha",
      "tehsil": "Bagicha",
      "gramPanchayats": [
        {
          "gpName": "Bagicha",
          "villages": [{ "villageName": "Sulesa" }]
        }
      ]
    }
  ]
}`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Paste JSON Data</label>
                    <textarea 
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Paste your JSON array here..."
                      className="w-full h-48 bg-slate-50 border border-slate-200 rounded-3xl p-5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleBulkSubmit}
                    disabled={loading || !bulkInput.trim()}
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>IMPORT GEOGRAPHY DATA <CheckCircle size={18} /></>}
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

export default GeographyManagement;
