import { useState, useEffect } from "react";
import { Plus, ChevronRight, MapPin, Building, Home, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import API from "../../services/api";

const GeographyManagement = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Selection states for hierarchy
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [panchayats, setPanchayats] = useState([]);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await API.get("/master/districts");
      setDistricts(res.data.data);
    } catch (err) {
      setError("Failed to fetch districts");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async (districtId) => {
    setLoading(true);
    try {
      const res = await API.get(`/master/blocks/${districtId}`);
      setBlocks(res.data.data);
      setSelectedBlock(null);
      setPanchayats([]);
    } catch (err) {
      setError("Failed to fetch blocks");
    } finally {
      setLoading(false);
    }
  };

  const fetchPanchayats = async (blockId) => {
    setLoading(true);
    try {
      const res = await API.get(`/master/panchayats/${blockId}`);
      setPanchayats(res.data.data);
    } catch (err) {
      setError("Failed to fetch panchayats");
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
    fetchBlocks(district._id);
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    fetchPanchayats(block._id);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-6 bg-brand-600 rounded-full"></div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">भौगोलिक पदानुक्रम (Geographic Hierarchy)</h1>
        </div>
        <p className="text-slate-500 text-sm font-medium">Manage state-wide Districts, Blocks, and Panchayats.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Districts Column */}
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col h-[550px] lg:h-[650px] overflow-hidden relative group/col transition-all hover:border-brand-100">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2.5 text-sm uppercase tracking-wider">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <MapPin size={16} />
              </div> Districts
            </h3>
            <button className="w-8 h-8 rounded-xl bg-white text-brand-600 border border-brand-100 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
              <PlusCircle size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {districts.map((d) => (
              <button
                key={d._id}
                onClick={() => handleDistrictClick(d)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  selectedDistrict?._id === d._id
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20 translate-x-1"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {d.name}
                <ChevronRight size={16} className={selectedDistrict?._id === d._id ? "opacity-70 scale-110" : "opacity-0"} />
              </button>
            ))}
          </div>
        </div>

        {/* Blocks Column */}
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col h-[550px] lg:h-[650px] overflow-hidden relative group/col transition-all hover:border-brand-100">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2.5 text-sm uppercase tracking-wider">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Building size={16} />
              </div> Blocks
            </h3>
            {selectedDistrict && (
              <button className="w-8 h-8 rounded-xl bg-white text-brand-600 border border-brand-100 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                <PlusCircle size={18} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!selectedDistrict ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  <ChevronRight size={24} className="text-slate-200" />
                </div>
                <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-60">Select District</p>
              </div>
            ) : blocks.length === 0 && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                No blocks found in this district
              </div>
            ) : (
              blocks.map((b) => (
                <button
                  key={b._id}
                  onClick={() => handleBlockClick(b)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    selectedBlock?._id === b._id
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20 translate-x-1"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {b.name}
                  <ChevronRight size={16} className={selectedBlock?._id === b._id ? "opacity-70 scale-110" : "opacity-0"} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Panchayats Column */}
        <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 flex flex-col h-[550px] lg:h-[650px] overflow-hidden relative group/col transition-all hover:border-brand-100">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2.5 text-sm uppercase tracking-wider">
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                <Home size={16} />
              </div> Panchayats
            </h3>
            {selectedBlock && (
              <button className="w-8 h-8 rounded-xl bg-white text-brand-600 border border-brand-100 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                <PlusCircle size={18} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!selectedBlock ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                   <ChevronRight size={24} className="text-slate-200" />
                </div>
                <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-60">Select Block</p>
              </div>
            ) : panchayats.length === 0 && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center italic text-xs">
                No panchayats found in this block
              </div>
            ) : (
              panchayats.map((p) => (
                <div
                  key={p._id}
                  className="group/item w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold text-slate-600 bg-white hover:bg-brand-50 hover:text-brand-700 transition-all border border-slate-50 hover:border-brand-200"
                >
                  {p.name}
                  <div className="w-2 h-2 rounded-full bg-brand-400 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="fixed bottom-8 sm:bottom-12 right-8 sm:right-12 bg-white/80 backdrop-blur-md shadow-2xl border border-brand-100 px-6 py-3 rounded-full flex items-center gap-3 text-[11px] font-black text-brand-600 uppercase tracking-widest animate-in slide-in-from-bottom-10 h-12">
          <div className="w-4 h-4 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
          Synchronizing Hierarchy...
        </div>
      )}
    </div>
  );
};

export default GeographyManagement;
