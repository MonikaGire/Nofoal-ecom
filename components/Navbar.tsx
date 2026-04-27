'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; slug: string }[]>([]);

  // Cart count from localStorage
  useEffect(() => {
    function updateCartBadge() {
      try {
        const cart = JSON.parse(localStorage.getItem('nofoal-cart') || '{}');
        const items: { quantity: number }[] = cart?.state?.items || [];
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }
    updateCartBadge();
    const interval = setInterval(updateCartBadge, 1000);
    return () => clearInterval(interval);
  }, []);

  // Register window helpers
  useEffect(() => {
    (window as any).openSearch = () => setSearchOpen(true);
    (window as any).closeSearch = () => setSearchOpen(false);
    (window as any).goToCart = () => router.push('/cart');
  }, [router]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setAccountOpen(false); setMenuOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.account-dropdown-wrap')) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [accountOpen]);

  useEffect(() => {
    if (!searchOpen) { setSearchQuery(''); setSearchResults([]); }
  }, [searchOpen]);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      const filtered = (data.products || []).filter((p: { title: string; category?: string; slug: string }) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch {
      setSearchResults([]);
    }
  }

  function handleLogout() {
    logout();
    setAccountOpen(false);
    router.push('/');
  }

  if (pathname.startsWith('/admin')) return null;

  const isLight = pathname.startsWith('/products') || pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/account') || pathname.startsWith('/return-policy');
  const iconColor = isLight ? '#111' : '#fff';

  return (
    <>
      <style suppressHydrationWarning>{`
        .account-dropdown-wrap { position: relative; }

        .account-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: #fff;
          min-width: 180px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          clip-path: polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          z-index: 2000;
          overflow: hidden;
        }

        .account-dropdown-user {
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f0ede6;
        }

        .account-dropdown-user .name {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .account-dropdown-user .email {
          font-size: 11px;
          color: #aaa;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .account-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          font-size: 12px;
          color: #333;
          text-decoration: none;
          letter-spacing: 0.5px;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          transition: background 0.15s;
        }

        .account-dropdown-item:hover { background: #f5f4f0; color: #111; }

        .account-dropdown-item.logout { color: #c0392b; border-top: 1px solid #f0ede6; }
        .account-dropdown-item.logout:hover { background: #fff3f3; }
      `}</style>

      <header className={isLight ? 'light-nav' : ''}>
        <div
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          style={{ cursor: 'pointer' }}
        >
          <span></span><span></span><span></span>
        </div>
        <nav className={menuOpen ? 'active' : ''}>
          <Link href="/" className={pathname === '/' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>HOME</Link>
          <Link href="/products" className={pathname.startsWith('/products') ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>OBJECTS</Link>
          <Link href="/about" className={pathname === '/about' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>BIO</Link>
          <Link href="/contact" className={pathname === '/contact' ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>CONTACT</Link>

          <div className="navbar-icons">
            <button className="navbar-icon" onClick={() => setSearchOpen(true)} title="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <button className="navbar-icon" onClick={() => router.push('/cart')} title="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* Account icon — dropdown if logged in, modal if not */}
            <div className="account-dropdown-wrap">
              <button
                className="navbar-icon"
                onClick={() => isAuthenticated ? setAccountOpen(o => !o) : setAuthOpen(true)}
                title={isAuthenticated ? user?.name || 'Account' : 'Sign In'}
                style={{ position: 'relative' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {isAuthenticated && (
                  <span style={{ position: 'absolute', bottom: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#27ae60', border: '1.5px solid #fff' }} />
                )}
              </button>

              {accountOpen && isAuthenticated && (
                <div className="account-dropdown">
                  <div className="account-dropdown-user">
                    <div className="name">{user?.name}</div>
                    <div className="email">{user?.email}</div>
                  </div>
                  {user?.role === 'admin' && (
                    <a href="/admin" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                      Dashboard
                    </a>
                  )}
                  <a href="/account/orders" className="account-dropdown-item" onClick={() => setAccountOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    My Orders
                  </a>
                  <button className="account-dropdown-item logout" onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-container-overlay">
            <button className="search-close" onClick={() => setSearchOpen(false)}>×</button>
            <input
              type="text"
              className="search-input-overlay"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="search-results-list">
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p style={{ color: '#999', marginTop: 40 }}>No products found</p>
            )}
            {searchResults.map((p) => (
              <div
                key={p.slug}
                className="search-results-item"
                onClick={() => { router.push(`/products/${p.slug}`); setSearchOpen(false); }}
              >
                {p.title}
              </div>
            ))}
          </div>
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
