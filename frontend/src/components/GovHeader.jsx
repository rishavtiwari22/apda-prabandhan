import React from 'react';
import { Shield, Info, Monitor, Type } from 'lucide-react';

const GovHeader = () => {
  return (
    <div className="w-full flex flex-col">

      {/* Main Header - Institutional Branding */}
      <div className="bg-white px-8 py-5 flex justify-between items-center border-b-4 border-brand-600 shadow-sm relative z-10">
        <div className="flex items-center gap-5">
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-16" />
           <div className="h-12 w-[1.5px] bg-slate-200 hidden sm:block"></div>
           <div>
             <h1 className="text-2xl font-black text-[#003366] tracking-tighter leading-none flex flex-col">
               <span>JASHPUR DISTRICT PARIYOJANA</span>
               <span className="text-sm font-bold text-slate-500 tracking-normal mt-1 border-t border-slate-100 pt-1">जशपुर जिला परियोजना — DISASTER RELIEF PORTAL</span>
             </h1>
           </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Helpline</p>
              <p className="text-lg font-black text-gov-red tracking-tight">1070 | 1077</p>
           </div>
           <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100 shadow-inner">
              <Shield size={24} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default GovHeader;
