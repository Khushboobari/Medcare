import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, ShieldCheck, MailQuestion, ArrowLeft, CheckCircle, LogIn } from 'lucide-react';

const Auth = ({ setCurrentPage }) => {
  const { login, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('login'); // login | register
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const otp = otpDigits.join('');
  const otpInputsRef = useRef([]);
  
  // Timer states for resend
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState('');

  useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email && !phone) {
      showToast('Enter email or phone to receive your OTP.', 'error');
      return;
    }
    if (activeTab === 'register' && !fullName) {
      showToast('Please provide your name to create an account.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { fullName: activeTab === 'register' ? fullName : undefined };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(30);
        setCanResend(false);
        setOtpDigits(Array(6).fill(''));
        showToast(data.message, 'success');
        if (data.mockOtp) setMockOtpHint(data.mockOtp);
      } else {
        showToast(data.message || 'Failed to send OTP.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { otp };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        setCurrentPage('home');
      } else {
        showToast(data.message || 'Invalid verification code.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Verification failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Send mock Google auth payload
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: null, // Triggers mock validation on backend
          email: `${email.split('@')[0] || 'googleuser'}@gmail.com`,
          name: email.split('@')[0] ? (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) + ' (Google)') : 'Google User',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email || 'GoogleUser'}`
        })
      });
      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        setCurrentPage('home');
      } else {
        showToast('Google sign-in simulation failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Google Login error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="hidden lg:flex flex-col justify-between rounded-[36px] overflow-hidden shadow-[0_50px_140px_rgba(15,23,42,0.18)] bg-gradient-to-br from-primary to-secondary text-white">
          <div className="relative p-10 space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 border border-white/10 backdrop-blur-sm">
              <span className="text-lg">🏥</span>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">MedCare Secure Access</p>
                <p className="font-black text-xl">Login with speed</p>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black leading-tight">One click OTP login and smart account creation.</h1>
              <p className="max-w-md text-sm text-white/80 leading-relaxed">Sign in quickly, skip the password, and manage your medicines, orders, and prescriptions from a modern dashboard.</p>
            </div>

            <div className="space-y-4">
              {[
                'OTP verification for secure sign-in',
                'Google login available for faster access',
                'Role-based admin access for staff only',
              ].map((text, index) => (
                <div key={index} className="flex items-start gap-3 text-sm text-white/90">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/15 text-white">✓</span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative p-10 overflow-hidden border-t border-white/10">
            <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
            <div className="relative rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">Why MedCare</p>
              <p className="mt-4 text-sm text-white/80 leading-relaxed">A smart, secure healthcare experience with instant login, reliable drug support, and seamless order tracking.</p>
              <div className="mt-6 grid gap-3">
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">⚡</span>
                  <p className="text-sm">Fast onboarding for patients and staff.</p>
                </div>
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">🔒</span>
                  <p className="text-sm">Encrypted credentials and mock OTP mode.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-[36px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 overflow-hidden">
          <div className="absolute -right-16 top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-12 bottom-10 h-28 w-28 rounded-full bg-secondary/10 blur-3xl" />

          <button
            onClick={() => setCurrentPage('home')}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="mb-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Fast access</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">Login or Register with OTP</h2>
            <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">Enter your email and receive a one-time code. No password required, just a secure and easy sign-in experience.</p>
          </div>

          <div className="grid gap-3 mb-8 sm:grid-cols-2">
            <button
              onClick={() => setActiveTab('login')}
              className={`rounded-3xl py-3 text-sm font-semibold transition-all ${activeTab === 'login' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/80'}`}
            >Sign In</button>
            <button
              onClick={() => setActiveTab('register')}
              className={`rounded-3xl py-3 text-sm font-semibold transition-all ${activeTab === 'register' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/80'}`}
            >Create Account</button>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              {activeTab === 'register' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-4 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-primary"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Phone number</label>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-4 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-4 pl-14 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Phone number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-4 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 sm:items-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
                  {activeTab === 'login' ? (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Password-free login</p>
                      <p className="mt-1">Receive an OTP and access your account instantly.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">Create a secure account</p>
                      <p className="mt-1">Your details are verified with OTP and saved securely.</p>
                    </>
                  )}
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Tip</p>
                  <p className="mt-2 text-sm">Keep your phone number ready for fast verification on signup.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-primary py-4 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : activeTab === 'login' ? 'Send Login OTP' : 'Create Account & Send OTP'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-slate-800" />
                <p className="relative mx-auto w-max bg-white dark:bg-slate-900 px-4 text-xs uppercase text-slate-400">Or continue with</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 text-sm font-semibold text-slate-700 dark:text-slate-100 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-3"
              >
                <LogIn className="h-5 w-5" />
                Continue with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
                <div className="flex items-center gap-3">
                  <MailQuestion className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Verification sent to</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{email}</p>
                  </div>
                </div>
                {mockOtpHint && (
                  <p className="mt-3 rounded-2xl bg-secondary/10 border border-secondary/20 px-4 py-3 text-sm text-secondary-dark dark:text-secondary">Dev OTP: <span className="font-semibold">{mockOtpHint}</span></p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Enter OTP</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputsRef.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const nextDigits = [...otpDigits];
                          nextDigits[index] = value;
                          setOtpDigits(nextDigits);
                          if (value && index < 5) {
                            otpInputsRef.current[index + 1]?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && index > 0) {
                            otpInputsRef.current[index - 1]?.focus();
                          }
                        }}
                        className="h-14 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-center text-lg font-bold tracking-[0.28em] text-slate-900 dark:text-slate-100 outline-none transition-colors focus:border-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-secondary py-4 text-sm font-semibold text-white transition-all hover:bg-secondary-dark disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setMockOtpHint('');
                    setOtp('');
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Change Email
                </button>
                <div>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="font-semibold text-primary hover:underline"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span>
                      Resend in <span className="font-semibold text-slate-700 dark:text-slate-200">{countdown}s</span>
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
