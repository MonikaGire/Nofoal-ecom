'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminGetAllProducts, adminUpdateProduct } from '@/lib/api';
import type { Product } from '@/types';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetAllProducts({ page: 1 }) as any;
      setProducts((res.products || []).filter((p: Product) => p.isActive));
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const filteredProducts = products.filter(p => {
    if (filter === 'out') return p.inventory === 0;
    if (filter === 'low') return p.inventory > 0 && p.inventory <= 10;
    return true;
  });

  const outOfStock = products.filter(p => p.inventory === 0).length;
  const lowStock = products.filter(p => p.inventory > 0 && p.inventory <= 10).length;
  const inStock = products.filter(p => p.inventory > 10).length;

  function startEdit(id: string, currentVal: number) {
    setEditing(id);
    setEditValue(String(currentVal));
  }

  async function saveEdit(id: string) {
    const val = parseInt(editValue);
    if (isNaN(val) || val < 0) { alert('Enter a valid number'); return; }
    setSaving(true);
    try {
      await adminUpdateProduct(id, { inventory: val } as any);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, inventory: val } : p));
      setEditing(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function getStockStatus(inventory: number) {
    if (inventory === 0) return { label: 'Out of Stock', color: '#e74c3c', bg: '#ffebee' };
    if (inventory <= 10) return { label: 'Low Stock', color: '#e65100', bg: '#fff3e0' };
    return { label: 'In Stock', color: '#2e7d32', bg: '#e8f5e9' };
  }

  return (
    <>
      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-size: 20px; font-weight: 600; color: #111; }
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .kpi-card { background: #fff; padding: 16px 20px; clip-path: polygon(0 0,100% 0,100% 100%,8px 100%,0 calc(100% - 8px)); }
        .kpi-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 6px; }
        .kpi-val { font-size: 24px; font-weight: 700; }
        .filter-tabs { display: flex; gap: 6px; margin-bottom: 18px; }
        .filter-btn {
          padding: 6px 14px; border: 1px solid #ddd; background: none;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: inherit; color: #888;
        }
        .filter-btn.active { background: #111; color: #fff; border-color: #111; }
        .table-wrap { background: #fff; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; text-align: left; padding: 12px 16px; border-bottom: 2px solid #f0ede6; }
        td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f5f4f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #faf9f7; }
        .badge { display: inline-block; padding: 2px 9px; font-size: 10px; border-radius: 2px; font-weight: 500; }
        .edit-qty { display: flex; align-items: center; gap: 6px; }
        .qty-input { width: 70px; padding: 5px 8px; border: 1px solid #ddd; font-size: 13px; font-family: inherit; outline: none; }
        .qty-input:focus { border-color: #111; }
        .qty-btn { padding: 5px 10px; border: none; cursor: pointer; font-size: 11px; font-family: inherit; }
        .qty-save { background: #111; color: #fff; }
        .qty-cancel { background: #f0ede6; color: #666; }
        .edit-link { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #888; cursor: pointer; border-bottom: 1px solid #ddd; background: none; border-top: none; border-left: none; border-right: none; padding: 0; font-family: inherit; }
        .edit-link:hover { color: #111; border-bottom-color: #111; }
        .empty-state { text-align: center; padding: 60px; color: #bbb; font-size: 14px; }
        @media (max-width: 768px) { .kpi-row { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="page-header">
        <div>
          <div className="page-title">Inventory</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{total} total products</div>
        </div>
        <button onClick={fetchInventory} style={{ background: 'none', border: '1px solid #ddd', padding: '7px 14px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-label">Total Products</div>
          <div className="kpi-val">{products.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In Stock</div>
          <div className="kpi-val" style={{ color: '#2e7d32' }}>{inStock}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Low Stock ≤10</div>
          <div className="kpi-val" style={{ color: '#e65100' }}>{lowStock}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Out of Stock</div>
          <div className="kpi-val" style={{ color: '#c62828' }}>{outOfStock}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {(['all', 'low', 'out'] as const).map(f => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'low' ? `Low Stock (${lowStock})` : `Out of Stock (${outOfStock})`}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty-state">Loading inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">No products match this filter.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const status = getStockStatus(p.inventory);
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{p.slug}</div>
                    </td>
                    <td style={{ color: '#666', fontSize: 12 }}>{p.category || '—'}</td>
                    <td style={{ fontWeight: 600 }}>Rs.{p.price?.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ fontSize: 18, fontWeight: 700, color: status.color }}>{p.inventory}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                    </td>
                    <td>
                      {editing === p._id ? (
                        <div className="edit-qty">
                          <input
                            className="qty-input"
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            autoFocus
                          />
                          <button className="qty-btn qty-save" onClick={() => saveEdit(p._id)} disabled={saving}>
                            {saving ? '...' : 'Save'}
                          </button>
                          <button className="qty-btn qty-cancel" onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="edit-link" onClick={() => startEdit(p._id, p.inventory)}>
                          Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
