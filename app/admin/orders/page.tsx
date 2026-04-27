'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { adminGetOrders, adminUpdateOrderStatus } from '@/lib/api';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f39c12',
  paid: '#27ae60',
  shipped: '#3498db',
  delivered: '#2ecc71',
  cancelled: '#e74c3c',
};

export default function AdminOrders() {
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/admin';
    }
  }, [isAuthenticated, user]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders({ status: statusFilter || undefined, page }) as any;
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(id: string, status: string) {
    const trackingNumber = status === 'shipped' ? prompt('Tracking number (optional):') || undefined : undefined;
    try {
      await adminUpdateOrderStatus(id, status, trackingNumber);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
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
        table { width: 100%; border-collapse: collapse; min-width: 700px; }
        th { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; text-align: left; padding: 12px 16px; border-bottom: 2px solid #f0ede6; }
        td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f5f4f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #faf9f7; }
        .order-id { font-family: monospace; font-size: 11px; color: #888; }
        .status-badge { display: inline-block; padding: 3px 9px; font-size: 10px; letter-spacing: 0.5px; border-radius: 2px; color: #fff; }
        .status-select { padding: 5px 8px; border: 1px solid #ddd; font-size: 11px; background: #f5f4f0; cursor: pointer; font-family: inherit; outline: none; }
        .status-select:focus { border-color: #111; }
        .pagination { display: flex; gap: 8px; margin-top: 20px; align-items: center; }
        .page-btn { padding: 6px 12px; border: 1px solid #ddd; background: none; font-size: 12px; cursor: pointer; font-family: inherit; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 60px; color: #bbb; font-size: 14px; }
      `}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{total} orders</div>
        </div>
        <button onClick={fetchOrders} style={{ background: 'none', border: '1px solid #ddd', padding: '7px 14px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
          Refresh
        </button>
      </div>

      <div className="filter-tabs">
        {['', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            className={`filter-btn${statusFilter === s ? ' active' : ''}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No orders found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td className="order-id">#{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{o.customerEmail}</div>
                  </td>
                  <td style={{ color: '#666' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600 }}>Rs.{o.totalAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLORS[o.status] || '#999' }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: '#aaa' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={e => updateStatus(o._id, e.target.value)}
                    >
                      {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
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
