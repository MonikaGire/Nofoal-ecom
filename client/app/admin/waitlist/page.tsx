'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

type WaitlistEntry = {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
};

export default function AdminWaitlistPage() {
  const { token } = useAuthStore();
  const [list, setList] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  async function fetchWaitlist(q = '') {
    setLoading(true);
    try {
      const qs = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await fetch(`/api/customers/waitlist${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setList(data.waitlist || []);
      setTotal(data.total || 0);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWaitlist(); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchWaitlist(search);
  }

  const cell: React.CSSProperties = {
    padding: '14px 16px', fontSize: 13, color: '#111',
    borderBottom: '1px solid #f0ede6', verticalAlign: 'middle',
  };
  const hcell: React.CSSProperties = {
    padding: '10px 16px', fontSize: 10, fontWeight: 700,
    letterSpacing: 1.5, textTransform: 'uppercase', color: '#888',
    borderBottom: '2px solid #e8e6de', background: '#faf9f6',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#111' }}>Waitlist</h1>
          <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0' }}>{total} {total === 1 ? 'person' : 'people'} on the list</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              padding: '8px 14px', border: '1px solid #e0dfd8', borderRight: 'none',
              background: '#fff', fontSize: 12, fontFamily: 'inherit',
              outline: 'none', width: 240, color: '#111',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px', background: '#111', color: '#fff', border: 'none',
              fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); fetchWaitlist(''); }}
              style={{
                padding: '8px 12px', background: '#f5f4f0', color: '#666',
                border: '1px solid #e0dfd8', borderLeft: 'none', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading...</div>
        ) : list.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            {search ? 'No results found.' : 'No waitlist signups yet.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={hcell}>#</th>
                <th style={hcell}>Email</th>
                <th style={hcell}>Name</th>
                <th style={hcell}>Signed Up</th>
                <th style={{ ...hcell, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((entry, i) => (
                <tr key={entry._id} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#faf9f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...cell, color: '#bbb', width: 40 }}>{i + 1}</td>
                  <td style={{ ...cell, fontWeight: 500 }}>{entry.email}</td>
                  <td style={{ ...cell, color: entry.name ? '#111' : '#bbb' }}>
                    {entry.name || '—'}
                  </td>
                  <td style={{ ...cell, color: '#888' }}>
                    {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td style={{ ...cell, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px',
                      background: '#f0fdf4', color: '#16a34a',
                      fontSize: 10, letterSpacing: 1.5, fontWeight: 600,
                      textTransform: 'uppercase', border: '1px solid #86efac',
                    }}>
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {list.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 11, color: '#aaa', textAlign: 'right' }}>
          Showing {list.length} of {total}
        </div>
      )}
    </div>
  );
}
