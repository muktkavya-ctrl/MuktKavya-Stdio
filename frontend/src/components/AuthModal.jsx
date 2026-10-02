import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Feather,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, forgotPassword, resetPassword } = useAuth();

  // Modes: 'login' | 'register' | 'forgot_email' | 'verify_otp'
  const [mode, setMode] = useState('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('writer');
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetAllFields = () => {
    setError('');
    setSuccessMsg('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setPenName('');
    setBio('');
  };

  const handleClose = () => {
    resetAllFields();
    setMode('login');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await register({
          name,
          email,
          password,
          role,
          penName,
          bio,
        });
        if (res.success) {
          handleClose();
        } else {
          setError(res.message);
        }
      } else if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          handleClose();
        } else {
          setError(res.message);
        }
      } else if (mode === 'forgot_email') {
        const res = await forgotPassword(email);
        if (res.success) {
          setSuccessMsg(res.message || 'OTP sent successfully!');
          setMode('verify_otp');
        } else {
          setError(res.message);
        }
      } else if (mode === 'verify_otp') {
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const res = await resetPassword({
          email,
          otp,
          newPassword: password,
        });
        if (res.success) {
          setSuccessMsg('Password updated successfully! Logging you in...');
          setTimeout(() => {
            handleClose();
          }, 1200);
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMsg('A new OTP has been dispatched to your email.');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0c0f1c] border border-[#d4af37]/45 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Emblem (Fixed size to prevent ballooning) */}
        <div className="text-center mb-5">
          <div
            style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px' }}
            className="mx-auto rounded-full bg-gradient-to-tr from-[#800020] to-[#d4af37] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center mb-2.5 overflow-hidden bg-slate-950"
          >
            <img
              src="/logo.png"
              alt="Mukt Kavya Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              className="rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Rozha_One'] text-white">
            {mode === 'login' && 'प्रवेश करें (Sign In)'}
            {mode === 'register' && 'काव्य मंच से जुड़ें (Join Mukt Kavya)'}
            {mode === 'forgot_email' && 'पासवर्ड रीसेट (Forgot Password)'}
            {mode === 'verify_otp' && 'सत्यापन कोड (Verify OTP & Reset)'}
          </h2>

          <p className="text-xs text-slate-400 mt-1 font-['Outfit']">
            {mode === 'login' && 'Enter the sanctuary of immortal words.'}
            {mode === 'register' && 'Begin your journey across regional verses and royal poetry.'}
            {mode === 'forgot_email' && 'Receive a 6-digit OTP via Brevo Mailer to securely reset your password.'}
            {mode === 'verify_otp' && `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {/* Executive Demo Switcher (Discreet & Professional) */}
        {mode === 'login' && (
          <div className="mb-4">
            <details className="group border border-[#d4af37]/20 rounded-xl bg-slate-950/60 overflow-hidden text-xs transition-all">
              <summary className="cursor-pointer px-3 py-2 flex items-center justify-between text-slate-400 hover:text-[#f5e7a9] select-none text-[11px] font-medium bg-slate-900/40">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Pre-Seeded Test Credentials & Quick Login</span>
                </span>
                <span className="text-[10px] text-[#d4af37]/70 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-3 border-t border-slate-800/80 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemo('praveen.pr105@gmail.com')}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-[#d4af37] text-[#f5e7a9] hover:text-slate-950 border border-[#d4af37]/40 text-left transition-all"
                  >
                    <p className="font-bold text-[11px]">👑 Super Admin</p>
                    <p className="text-[9px] opacity-80 font-mono">praveen.pr105@gmail.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemo('dinkar@muktkavya.com')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#d4af37] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#d4af37] text-left transition-all"
                  >
                    <p className="font-semibold text-[11px]">✍️ Kavi Dinkar (Hindi)</p>
                    <p className="text-[9px] opacity-80 font-mono">dinkar@muktkavya.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemo('ghalib@muktkavya.com')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#d4af37] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#d4af37] text-left transition-all"
                  >
                    <p className="font-semibold text-[11px]">✍️ Shayar Ghalib (Urdu)</p>
                    <p className="text-[9px] opacity-80 font-mono">ghalib@muktkavya.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemo('reader@muktkavya.com')}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#d4af37] text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-[#d4af37] text-left transition-all"
                  >
                    <p className="font-semibold text-[11px]">📖 Reader Account</p>
                    <p className="text-[9px] opacity-80 font-mono">reader@muktkavya.com</p>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 pt-1 text-center font-mono">
                  Default: <span className="text-[#f5e7a9]">password</span> | Super Admin: <span className="text-[#f5e7a9]">praveen@2020</span>
                </p>
              </div>
            </details>
          </div>
        )}

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center animate-fade-in">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Register: Full Name */}
          {mode === 'register' && (
            <div>
              <label className="form-label text-xs">पूरा नाम (Full Name) *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mirza Ghalib / Harivansh Rai Bachchan"
                  className="form-control pl-10 text-xs"
                />
              </div>
            </div>
          )}

          {/* Email Address (Shown in login, register, forgot_email) */}
          {mode !== 'verify_otp' && (
            <div>
              <label className="form-label text-xs">ईमेल (Email Address) *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="form-control pl-10 text-xs"
                />
              </div>
            </div>
          )}

          {/* OTP Code Input (Mode: verify_otp) */}
          {mode === 'verify_otp' && (
            <div>
              <label className="form-label text-xs flex items-center justify-between">
                <span>सुरक्षा सत्यापन कोड (6-Digit OTP) *</span>
                <span className="text-[10px] text-amber-400 font-mono">Expires in 10 mins</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#d4af37] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="form-control pl-10 text-center tracking-[0.4em] font-mono text-base font-bold text-[#fceda2]"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Password (Shown in login, register, verify_otp) */}
          {mode !== 'forgot_email' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="form-label text-xs">
                  {mode === 'verify_otp' ? 'नया पासवर्ड (New Password) *' : 'पासवर्ड (Password) *'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setMode('forgot_email');
                    }}
                    className="text-[11px] text-[#d4af37] hover:underline pb-1 font-medium"
                  >
                    पासवर्ड भूल गए? (Forgot?)
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-control pl-10 text-xs"
                />
              </div>
            </div>
          )}

          {/* Confirm Password (Mode: verify_otp) */}
          {mode === 'verify_otp' && (
            <div>
              <label className="form-label text-xs">पासवर्ड की पुष्टि करें (Confirm Password) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-control pl-10 text-xs"
                />
              </div>
            </div>
          )}

          {/* Register: Role & Pen Name & Bio */}
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">भूमिका (Profile Role) *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-control text-xs"
                  >
                    <option value="writer">✍️ Writer / Poet</option>
                    <option value="reader">📖 Avid Reader</option>
                  </select>
                </div>

                <div>
                  <label className="form-label text-xs">तख़ल्लुस (Pen Name)</label>
                  <input
                    type="text"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="e.g. ग़ालिब, दिनकर"
                    className="form-control text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">संक्षिप्त परिचय (Poet Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A few words about your poetic journey..."
                  rows={2}
                  className="form-control text-xs resize-none"
                />
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-royal w-full justify-center text-xs py-2.5 shadow-lg mt-2 font-bold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                Please wait...
              </span>
            ) : mode === 'login' ? (
              'Sign In'
            ) : mode === 'register' ? (
              'Register & Welcome via Brevo'
            ) : mode === 'forgot_email' ? (
              'Send 6-Digit OTP via Email'
            ) : (
              'Verify OTP & Reset Password'
            )}
          </button>
        </form>

        {/* Resend OTP button in verify_otp mode */}
        {mode === 'verify_otp' && (
          <div className="mt-3 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={handleResendOtp}
              className="text-[11px] text-slate-400 hover:text-[#d4af37] underline transition-colors"
            >
              Didn't receive code? Resend OTP
            </button>
          </div>
        )}

        {/* Navigation toggles between modes */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          {mode === 'login' && (
            <span>
              New to Mukt Kavya?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('register');
                }}
                className="text-[#d4af37] font-semibold hover:underline"
              >
                Create Writer or Reader Account
              </button>
            </span>
          )}

          {mode === 'register' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMsg('');
                  setMode('login');
                }}
                className="text-[#d4af37] font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}

          {(mode === 'forgot_email' || mode === 'verify_otp') && (
            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMsg('');
                setMode('login');
              }}
              className="text-[#d4af37] font-semibold hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
