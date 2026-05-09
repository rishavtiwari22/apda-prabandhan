import { User as UserIcon, Phone, CreditCard, ShieldCheck, MapPin, Building2, Flame, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import useAuthStore from "../store/authStore";
import { ROLES } from "../constants/roles";

const Profile = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const InfoCard = ({ icon: Icon, label, value, subtext }) => (
    <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 p-6 rounded-[2.5rem] flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-brand-600/5 group">
      <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900 leading-tight">{value || "Not Assigned"}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-brand-600/20 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        <div className="absolute -bottom-10 left-10 flex items-end gap-6">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-brand-600">
              <UserIcon size={56} />
            </div>
          </div>
          <div className="pb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 bg-brand-100 text-brand-700 text-[10px] font-black uppercase tracking-widest rounded-full">{user.role}</span>
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info Section */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-brand-600 rounded-full"></div>
            Personal Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <InfoCard icon={Phone} label="Mobile Number" value={user.mobile} subtext="Primary contact method" />
            <InfoCard icon={CreditCard} label="Aadhaar ID" value={user.aadhaar ? `XXXX-XXXX-${user.aadhaar.slice(-4)}` : "Not Provided"} subtext="Identity verification" />
            <InfoCard icon={ShieldCheck} label="Account Status" value={user.isActive ? "Active" : "Inactive"} subtext={user.isActive ? "Full access granted" : "Access restricted"} />
          </div>
        </div>

        {/* Professional / Regional Section */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
            Jurisdiction & Services
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <InfoCard 
              icon={MapPin} 
              label={user.role === ROLES.PUBLIC ? "Residence / Home" : "Assigned Region"} 
              value={user.assignedDistrict 
                ? `${user.assignedDistrict.name || user.assignedDistrict} / ${user.assignedBlock?.name || (user.assignedBlock ? user.assignedBlock : "All Blocks")}` 
                : "Global / Not Assigned"
              } 
              subtext={user.role === ROLES.PUBLIC ? "Your primary location for relief" : "Geographic area of operations"}
            />
            {user.role === ROLES.DEPARTMENT && (
              <>
                <InfoCard icon={Building2} label="Department" value={user.departmentType?.toUpperCase()} subtext="Official departmental role" />
                <div className="bg-gradient-to-br from-indigo-50 to-brand-50 border border-brand-100 p-6 rounded-[2.5rem] space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="text-brand-600" size={18} />
                    <p className="text-[10px] font-black text-brand-700 uppercase tracking-widest">Authorized Disasters</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.authorizedDisasterTypes?.length > 0 ? (
                      user.authorizedDisasterTypes.map((dt, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white border border-brand-100 text-brand-800 text-[10px] font-bold rounded-xl shadow-sm">
                          {dt.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No specific disaster types assigned</span>
                    )}
                  </div>
                </div>
              </>
            )}
            {user.role === ROLES.PUBLIC && (
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 leading-tight">Verified Citizen</p>
                  <p className="text-xs text-emerald-700 mt-0.5">You are eligible to apply for relief and track applications.</p>
                </div>
              </div>
            )}
            {user.role === ROLES.ADMIN && (
              <div className="bg-brand-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-600/20">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck size={28} />
                  <p className="text-sm font-black uppercase tracking-widest">Super Admin Power</p>
                </div>
                <p className="text-sm text-brand-50/80 leading-relaxed font-medium">You have full control over the disaster management system, including role assignments and master data management.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
