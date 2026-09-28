import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { requestPhoneCode } from '../../services/firebaseAuth';
import { X, Lock, Mail, Phone, User as UserIcon, KeyRound, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    openAuthModal,
    login,
    loginWithPhone,
    signup,
    forgotPassword,
  } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  useEffect(() => {
    if (!otpSent || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpSent, countdown]);

  if (!isAuthModalOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      await requestPhoneCode(phone);
      setOtpSent(true);
      setCountdown(30);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Could not send the verification code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    const res = await loginWithPhone(phone, otp);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !phone) {
      setError('Please complete all required fields');
      return;
    }
    const res = await signup({ name, email, phone, password });
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const res = await forgotPassword(email);
    if (res.success) setSuccessMsg(res.message);
    else setError(res.message);
  };

  const quickLoginAs = (_userEmail: string) => {
    setError('Demo profiles are disabled. Sign in with your own account.');
  };

  return (
    <div
      onClick={closeAuthModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div id="firebase-recaptcha-container" className="absolute" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 p-6 text-white relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeAuthModal();
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer pointer-events-auto"
            aria-label="Close authentication"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍔</span>
            <span className="text-xs font-black tracking-widest uppercase opacity-90">FoodVerse Gateway</span>
          </div>
          <h2 className="text-2xl font-black">
            {authModalView === 'login' && 'Welcome Back'}
            {authModalView === 'signup' && 'Create Your Account'}
            {authModalView === 'otp' && 'Fast Phone Login'}
            {authModalView === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            {authModalView === 'login' && 'Unlock saved addresses, loyalty rewards, and live GPS tracking.'}
            {authModalView === 'signup' && 'Get +250 Welcome Points immediately on your first order.'}
            {authModalView === 'otp' && 'One-time secure passcode sent directly to your phone.'}
            {authModalView === 'forgot' && 'We will send instructions to regain account access.'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-500">
          <button
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              openAuthModal('login');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              authModalView === 'login'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20'
                : 'border-transparent hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              openAuthModal('signup');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              authModalView === 'signup'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20'
                : 'border-transparent hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
              openAuthModal('otp');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              authModalView === 'otp'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20'
                : 'border-transparent hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW: LOGIN */}
          {authModalView === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                <span>Sign In to FoodVerse</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {false && <>
              {/* Demo Accounts Quick Click */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  1-Click Demo Profiles
                </span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => quickLoginAs('customer@foodverse.io')}
                    className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:border-orange-400 transition-colors text-left"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Aarav (Customer)</div>
                    <div className="text-[10px] text-stone-400">250 pts • 2 addresses</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('owner@foodverse.io')}
                    className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:border-orange-400 transition-colors text-left"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Chef Marco (Owner)</div>
                    <div className="text-[10px] text-stone-400">Manage Menu & Orders</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('delivery@foodverse.io')}
                    className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:border-orange-400 transition-colors text-left"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Rohan (Courier)</div>
                    <div className="text-[10px] text-stone-400">Active Delivery Fleet</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('admin@foodverse.io')}
                    className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:border-orange-400 transition-colors text-left"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">Priya (Admin)</div>
                    <div className="text-[10px] text-stone-400">Platform Analytics</div>
                  </button>
                </div>
              </div>
              </>}
            </form>
          )}

          {/* VIEW: SIGNUP */}
          {authModalView === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diya Sengupta"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="diya@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Password (optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <span>New diners receive <strong>250 FoodVerse points (₹250 off)</strong> instantly!</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all active:scale-[0.99]"
              >
                Create Account & Claim 250 Pts
              </button>
            </form>
          )}

          {/* VIEW: PHONE OTP */}
          {authModalView === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                      10-Digit Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <span className="px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        required
                        className="flex-1 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
                  >
                    Send One-Time Password
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 text-xs text-orange-800 dark:text-orange-200">
                    OTP sent to <strong>+91 {phone}</strong>.{' '}
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="underline font-bold text-orange-600"
                    >
                      Change number
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                        Enter 6-Digit Verification Code
                      </label>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="1 2 3 4 5 6"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center tracking-widest text-lg font-black text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>Didn't receive code?</span>
                    {countdown > 0 ? (
                      <span className="text-stone-400">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          setError(null);
                          try {
                            await requestPhoneCode(phone);
                            setCountdown(30);
                          } catch (sendError) {
                            setError(sendError instanceof Error ? sendError.message : 'Could not resend the code.');
                          }
                        }}
                        className="font-bold text-orange-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Verify & Proceed
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {authModalView === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
