import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  FileText, ArrowRight, User,
  MapPin, Clock, ChevronRight, Activity
} from "lucide-react";

const getStatusStyles = (status) => {
  switch (status) {
    case "submitted": return "bg-blue-50 text-blue-700 border-blue-100";
    case "under_department_review": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "rejected_by_department": return "bg-rose-50 text-rose-700 border-rose-100";
    case "ready_for_admin": return "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold";
    case "approved": return "bg-brand-50 text-brand-700 border-brand-100";
    case "resolved": return "bg-emerald-600 text-white border-transparent";
    case "rejected": return "bg-rose-600 text-white border-transparent";
    default: return "bg-slate-50 text-slate-700 border-slate-100";
  }
};

const ApplicationList = ({ applications = [], title = "Application Records", onLoadMore }) => {
  const navigate = useNavigate();

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden min-h-[400px] flex flex-col justify-center items-center p-12 text-center">
         <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-200 relative group">
            <div className="absolute inset-0 bg-brand-600/5 rounded-[2.5rem] scale-0 group-hover:scale-110 transition-transform duration-500"></div>
            <FileText className="text-slate-300 w-12 h-12 relative z-10" />
         </div>
         <h5 className="text-xl font-black text-slate-800 mb-2">No Records Available</h5>
         <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium mb-8">This queue is currently empty. Cases will appear here as they are submitted or forwarded to you.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden">
       <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-brand-600 rounded-full"></div>
            <h4 className="font-bold text-slate-900 tracking-tight">{title}</h4>
          </div>
       </div>

       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-slate-50/50">
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Application Details</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Disaster Incident</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Applicant</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                   <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                   <tr 
                     key={app._id} 
                     className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                     onClick={() => navigate(`/applications/${app._id}`)}
                   >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shadow-sm group-hover:scale-110 transition-transform">
                               <FileText size={18} />
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-900 leading-none mb-1">{app.applicationNumber}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Clock size={10} /> {format(new Date(app.createdAt), "dd MMM, yyyy")}
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 capitalize">
                               <User size={12} className="text-slate-300" /> {app.applicantInfo?.name}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 italic">
                               <MapPin size={10} className="text-slate-300" /> {app.location?.district?.name || "Multiple"}
                            </p>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                               <Activity size={10} className="text-brand-600 shrink-0" />
                               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate">
                                  {app.disasterEventId?.eventNumber || "UNLINKED"}
                               </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                               {app.disasterType?.name || "Incident"}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm ${getStatusStyles(app.status)}`}>
                            {app.status.replace(/_/g, " ")}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/applications/${app._id}`);
                           }}
                           className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-white transition-all shadow-sm"
                         >
                            <ChevronRight size={16} />
                         </button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
       
       {onLoadMore && (
         <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex justify-center">
           <button
             onClick={onLoadMore}
             className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline transition-all flex items-center gap-2"
           >
             Load More Records <ArrowRight size={12} />
           </button>
         </div>
       )}
    </div>
  );
};

export default ApplicationList;
