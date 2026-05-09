import { Link, useNavigate } from 'react-router-dom';
import { Shield, FileText, Search, ArrowRight, CheckCircle, Clock, MapPin, PhoneCall } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight uppercase">आपदा प्रबंधन</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Features</a>
            <a href="#impact" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">Impact</a>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
            >
              Portal Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full border border-brand-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.2em]">Official Disaster Relief Portal</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Rapid Response. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Transparent Relief.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            A digital gateway for citizens to apply for disaster compensation and track their approval process with complete transparency and zero delays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <button 
              onClick={() => navigate('/apply')}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-2xl shadow-brand-600/30 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
            >
              Apply for Relief <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/track')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-slate-200/20 hover:border-brand-300 hover:text-brand-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              Track Application <Search size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FileText className="text-brand-600" size={32} />,
              title: "Digital Submission",
              desc: "Skip the paperwork. Submit your disaster claim with a fully digital 10-step guided wizard."
            },
            {
              icon: <Clock className="text-amber-500" size={32} />,
              title: "Real-time Tracking",
              desc: "Get instant updates on your application status as it moves through various department levels."
            },
            {
              icon: <CheckCircle className="text-emerald-500" size={32} />,
              title: "Direct Benefit",
              desc: "Validated claims are approved by the District Collector and funds are disbursed directly."
            }
          ].map((f, i) => (
            <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 group">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Info */}
      <section id="impact" className="py-20 bg-slate-900 rounded-[4rem] mx-4 my-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8">
              Empowering Citizens, <br />
              <span className="opacity-50 text-brand-600">Ensuring Accountability.</span>
            </h2>
            <div className="space-y-6">
              {[
                { label: "Verified Locations", value: "Districts, Blocks & Gram Panchayats are pre-mapped." },
                { label: "Role-based Access", value: "Secure workflows from Field Staff to Collector." },
                { label: "Evidence Library", value: "Upload photos and documents directly on the portal." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center mt-1">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight">{item.label}</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-brand-600/20 to-indigo-600/20 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-white hover:translate-x-2 transition-transform cursor-pointer group">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                    <MapPin size={24} />
                  </div>
                  <span className="font-bold">Find your nearest Relief Center</span>
                </div>
                <div className="flex items-center gap-4 text-white hover:translate-x-2 transition-transform cursor-pointer group">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                    <PhoneCall size={24} />
                  </div>
                  <span className="font-bold">24/7 Helpline: 1800-XXX-XXXX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <Shield className="text-brand-600" size={24} />
            <span className="font-black text-sm tracking-widest uppercase">Apda Management System</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Government Relief Department. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
