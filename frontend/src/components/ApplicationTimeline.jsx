import { format } from "date-fns";
import { 
  CheckCircle2, Forward, FileQuestion, Upload, 
  User, ShieldCheck, AlertCircle, FileText,
  Clock, ArrowRight, Activity, 
  MessageSquare, FileCheck, RotateCcw,
  FilePlus, Send
} from "lucide-react";

/**
 * Filtered Audit Timeline Component
 * Provides a compact, role-based representation of the application lifecycle.
 */

const actionConfig = {
  APPLICATION_SUBMITTED: {
    icon: <FileText size={12} />,
    color: "bg-blue-600",
    text: "text-blue-700"
  },
  APPLICATION_FORWARDED: {
    icon: <Forward size={12} />,
    color: "bg-indigo-600",
    text: "text-indigo-700"
  },
  APPLICATION_RESOLVED: {
    icon: <CheckCircle2 size={12} />,
    color: "bg-emerald-600",
    text: "text-emerald-700"
  },
  DOCUMENTS_REQUESTED: {
    icon: <FileQuestion size={12} />,
    color: "bg-amber-600",
    text: "text-amber-700"
  },
  DOCUMENT_UPLOADED: {
    icon: <Upload size={12} />,
    color: "bg-sky-600",
    text: "text-sky-700"
  },
  DOCUMENT_VERIFIED: {
    icon: <ShieldCheck size={12} />,
    color: "bg-emerald-600",
    text: "text-emerald-700"
  },
  REMARK_ADDED: {
    icon: <MessageSquare size={12} />,
    color: "bg-slate-600",
    text: "text-slate-700"
  },
  OFFICER_DOC_UPLOADED: {
    icon: <FileCheck size={12} />,
    color: "bg-violet-600",
    text: "text-violet-700"
  },
  COLLECTOR_OVERRIDE: {
    icon: <ShieldCheck size={12} />,
    color: "bg-purple-600",
    text: "text-purple-700"
  },
  DEPT_VERIFY: {
    icon: <ShieldCheck size={12} />,
    color: "bg-emerald-600",
    text: "text-emerald-700"
  },
  DEPT_REJECT: {
    icon: <AlertCircle size={12} />,
    color: "bg-rose-600",
    text: "text-rose-700"
  },
  DEPT_UPLOAD: {
    icon: <FilePlus size={12} />,
    color: "bg-indigo-600",
    text: "text-indigo-700"
  },
  DEPT_REPLACE: {
    icon: <RotateCcw size={12} />,
    color: "bg-amber-600",
    text: "text-amber-700"
  },
  ADMIN_OVERRIDE: {
    icon: <ShieldCheck size={12} />,
    color: "bg-brand-600",
    text: "text-brand-700"
  },
  ADMIN_RETURN_TO_USER: {
    icon: <ArrowRight size={12} />,
    color: "bg-orange-600",
    text: "text-orange-700"
  },
  STATUS_UPDATED: {
    icon: <Activity size={12} />,
    color: "bg-slate-600",
    text: "text-slate-700"
  },
  APPLICATION_ROUTED: {
    icon: <Send size={12} />,
    color: "bg-indigo-400",
    text: "text-indigo-600"
  },
};

const TimelineItem = ({ log, isLast, role }) => {
  const config = actionConfig[log.action] || {
    icon: <Activity size={12} />,
    color: "bg-slate-400",
    text: "text-slate-600"
  };

  const isAdmin = role === "admin";
  const isDept = role === "department";
  const isPublic = !isAdmin && !isDept;

  const showRemarks = isAdmin || (isDept && log.performedByRole === "department") || (isDept && log.action.startsWith("DEPT_"));
  const showDetails = isAdmin || (isDept && (log.action === "APPLICATION_FORWARDED" || log.action === "APPLICATION_ROUTED" || log.action === "ADMIN_OVERRIDE"));

  if (isPublic && (log.action === "REMARK_ADDED" || log.action === "OFFICER_DOC_UPLOADED")) {
    return null;
  }
  
  return (
    <div className={`p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${config.color.replace('bg-', 'bg-')}/10 border-${config.color.replace('bg-', '')}/20 ${config.text}`}>
            {config.icon}
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">
              {log.action.replace(/_/g, " ")}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-medium text-slate-500">
                Processed by: <span className="text-slate-700 font-bold">{log.performedBy?.name || "System"}</span>
              </span>
              {log.performedByRole === "admin" && (
                <span className="px-1.5 py-0.5 bg-brand-50 text-brand-600 text-[8px] font-black uppercase rounded border border-brand-100">Official</span>
              )}
            </div>
            
            {showRemarks && log.remarks && (
              <div className="mt-2 text-[10px] text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-sm italic">
                "{log.remarks}"
              </div>
            )}

            {showDetails && log.details && (log.details.from || log.details.to) && (
              <div className="flex items-center gap-2 mt-2 text-[9px] font-bold text-slate-400">
                {log.details.from && <span>{log.details.from}</span>}
                {log.details.from && log.details.to && <ArrowRight size={10} />}
                {log.details.to && <span className="text-brand-600">{log.details.to}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold text-slate-700">{format(new Date(log.timestamp), "hh:mm a")}</div>
          <div className="text-[9px] font-medium text-slate-400 uppercase">{format(new Date(log.timestamp), "dd MMM yyyy")}</div>
        </div>
      </div>
    </div>
  );
};

const ApplicationTimeline = ({ logs, role }) => {
  const sortedLogs = [...(logs || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (!sortedLogs || sortedLogs.length === 0) {
    return (
      <div className="py-8 text-center bg-slate-50 border border-slate-200 rounded">
        <Activity className="text-slate-300 mx-auto mb-2" size={24} />
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Activity Log Empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center block">Action History Ledger</span>
      </div>
      <div className="flex flex-col">
        {sortedLogs.map((log, index) => (
          <TimelineItem 
            key={log._id || index} 
            log={log} 
            isLast={index === sortedLogs.length - 1} 
            role={role}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
