import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-rose-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-premium animate-pulse">
          <ShieldAlert className="text-rose-600 w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          You do not have the required permissions to view this intelligence. 
          Please contact the system administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <button 
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} /> Dashboard
          </button>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-200">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
             Jashpur District Security Layer v1.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
