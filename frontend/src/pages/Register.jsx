import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Phone, CreditCard, Mail, Lock, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import API from "../services/api";
import useAuthStore from "../store/authStore";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    aadhaar: "",
    email: "",
    password: "",
  });
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e) => {
    let value = e.target.value;
    // Strip spaces for mobile and aadhaar
    if (e.target.name === "mobile" || e.target.name === "aadhaar") {
      value = value.replace(/\s/g, "");
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/send-otp", { 
        mobile: formData.mobile, 
        type: "register" 
      });
      
      if (res.data?.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/register", { ...formData, otp });
      
      if (res.data?.success) {
        const { user, accessToken } = res.data.data;
        if (accessToken) {
          setAuth(user, accessToken);
          navigate("/");
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Incorrect OTP?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 sm:py-12">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-premium overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Info (Hidden on very small screens or reordered) */}
        <div className="md:w-5/12 bg-brand-600 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
              <Shield className="text-white w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold mb-6 tracking-tight">सार्वजनिक पंजीकरण</h2>
            <p className="text-brand-100 text-sm leading-relaxed mb-10 opacity-90">
              आपदा सहायता प्राप्त करने के लिए अपना खाता बनाएं। यह पोर्टल आपदा राहत के लिए आवेदन करने में आपकी सहायता करेगा।
            </p>
            
            <ul className="space-y-5">
              {[
                "आपदा राहत आवेदन",
                "दस्तावेज़ स्थिति की जाँच",
                "त्वरित सूचनाएं",
                "पारदर्शी प्रक्रिया"
              ].map((item, i) => (
                <li key={i} className="flex items-center text-sm font-medium group">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:bg-white/30 transition-all">
                    <CheckCircle size={14} className="text-brand-200" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
            <p className="text-xs text-brand-200 font-medium">
              Aapda Prabandhan v1.0 • 2026
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-8 lg:p-12 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {step === 1 ? "Create Account" : "Verify Mobile"}
            </h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">
              {step === 1 ? "Secure your citizen portal access" : `Enter the 6-digit code sent to ${formData.mobile}`}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-red-500 text-white rounded-full p-0.5 mr-3 mt-0.5 flex-shrink-0">
                  <CheckCircle size={12} className="rotate-180" />
                </div>
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all text-sm shadow-sm"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
                        Mobile Number
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <Phone size={18} />
                        </div>
                        <input
                          name="mobile"
                          type="tel"
                          required
                          pattern="[6-9]{1}[0-9]{9}"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all text-sm shadow-sm"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
                        Aadhaar Number
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <CreditCard size={18} />
                        </div>
                        <input
                          name="aadhaar"
                          type="text"
                          required
                          pattern="\d{12}"
                          value={formData.aadhaar}
                          onChange={handleChange}
                          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all text-sm shadow-sm"
                          placeholder="0000 0000 0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
                        Email (Optional)
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all text-sm shadow-sm"
                          placeholder="rahul@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
                        Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          name="password"
                          type="password"
                          required
                          minLength="6"
                          value={formData.password}
                          onChange={handleChange}
                          className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent transition-all text-sm shadow-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <>
                      GENERATE OTP <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 mb-6">
                  <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-4 text-center">
                    Enter Verification Code
                  </label>
                  <div className="relative group max-w-[240px] mx-auto">
                    <input
                      type="text"
                      required
                      maxLength="6"
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full py-4 border-2 border-brand-200 rounded-2xl bg-white text-brand-900 tracking-[0.6em] font-mono text-center text-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 transition-all"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-[10px] text-brand-600 text-center mt-4 font-medium">
                    Wait for 2-3 minutes if code is delayed
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 px-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all order-2 sm:order-1"
                  >
                    GO BACK
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[1.5] flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200 order-1 sm:order-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      <>
                        VERIFY & COMPLETE <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-10 text-center text-sm text-slate-500 font-medium">
              Already a user?{" "}
              <Link
                to="/login"
                className="font-bold text-brand-600 hover:text-brand-500 transition-colors"
              >
                Sign In instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
