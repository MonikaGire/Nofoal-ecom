'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminGetPreorders, adminUpdatePreorderStatus } from '@/lib/api';
import type { PreOrder } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f39c12',
  payment_sent: '#3498db',
  paid: '#27ae60',
  failed: '#e74c3c',
  expired: '#95a5a6',
};

export default function AdminPreorders() {
  const { isAuthenticated, user } = useAuthStore();
  const [preorders, setPreorders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/admin';
    }
  }, [isAuthenticated, user]);

  const fetchPreorders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetPreorders({ status: filter || undefined, page }) as any;
      setPreorders(res.preorders || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchPreorders(); }, [fetchPreorders]);

  async function updateStatus(id: string, status: string) {
    try {
      await adminUpdatePreorderStatus(id, status);
      setPreorders(prev => prev.map(p => p._id === id ? { ...p, status } : p));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 20px; font-weight: 600; color: #111; }
        .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
        .filter-btn { padding: 6px 14px; border: 1px solid #ddd; background: none; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: inherit; color: #888; }
        .filter-btn.active { background: #111; color: #fff; border-color: #111; }
        .filter-btn:hover:not(.active) { border-color: #888; color: #111; }
        .table-wrap { background: #fff; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 750px; }
        th { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; text-align: left; padding: 12px 16px; border-bottom: 2px solid #f0ede6; }
        td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f5f4f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #faf9f7; }
        .status-badge { display: inline-block; padding: 3px 9px; font-size: 10px; letter-spacing: 0.5px; border-radius: 2px; color: #fff; }
        .status-select { padding: 5px 8px; border: 1px solid #ddd; font-size: 11px; background: #f5f4f0; cursor: pointer; font-family: inherit; outline: none; }
        .status-select:focus { border-color: #111; }
        .payment-link { font-size: 11px; color: #3498db; text-decoration: none; }
        .payment-link:hover { text-decoration: underline; }
        .pagination { display: flex; gap: 8px; margin-top: 20px; align-items: center; }
        .page-btn { padding: 6px 12px; border: 1px solid #ddd; background: none; font-size: 12px; cursor: pointer; font-family: inherit; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 60px; color: #bbb; font-size: 14px; }
      `}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Pre-Orders</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{total} pre-orders</div>
        </div>
        <button onClick={fetchPreorders} style={{ background: 'none', border: '1px solid #ddd', padding: '7px 14px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
          Refresh
        </button>
      </div>

      <div className="filter-tabs">
        {['', 'pending', 'payment_sent', 'paid', 'failed', 'expired'].map(s => (
          <button
            key={s}
            className={`filter-btn${filter === s ? ' active' : ''}`}
            onClick={() => { setFilter(s); setPage(1); }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : preorders.length === 0 ? (
          <div className="empty-state">No pre-orders found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Link</th>
                <th>Date</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {preorders.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{p.email}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{p.phone}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{p.productName}</td>
                  <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                  <td style={{ fontWeight: 600 }}>Rs.{p.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLORS[p.status] || '#999' }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.paymentLinkUrl ? (
                      <a href={p.paymentLinkUrl} target="_blank" rel="noreferrer" className="payment-link">
                        View →
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: 11, color: '#aaa' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="status-select"
                      value={p.status}
                      onChange={e => updateStatus(p._id, e.target.value)}
                    >
                      {['pending', 'payment_sent', 'paid', 'failed', 'expired'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ fontSize: 12, color: '#888' }}>Page {page} of {pages}</span>
          <button className="page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
        </div>
      )}
    </>
  );
}
