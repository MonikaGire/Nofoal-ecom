'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: Props) {
  const router = useRouter();
  const { login, signup, isAuthenticated, user, logout } = useAuthStore();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setTab('login');
      setError('');
      setSuccess('');
      setLoginForm({ email: '', password: '' });
      setRegForm({ name: '', email: '', password: '', confirm: '' });
      setForgotEmail('');
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      const state = useAuthStore.getState();
      if (state.user?.role === 'admin') {
        onClose();
        router.push('/admin');
      } else {
        setSuccess(`Welcome back, ${state.user?.name || 'there'}!`);
        setTimeout(onClose, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(regForm.name, regForm.email, regForm.password);
      setSuccess(`Account created! Welcome, ${regForm.name}.`);
      setTimeout(onClose, 1400);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Reset link sent! Check your inbox (and spam folder).');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        .auth-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center;
          animation: authFadeIn .2s ease;
        }
        @keyframes authFadeIn { from { opacity: 0 } to { opacity: 1 } }
        .auth-box {
          background: #fff; width: 100%; max-width: 400px;
          padding: 40px 36px; position: relative;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          animation: authSlide .25s ease;
        }
        @keyframes authSlide { from { transform: translateY(-16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .auth-close {
          position: absolute; top: 14px; right: 16px;
          background: none; border: none; font-size: 22px;
          cursor: pointer; color: #aaa; line-height: 1;
        }
        .auth-close:hover { color: #111; }
        .auth-logo { text-align: center; margin-bottom: 24px; }
        .auth-logo img { height: 30px; }
        .auth-tabs { display: flex; border-bottom: 2px solid #f0ede6; margin-bottom: 24px; }
        .auth-tab {
          flex: 1; padding: 10px 0; background: none; border: none;
          font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
          cursor: pointer; font-family: inherit; color: #aaa;
          border-bottom: 2px solid transparent; margin-bottom: -2px;
          transition: all .2s;
        }
        .auth-tab.active { color: #111; border-bottom-color: #111; }
        .auth-field { margin-bottom: 14px; }
        .auth-label {
          display: block; font-size: 10px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #888; margin-bottom: 5px;
        }
        .auth-input {
          width: 100%; padding: 10px 12px; border: 1px solid #e0dfd8;
          background: #f5f4f0; font-size: 14px; font-family: inherit;
          outline: none; box-sizing: border-box; transition: border-color .2s;
        }
        .auth-input:focus { border-color: #111; background: #fff; }
        .auth-btn {
          width: 100%; padding: 12px; background: #111; color: #fff;
          border: none; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer; font-family: inherit;
          margin-top: 8px; transition: background .2s;
        }
        .auth-btn:hover { background: #333; }
        .auth-btn:disabled { background: #aaa; cursor: not-allowed; }
        .auth-error {
          color: #c0392b; font-size: 12px; padding: 8px 12px;
          background: #fff3f3; margin-bottom: 14px;
        }
        .auth-success {
          color: #27ae60; font-size: 13px; padding: 10px 12px;
          background: #f0fff4; text-align: center; margin-bottom: 14px;
        }
        .auth-switch {
          text-align: center; margin-top: 18px; font-size: 12px; color: #888;
        }
        .auth-switch button {
          background: none; border: none; color: #111; cursor: pointer;
          font-family: inherit; font-size: 12px; font-weight: 600;
          text-decoration: underline; padding: 0;
        }
        .auth-forgot-link {
          display: block; text-align: right; margin-top: -6px; margin-bottom: 14px;
          font-size: 11px; color: #aaa; cursor: pointer; background: none;
          border: none; font-family: inherit; padding: 0;
        }
        .auth-forgot-link:hover { color: #111; }
        @media(max-width:480px){
          .auth-box { margin: 16px; padding: 28px 20px; }
        }
      `}</style>

      <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="auth-box">
          <button className="auth-close" onClick={onClose}>×</button>

          {/* Logo */}
          <div className="auth-logo">
            <img src="/asset/images/logo/logo-b.png" alt="Nofoal" />
          </div>

          {/* If already logged in — show account info */}
          {isAuthenticated && user ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>Signed in as</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 24 }}>{user.email}</div>
              {user.role === 'admin' && (
                <a
                  href="/admin"
                  style={{ display: 'block', padding: '10px', background: '#111', color: '#fff', textDecoration: 'none', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}
                >
                  Go to Dashboard
                </a>
              )}
              <button
                onClick={() => { logout(); onClose(); }}
                style={{ width: '100%', padding: 10, background: 'none', border: '1px solid #ddd', color: '#666', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="auth-tabs">
                {tab === 'forgot' ? (
                  <button className="auth-tab active" style={{ textAlign: 'left' }}>
                    Reset Password
                  </button>
                ) : (
                  <>
                    <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
                      Sign In
                    </button>
                    <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
                      Register
                    </button>
                  </>
                )}
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              {/* Login Form */}
              {tab === 'login' && !success && (
                <form onSubmit={handleLogin}>
                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                      className="auth-input" type="email" required autoFocus
                      value={loginForm.email}
                      onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                      className="auth-input" type="password" required
                      value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => { setTab('forgot'); setError(''); setSuccess(''); setForgotEmail(loginForm.email); }}
                  >
                    Forgot password?
                  </button>
                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                  <div className="auth-switch">
                    New here?{' '}
                    <button type="button" onClick={() => { setTab('register'); setError(''); }}>Create account</button>
                  </div>
                </form>
              )}

              {/* Forgot Password Form */}
              {tab === 'forgot' && !success && (
                <form onSubmit={handleForgotPassword}>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
                    Enter your email and we'll send you a link to reset your password.
                  </p>
                  <div className="auth-field">
                    <label className="auth-label">Email Address</label>
                    <input
                      className="auth-input" type="email" required autoFocus
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="auth-switch">
                    <button type="button" onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Register Form */}
              {tab === 'register' && !success && (
                <form onSubmit={handleRegister}>
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <input
                      className="auth-input" type="text" required autoFocus
                      value={regForm.name}
                      onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input
                      className="auth-input" type="email" required
                      value={regForm.email}
                      onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <input
                      className="auth-input" type="password" required
                      value={regForm.password}
                      onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Confirm Password</label>
                    <input
                      className="auth-input" type="password" required
                      value={regForm.confirm}
                      onChange={e => setRegForm(p => ({ ...p, confirm: e.target.value }))}
                      placeholder="Repeat password"
                    />
                  </div>
                  <button className="auth-btn" type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <div className="auth-switch">
                    Already have an account?{' '}
                    <button type="button" onClick={() => { setTab('login'); setError(''); }}>Sign in</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
