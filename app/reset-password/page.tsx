'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid or missing reset link. Please request a new one.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        setError(data.message || 'Reset failed. The link may have expired.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        body { background: #f5f4f0; margin: 0; font-family: 'Roboto', sans-serif; }
        .rp-wrap {
          min-height: 100vh; display: flex; align-items: center;
          justify-content: center; padding: 24px;
        }
        .rp-box {
          background: #fff; width: 100%; max-width: 400px;
          padding: 44px 36px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .rp-logo { text-align: center; margin-bottom: 28px; }
        .rp-logo img { height: 32px; }
        .rp-title { font-size: 18px; font-weight: 700; color: #111; margin: 0 0 6px; }
        .rp-sub { font-size: 12px; color: #888; margin: 0 0 28px; }
        .rp-label {
          display: block; font-size: 10px; letter-spacing: 1.5px;
          text-transform: uppercase; color: #888; margin-bottom: 6px;
        }
        .rp-input {
          width: 100%; padding: 11px 12px; border: 1px solid #e0dfd8;
          background: #f5f4f0; font-size: 14px; font-family: inherit;
          outline: none; box-sizing: border-box; margin-bottom: 16px;
          transition: border-color .2s;
        }
        .rp-input:focus { border-color: #111; background: #fff; }
        .rp-btn {
          width: 100%; padding: 13px; background: #111; color: #fff;
          border: none; font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; cursor: pointer; font-family: inherit;
          margin-top: 4px; transition: background .2s;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .rp-btn:hover { background: #333; }
        .rp-btn:disabled { background: #aaa; cursor: not-allowed; }
        .rp-error {
          color: #c0392b; font-size: 12px; padding: 10px 12px;
          background: #fff3f3; margin-bottom: 16px;
        }
        .rp-success {
          text-align: center; padding: 20px 0;
        }
        .rp-success-icon { font-size: 44px; margin-bottom: 12px; }
        .rp-success h2 { font-size: 20px; color: #111; margin: 0 0 8px; }
        .rp-success p { font-size: 13px; color: #666; margin: 0; }
        @media(max-width:480px){ .rp-box { padding: 32px 20px; } }
      `}</style>

      <div className="rp-wrap">
        <div className="rp-box">
          <div className="rp-logo">
            <img src="/asset/images/logo/logo-b.png" alt="Nofoal" />
          </div>

          {success ? (
            <div className="rp-success">
              <div className="rp-success-icon">✓</div>
              <h2>Password Reset!</h2>
              <p>Your password has been updated. Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <h1 className="rp-title">Set New Password</h1>
              <p className="rp-sub">Enter your new password below.</p>

              {error && <div className="rp-error">{error}</div>}

              {token && !error.includes('Invalid or missing') && (
                <form onSubmit={handleSubmit}>
                  <label className="rp-label">New Password</label>
                  <input
                    className="rp-input" type="password" required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    autoFocus
                  />
                  <label className="rp-label">Confirm Password</label>
                  <input
                    className="rp-input" type="password" required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                  />
                  <button className="rp-btn" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

              {error.includes('Invalid or missing') && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <a href="/" style={{ fontSize: 12, color: '#111', fontWeight: 600 }}>← Back to Home</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
