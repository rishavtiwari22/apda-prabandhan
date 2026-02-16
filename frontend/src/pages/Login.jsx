import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import API from "../services/api";
import useAuthStore from "../store/authStore";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleIdentifierChange = (e) => {
    // Strip spaces if user pastes or types with spaces (common for Aadhaar)
    setIdentifier(e.target.value.replace(/\s/g, ""));
  };

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { identifier, password });
      
      if (res.data?.success) {
        const { user, accessToken } = res.data.data;
        setAuth(user, accessToken);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100 relative group">
        {/* Subtle Decorative Gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-100 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
        
        <div className="p-8 sm:p-10 relative z-10">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <Shield className="text-white w-10 h-10 rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2 tracking-tight">
            स्वागत है
          </h2>
          <p className="text-center text-slate-500 text-sm mb-10 font-medium">
            Citizen Login • आपदा प्रबंधन पोर्टल
          </p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-red-500 text-white rounded-full p-0.5 mr-3 mt-0.5 flex-shrink-0">
                <CheckCircle size={12} className="rotate-180" />
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
                Mobile or Aadhaar
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all sm:text-sm shadow-sm"
                  placeholder="9876543210 or Aadhaar"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all sm:text-sm shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:transform-none transition-all duration-200 ease-out"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <>
                  SIGN IN <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New here?{" "}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create public account
            </Link>
          </p>
        </div>
        
        <div className="px-8 py-5 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 leading-normal">
            For department login issues, please contact the <br /> 
            Collector's office IT helpdesk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
