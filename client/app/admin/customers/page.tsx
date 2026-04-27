'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminGetCustomers } from '@/lib/api';
import type { Customer } from '@/types';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('newest');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetCustomers({ search: search || undefined, sort, page }) as any;
      setCustomers(res.customers || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const fmt = (n: number) => `Rs.${(n || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 20px; font-weight: 600; color: #111; }
        .controls-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-input {
          flex: 1; padding: 9px 12px; border: 1px solid #e0dfd8;
          background: #fff; font-size: 13px; font-family: inherit; outline: none; max-width: 300px;
        }
        .search-input:focus { border-color: #111; }
        .action-btn {
          padding: 8px 14px; background: #111; color: #fff; border: none;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: inherit;
        }
        .select-input {
          padding: 9px 12px; border: 1px solid #e0dfd8; background: #fff;
          font-size: 12px; font-family: inherit; outline: none; cursor: pointer;
        }
        .select-input:focus { border-color: #111; }
        .table-wrap { background: #fff; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 700px; }
        th { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; text-align: left; padding: 12px 16px; border-bottom: 2px solid #f0ede6; }
        td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f5f4f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #faf9f7; }
        .customer-name { font-weight: 500; }
        .customer-email { font-size: 11px; color: #aaa; }
        .stat-val { font-weight: 600; }
        .stat-sub { font-size: 11px; color: #aaa; }
        .badge { display: inline-block; padding: 2px 8px; font-size: 10px; border-radius: 2px; }
        .badge-active { background: #e8f5e9; color: #2e7d32; }
        .badge-none { background: #f5f4f0; color: #888; }
        .pagination { display: flex; gap: 8px; margin-top: 20px; align-items: center; }
        .page-btn { padding: 6px 12px; border: 1px solid #ddd; background: none; font-size: 12px; cursor: pointer; font-family: inherit; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 60px; color: #bbb; font-size: 14px; }
      `}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{total} registered customers</div>
        </div>
      </div>

      <div className="controls-row">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="action-btn">Search</button>
          {search && (
            <button type="button" className="action-btn" style={{ background: '#888' }} onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
              Clear
            </button>
          )}
        </form>
        <select className="select-input" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">{search ? `No customers found for "${search}"` : 'No customers yet.'}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="customer-name">{c.name || '(No name)'}</div>
                    <div className="customer-email">{c.email}</div>
                  </td>
                  <td style={{ color: '#666', fontSize: 12 }}>{c.phone || '—'}</td>
                  <td>
                    <div className="stat-val">{c.totalOrders}</div>
                    <div className="stat-sub">orders</div>
                  </td>
                  <td>
                    <div className="stat-val">{fmt(c.totalSpent)}</div>
                  </td>
                  <td style={{ fontSize: 11, color: '#aaa' }}>
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontSize: 11, color: '#aaa' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${c.isActive !== false ? 'badge-active' : 'badge-none'}`}>
                      {c.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
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
