import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, ShieldCheck, MailQuestion, ArrowLeft } from 'lucide-react';

const Auth = ({ setCurrentPage }) => {
  const { login, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
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
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(30);
        setCanResend(false);
        showToast(data.message, 'success');
        
        // Save mock OTP hint if present
        if (data.mockOtp) {
          setMockOtpHint(data.mockOtp);
        } else if (data.fallbackOtp) {
          setMockOtpHint(data.fallbackOtp);
        }
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
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
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
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
        
        {/* Banner */}
        <div className="bg-primary p-8 text-center text-white relative">
          <button 
            onClick={() => setCurrentPage('home')}
            className="absolute top-4 left-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-3xl">🏥</span>
          <h2 className="text-2xl font-bold mt-2">Welcome to MedCare</h2>
          <p className="text-xs text-white/80 mt-1">Access advanced medicine delivery & support</p>
        </div>

        <div className="p-8">
          
          {/* Tabs */}
          {!otpSent && (
            <div className="flex border-b border-slate-100 dark:border-slate-700 mb-6">
              <button
                onClick={() => setActiveTab('login')}
                className={`w-1/2 pb-3 font-semibold text-sm border-b-2 text-center transition-colors ${activeTab === 'login' ? 'border-primary text-primary dark:text-secondary dark:border-secondary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`w-1/2 pb-3 font-semibold text-sm border-b-2 text-center transition-colors ${activeTab === 'register' ? 'border-primary text-primary dark:text-secondary dark:border-secondary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Register
              </button>
            </div>
          )}

          {/* Form */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary dark:focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-primary/20 btn-scale flex justify-center items-center"
              >
                {loading ? 'Sending Code...' : activeTab === 'login' ? 'Send Login OTP' : 'Send Verification OTP'}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
                <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase">Or continue with</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38C16.88,16.55,14.77,18,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.47,0,2.81,0.53,3.85,1.41l2.02-2.02C16.27,3.95,14.26,3,12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9c4.97,0,9-4.03,9-9C21,11.75,20.85,11.2,21.35,11.1z" fill="#0066FF" />
                  </g>
                </svg>
                Sign in with Google
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                <MailQuestion className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">OTP Code sent to</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{email}</p>
                </div>
              </div>

              {/* Mock OTP Indicator Helper */}
              {mockOtpHint && (
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-xs text-secondary-dark dark:text-secondary font-medium">
                  🔑 Dev Mode OTP Code is: <span className="font-bold text-sm tracking-wider">{mockOtpHint}</span> (Copy/Paste)
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Enter 6-Digit OTP</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-center text-lg tracking-[8px] font-bold outline-none focus:border-primary dark:focus:border-secondary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-xl font-medium text-sm transition-all shadow-md shadow-secondary/20 btn-scale"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="flex justify-between items-center text-xs text-slate-400 font-medium mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setMockOtpHint('');
                    setOtp('');
                  }}
                  className="hover:text-primary transition-colors"
                >
                  Change Email
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span>Resend in <span className="font-bold text-slate-700 dark:text-slate-300">{countdown}s</span></span>
                )}
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;
