import { CheckCircle2, Clock, FileText, ShieldCheck, Forward, BadgeCheck, AlertCircle } from "lucide-react";

const ApplicationMilestones = ({ application }) => {
  const { status, requiredDocuments = [], uploadedDocuments = [] } = application;

  // Calculate document progress (only mandatory docs)
  const mandatoryDocs = requiredDocuments.filter(d => d.isMandatory);
  const totalMandatory = mandatoryDocs.length;
  
  const uploadedMandatoryIds = new Set(
    uploadedDocuments
      .map(ud => (ud.documentType?._id || ud.documentType))
      .filter(id => !!id)
      .map(id => id.toString())
  );
  
  const uploadedMandatoryCount = mandatoryDocs.filter(md => {
    const docId = (md.documentType?._id || md.documentType);
    return docId && uploadedMandatoryIds.has(docId.toString());
  }).length;

  const isDocsComplete = totalMandatory > 0 && uploadedMandatoryCount >= totalMandatory;

  const milestones = [
    {
      id: "submission",
      label: "Registration",
      hindi: "पंजीकरण",
      icon: <FileText size={16} />,
      isComplete: true,
      isActive: status === "submitted"
    },
    {
      id: "investigation",
      label: "Dept Review",
      hindi: "विभागीय समीक्षा",
      icon: <ShieldCheck size={16} />,
      isComplete: ["ready_for_admin", "approved", "resolved", "rejected"].includes(status),
      isActive: status === "under_department_review" || status === "rejected_by_department",
      isRejected: status === "rejected_by_department",
      subtext: status === "rejected_by_department" ? "Correction Required" : (totalMandatory > 0 ? `${uploadedMandatoryCount}/${totalMandatory} Docs` : null)
    },
    {
      id: "authorization",
      label: "Admin Review",
      hindi: "प्रशासनिक समीक्षा",
      icon: <Forward size={16} />,
      isComplete: ["approved", "resolved", "rejected"].includes(status),
      isActive: status === "ready_for_admin" || status === "approved"
    },
    {
      id: "resolution",
      label: "Final Outcome",
      hindi: "अंतिम परिणाम",
      icon: <CheckCircle2 size={16} />,
      isComplete: status === "resolved",
      isRejected: status === "rejected",
      isActive: status === "resolved" || status === "rejected"
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm mb-6 overflow-hidden">
      <div className="flex bg-slate-50 border-b border-slate-200">
        {milestones.map((step, index) => {
          const isFinished = step.isComplete && !step.isRejected;
          const isRej = step.isRejected;
          const isActive = step.isActive;
          
          return (
            <div 
              key={step.id} 
              className={`flex-1 flex items-center justify-center gap-2 py-4 border-r border-slate-200 last:border-r-0 relative transition-colors ${isActive ? 'bg-white' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                isFinished ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 
                isRej ? 'bg-rose-50 border-rose-500 text-rose-600' :
                isActive ? 'bg-brand-50 border-brand-500 text-brand-600' : 
                'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                {isFinished ? <CheckCircle2 size={16} /> : isRej ? <AlertCircle size={16} /> : step.icon}
              </div>
              <div className="hidden sm:block text-left">
                <span className={`block text-[10px] font-bold uppercase tracking-wider leading-none ${isActive ? 'text-brand-700' : isFinished ? 'text-emerald-700' : isRej ? 'text-rose-700' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                <span className="block text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                  {step.hindi}
                </span>
              </div>
              {(isActive || isFinished || isRej) && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${isFinished ? 'bg-emerald-500' : isRej ? 'bg-rose-500' : 'bg-brand-500'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationMilestones;
