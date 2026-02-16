import { Shield } from "lucide-react";

const RoleManagement = () => {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-brand-100 rounded-[1.5rem] flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
           <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">उपयोगकर्ता प्रबंधन (User Management)</h1>
          <p className="text-slate-500 text-sm font-medium italic opacity-70">Feature expanding in Phase 2/3...</p>
        </div>
      </div>
      
      <div className="mt-12 bg-white rounded-[2.5rem] shadow-premium border border-slate-100 p-12 text-center max-w-2xl mx-auto border-dashed">
         <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Shield className="text-slate-200 w-10 h-10" />
         </div>
         <h3 className="text-lg font-bold text-slate-800 mb-3">Departmental Access Control</h3>
         <p className="text-slate-500 text-sm leading-relaxed mb-0 font-medium">
           Coming soon: This module will allow the <span className="text-brand-600 font-bold uppercase tracking-widest text-[10px]">District Collector</span> 
           to create and manage specialized departmental accounts for Thana In-charges, Patwaris, and Health Officers.
         </p>
      </div>
    </div>
  );
};

export default RoleManagement;
