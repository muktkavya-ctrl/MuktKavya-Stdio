import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Feather,
  Sparkles,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Crown,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPage = ({ initialMode = 'login', onNavigate, onSuccess }) => {
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const { isDark } = useTheme();

  const t = isDark ? 'dark' : 'light';

  // Modes: 'login' | 'register' | 'forgot_email' | 'verify_otp'
  const [mode, setMode] = useState(initialMode === 'signup' || initialMode === 'register' ? 'register' : 'login');

  // Sync mode with route prop if parent tab changes
  useEffect(() => {
    if (initialMode === 'register' || initialMode === 'signup') {
      setMode('register');
    } else {
      setMode('login');
    }
    setError('');
    setSuccessMsg('');
  }, [initialMode]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('writer');
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Rotating classical couplets
  const quotes = [
    {
      verse: 'दिल-ए-नादाँ तुझे हुआ क्या है,\nआख़िर इस दर्द की दवा क्या है...',
      author: 'मिर्ज़ा ग़ालिब',
      tradition: 'Urdu Ghazal',
    },
    {
      verse: 'सच है, विपत्ति जब आती है,\nकायर को ही दहलाती है...',
      author: 'रामधारी सिंह "दिनकर"',
      tradition: 'Hindi Veer Rasa',
    },
    {
      verse: 'चित्त जेथा भयशून्य,\nउच्च जेथा शिर...',
      author: 'रवींद्रनाथ ठाकुर',
      tradition: 'Bengali Lyric',
    },
    {
      verse: 'पोथी पढ़ि पढ़ि जग मुआ,\nपंडित भया न कोय...',
      author: 'संत कबीर',
      tradition: 'Bhakti Kavya',
    },
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleModeSwitch = (newMode) => {
    setError('');
    setSuccessMsg('');
    setMode(newMode);
    if (onNavigate) {
      if (newMode === 'register') {
        onNavigate('signup');
      } else if (newMode === 'login') {
        onNavigate('login');
      }
    }
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
          setSuccessMsg('Registration successful! Welcome to Mukt Kavya.');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else if (onNavigate) onNavigate('explore');
          }, 700);
        } else {
          setError(res.message);
        }
      } else if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMsg('Welcome back! Logging you in...');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else if (onNavigate) onNavigate('explore');
          }, 600);
        } else {
          setError(res.message);
        }
      } else if (mode === 'forgot_email') {
        const res = await forgotPassword(email);
        if (res.success) {
          setSuccessMsg(res.message || 'OTP dispatched to your email.');
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
          setSuccessMsg('Password reset successfully! Redirecting...');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else if (onNavigate) onNavigate('explore');
          }, 900);
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


  return (
    <div className="auth-page">
      {/* Floating Particles */}
      <div className="auth-particle auth-particle-1" />
      <div className="auth-particle auth-particle-2" />
      <div className="auth-particle auth-particle-3" />
      <div className="auth-particle auth-particle-4" />
      <div className="auth-particle auth-particle-5" />

      {/* Main Auth Container — Split Layout */}
      <div className="auth-container">
        {/* LEFT — Showcase Panel */}
        <div className="auth-showcase">
          {/* Floating Logo */}
          <div className="auth-showcase-logo">
            <img
              src="/logo.png"
              alt="Mukt Kavya"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Brand Title */}
          <h1 className="auth-showcase-title">मुक्त काव्य</h1>

          {/* Divider */}
          <div className="auth-showcase-divider" />

          {/* Rotating Couplet */}
          <div
            className="auth-quote-box"
            onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
            title="Click for next verse"
          >
            <Feather
              style={{
                width: 16,
                height: 16,
                color: '#d4af37',
                marginBottom: 8,
                opacity: 0.6,
              }}
            />
            <p className="auth-quote-verse">
              "{quotes[quoteIndex].verse}"
            </p>
            <p className="auth-quote-author">
              — {quotes[quoteIndex].author}
            </p>
            <p className="auth-quote-tradition">
              {quotes[quoteIndex].tradition}
            </p>
          </div>

          {/* Stats */}
          <div className="auth-showcase-stats">
            <div className="auth-stat">
              <span className="auth-stat-value">12+</span>
              <span className="auth-stat-label">Languages</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-value">500+</span>
              <span className="auth-stat-label">Poems</span>
            </div>
            <div className="auth-stat">
              <span className="auth-stat-value">50+</span>
              <span className="auth-stat-label">Poets</span>
            </div>
          </div>
        </div>

        {/* RIGHT — Form Panel */}
        <div className={`auth-form-panel ${t}`}>
          {/* Mode Switcher */}
          {(mode === 'login' || mode === 'register') && (
            <div className={`auth-mode-switcher ${t}`}>
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`auth-mode-btn ${
                  mode === 'login' ? `active-${t}` : `inactive-${t}`
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`auth-mode-btn ${
                  mode === 'register' ? `active-${t}` : `inactive-${t}`
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Back to Login (for forgot/otp modes) */}
          {(mode === 'forgot_email' || mode === 'verify_otp') && (
            <div style={{ marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`auth-forgot-link ${t}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}

          {/* Form Header */}
          <div className="auth-form-header">
            <h2 className={`auth-form-title ${t}`}>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Join the Circle'}
              {mode === 'forgot_email' && 'Reset Password'}
              {mode === 'verify_otp' && 'Verify Code'}
            </h2>
            <p className={`auth-form-desc ${t}`}>
              {mode === 'login' && 'Sign in to publish verses and connect with readers.'}
              {mode === 'register' && 'Create your poet profile and start publishing.'}
              {mode === 'forgot_email' && 'Enter your email to receive a 6-digit OTP.'}
              {mode === 'verify_otp' && `Enter the code sent to ${email}`}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="auth-alert auth-alert-error">{error}</div>
          )}
          {successMsg && (
            <div className="auth-alert auth-alert-success">
              <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Register: Full Name */}
            {mode === 'register' && (
              <div className="auth-input-group">
                <label className={`auth-input-label ${t}`}>Full Name *</label>
                <div className="auth-input-wrapper">
                  <User className={`auth-input-icon ${t}`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harivansh Rai Bachchan"
                    className={`auth-input ${t}`}
                    style={{ paddingLeft: 46 }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            {mode !== 'verify_otp' && (
              <div className="auth-input-group">
                <label className={`auth-input-label ${t}`}>Email Address *</label>
                <div className="auth-input-wrapper">
                  <Mail className={`auth-input-icon ${t}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`auth-input ${t}`}
                    style={{ paddingLeft: 46 }}
                  />
                </div>
              </div>
            )}

            {/* OTP Input */}
            {mode === 'verify_otp' && (
              <div className="auth-input-group">
                <label className={`auth-input-label ${t}`}>6-Digit Verification OTP *</label>
                <div className="auth-input-wrapper">
                  <KeyRound className={`auth-input-icon ${t}`} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`auth-input auth-otp-input ${t}`}
                    style={{ paddingLeft: 14, paddingRight: 14 }}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Password */}
            {mode !== 'forgot_email' && (
              <div className="auth-input-group">
                <div className="auth-input-label-row">
                  <label className={`auth-input-label ${t}`} style={{ marginBottom: 0 }}>
                    {mode === 'verify_otp' ? 'New Password *' : 'Password *'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot_email')}
                      className={`auth-forgot-link ${t}`}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock className={`auth-input-icon ${t}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`auth-input ${t}`}
                    style={{ paddingLeft: 46, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-toggle"
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: 16, height: 16 }} />
                    ) : (
                      <Eye style={{ width: 16, height: 16 }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            {mode === 'verify_otp' && (
              <div className="auth-input-group">
                <label className={`auth-input-label ${t}`}>Confirm New Password *</label>
                <div className="auth-input-wrapper">
                  <Lock className={`auth-input-icon ${t}`} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`auth-input ${t}`}
                    style={{ paddingLeft: 46 }}
                  />
                </div>
              </div>
            )}

            {/* Register: Role & Pen Name */}
            {mode === 'register' && (
              <>
                <div className="auth-input-group">
                  <div className="auth-two-col">
                    <div>
                      <label className={`auth-input-label ${t}`}>Profile Role *</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={`auth-select ${t}`}
                      >
                        <option value="writer">✍️ Poet / Writer</option>
                        <option value="reader">📖 Reader</option>
                      </select>
                    </div>
                    <div>
                      <label className={`auth-input-label ${t}`}>Pen Name (तख़ल्लुस)</label>
                      <input
                        type="text"
                        value={penName}
                        onChange={(e) => setPenName(e.target.value)}
                        placeholder="e.g. दिनकर, ग़ालिब"
                        className={`auth-input ${t}`}
                        style={{ paddingLeft: 14 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className={`auth-input-label ${t}`}>Brief Literary Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a thought on your poetic journey..."
                    rows={2}
                    className={`auth-textarea ${t}`}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-btn ${t}`}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RefreshCw className="auth-spinner" />
                  <span>Processing...</span>
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'register' ? (
                'Create Account'
              ) : mode === 'forgot_email' ? (
                'Send Verification Code'
              ) : (
                'Verify & Reset Password'
              )}
            </button>
          </form>


          {/* Footer Navigation */}
          <div className="auth-footer">
            {mode === 'login' && (
              <span className={`auth-footer-text ${t}`}>
                Don't have an account?
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className={`auth-footer-link ${t}`}
                >
                  Create one →
                </button>
              </span>
            )}
            {mode === 'register' && (
              <span className={`auth-footer-text ${t}`}>
                Already have an account?
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className={`auth-footer-link ${t}`}
                >
                  Sign In →
                </button>
              </span>
            )}
            {(mode === 'forgot_email' || mode === 'verify_otp') && (
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`auth-footer-link ${t}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} />
                <span>Return to Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
