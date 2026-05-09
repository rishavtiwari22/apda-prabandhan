import { useState, useEffect } from "react";
import { applicationApi } from "../services/api.service";
import ApplicationList from "../components/ApplicationList";
import { Inbox, Loader2, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Tasks = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // For departments, "Tasks" are typically SUBMITTED or DOCUMENTS_PENDING 
      // where they are in the current ownership chain.
      // Based on our backend, getAll returns what the user is authorized to see.
      const res = await applicationApi.getAll({ status: 'SUBMITTED' });
      const pendingDocsRes = await applicationApi.getAll({ status: 'DOCUMENTS_PENDING' });
      
      const combined = [...res.data.data, ...pendingDocsRes.data.data];
      // Deduplicate by ID
      const unique = Array.from(new Map(combined.map(item => [item._id, item])).values());
      
      setApplications(unique);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Task Inbox</h1>
            <div className="px-2.5 py-1 bg-brand-100 text-brand-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Action Required
            </div>
          </div>
          <p className="text-slate-500 font-medium">Manage and process applications assigned to your department.</p>
        </div>

        <div className="flex gap-4">
           <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                 <Clock size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wait Time</p>
                 <p className="text-sm font-black text-slate-700">~2.4 Days</p>
              </div>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-premium border border-slate-100">
          <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
          <p className="text-slate-400 font-bold text-sm">Synchronizing tasks...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] shadow-premium border border-slate-100 text-center">
           <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
              <Inbox size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-900 mb-2">Zero Pending Tasks</h3>
           <p className="text-slate-400 font-medium max-w-xs mx-auto">All applications in your queue have been processed. Great job!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 mb-2">
             <AlertCircle className="text-indigo-600" size={18} />
             <p className="text-xs font-bold text-indigo-800">Showing all cases that require validation or document verification.</p>
          </div>
          <ApplicationList 
            applications={applications} 
            title={`Actionable Items (${applications.length})`} 
          />
        </div>
      )}
    </div>
  );
};

export default Tasks;
