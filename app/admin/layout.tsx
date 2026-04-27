'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '▪' },
  { href: '/admin/products', label: 'Products', icon: '▪' },
  { href: '/admin/orders', label: 'Orders', icon: '▪' },
  { href: '/admin/preorders', label: 'Pre-Orders', icon: '▪' },
  { href: '/admin/analytics', label: 'Analytics', icon: '▪' },
  { href: '/admin/customers', label: 'Customers', icon: '▪' },
  { href: '/admin/inventory', label: 'Inventory', icon: '▪' },
  { href: '/admin/waitlist', label: 'Waitlist', icon: '▪' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f5f4f0',
        fontFamily: "'Roboto', sans-serif",
      }}>
        <div style={{
          width: 380, background: '#fff', padding: '48px 40px',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <img src="/asset/images/logo/logo-b.png" alt="Nofoal" style={{ height: 36 }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Admin Access</div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#aaa', marginBottom: 32 }}>
            Nofoal Control Panel
          </div>
          {error && (
            <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 16, padding: '8px 12px', background: '#fff3f3' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            {[
              { label: 'Email', type: 'email', value: email, set: setEmail },
              { label: 'Password', type: 'password', value: password, set: setPassword },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '11px 12px', border: '1px solid #e0dfd8',
                    background: '#f5f4f0', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 13, background: '#111', color: '#fff', border: 'none',
                fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentLabel = navItems.find(n =>
    n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)
  )?.label || 'Admin';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Roboto', sans-serif", background: '#f5f4f0' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: collapsed ? 0 : 220,
        minWidth: collapsed ? 0 : 220,
        background: '#111',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 200,
        overflow: 'hidden',
        transition: 'width 0.2s, min-width 0.2s',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <img src="/asset/images/logo/logo-b.png" alt="Nofoal" style={{ height: 46, filter: 'invert(1)' }} />
          </a>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 5 }}>
            Admin Panel
          </div>
        </div>

        {/* Nav Items — vertical list */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 0' }}>
          {navItems.map(item => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  textDecoration: 'none',
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: active ? '2px solid #fff' : '2px solid transparent',
                  fontWeight: active ? 500 : 400,
                  transition: 'all 0.15s',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'Admin'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)', padding: '6px 0', fontSize: 10,
              letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{
        flex: 1,
        marginLeft: collapsed ? 0 : 220,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.2s',
        minWidth: 0,
      }}>
        {/* Top bar */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e8e6de',
          padding: '0 28px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666', padding: '4px 2px', lineHeight: 1 }}
            >
              ☰
            </button>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{currentLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', background: '#111', color: '#fff',
                fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase',
                textDecoration: 'none', fontFamily: 'inherit', fontWeight: 500,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#333')}
              onMouseLeave={e => (e.currentTarget.style.background = '#111')}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View Store
            </a> */}
            <span style={{ fontSize: 12, color: '#aaa' }}>{user?.email}</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px 28px', flex: 1, minWidth: 0, color: '#111' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
