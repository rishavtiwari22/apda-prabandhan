import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Phone, Key, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import API from "../services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: Reset, 4: Success
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/send-otp", { mobile: mobile.replace(/\s/g, "") });
      if (res.data?.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/verify-otp", { 
        mobile: mobile.replace(/\s/g, ""), 
        otp 
      });
      if (res.data?.success) {
        setResetToken(res.data.data.resetToken);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/reset-password", { 
        resetToken, 
        newPassword 
      });
      if (res.data?.success) {
        setStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-slate-100 relative group transition-all duration-500">
        {/* Decorative elements */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-50 transition-colors duration-1000 ${step === 4 ? 'bg-green-100' : 'bg-brand-100'}`}></div>
        
        <div className="p-8 sm:p-10 relative z-10">
          <div className="flex justify-center mb-10">
            <div className={`w-20 h-20 ${step === 4 ? 'bg-green-500' : 'bg-brand-600'} rounded-[2rem] flex items-center justify-center shadow-lg transform -rotate-6 transition-all duration-500`}>
              {step === 4 ? (
                <CheckCircle className="text-white w-10 h-10 rotate-6" />
              ) : (
                <Shield className="text-white w-10 h-10 rotate-6" />
              )}
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-2 tracking-tight">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Reset Password"}
            {step === 4 && "All Set!"}
          </h2>
          <p className="text-center text-slate-500 text-sm mb-10 font-medium leading-relaxed">
            {step === 1 && "Enter your mobile to recover access."}
            {step === 2 && `Code sent to ${mobile}`}
            {step === 3 && "Secure your account with a new password."}
            {step === 4 && "Your password has been updated successfully."}
          </p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-red-500 text-white rounded-full p-0.5 mr-3 mt-0.5 flex-shrink-0">
                <CheckCircle size={12} className="rotate-180" />
              </div>
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
                  Mobile Number
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-600 transition-colors duration-300">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition-all text-sm shadow-sm"
                    placeholder="9876543210"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:transform-none transition-all duration-200"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <>SEND VERIFICATION CODE <ArrowRight className="ml-2" size={18} /></>}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 mb-2">
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-4 text-center">
                  Verification Code
                </label>
                <div className="relative group max-w-[200px] mx-auto">
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
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 px-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 bg-white hover:bg-slate-50 transition-all"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.5] flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <>VERIFY CODE <ArrowRight className="ml-2" size={18} /></>}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
                    New Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-600 transition-all">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      minLength="6"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition-all text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-600 transition-all">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white transition-all text-sm shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <>UPDATE PASSWORD <ArrowRight className="ml-2" size={18} /></>}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="py-4 px-6 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-sm font-medium text-center">
                Your security credentials have been successfully updated.
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
              >
                RETURN TO LOGIN <ArrowRight className="ml-2" size={18} />
              </button>
            </div>
          )}

          {step !== 4 && (
            <Link
              to="/login"
              className="mt-10 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-colors duration-300"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
