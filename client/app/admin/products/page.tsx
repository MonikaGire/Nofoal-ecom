'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminGetAllProducts, adminDeleteProduct, adminPermanentDeleteProduct } from '@/lib/api';
import type { Product } from '@/types';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetAllProducts({ search: search || undefined, page }) as any;
      setProducts(res.products || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Deactivate "${title}"? It will be hidden from the store.`)) return;
    setDeleting(id);
    try {
      await adminDeleteProduct(id);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: false } : p));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handlePermanentDelete(id: string, title: string) {
    if (!confirm(`Permanently delete "${title}"?\n\nThis cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminPermanentDeleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      setTotal(prev => prev - 1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleReactivate(id: string) {
    try {
      const { adminUpdateProduct } = await import('@/lib/api');
      await adminUpdateProduct(id, { isActive: true } as any);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: true } : p));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <>
      <style>{`
        .products-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 20px; font-weight: 600; color: #111; }
        .btn-primary {
          display: inline-block; padding: 10px 20px;
          background: #111; color: #fff; text-decoration: none;
          font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
        }
        .btn-primary:hover { background: #333; }
        .search-form { display: flex; gap: 8px; margin-bottom: 20px; }
        .search-input {
          flex: 1; padding: 9px 12px; border: 1px solid #e0dfd8;
          background: #fff; font-size: 13px; font-family: inherit; outline: none; max-width: 320px;
        }
        .search-input:focus { border-color: #111; }
        .search-btn {
          padding: 9px 16px; background: #111; color: #fff; border: none;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; font-family: inherit;
        }
        .stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
        .stat-pill { background: #fff; padding: 6px 14px; font-size: 12px; color: #666; }
        .products-table-wrap { background: #fff; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 700px; }
        th { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #aaa; text-align: left; padding: 12px 16px; border-bottom: 2px solid #f0ede6; }
        td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid #f5f4f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #faf9f7; }
        .product-img { width: 44px; height: 44px; object-fit: cover; background: #f0ede6; }
        .product-title { font-weight: 500; margin-bottom: 2px; }
        .product-slug { font-size: 11px; color: #aaa; font-family: monospace; }
        .badge { display: inline-block; padding: 2px 8px; font-size: 10px; letter-spacing: 0.5px; border-radius: 2px; }
        .badge-active { background: #e8f5e9; color: #2e7d32; }
        .badge-inactive { background: #ffebee; color: #c62828; }
        .badge-low { background: #fff3e0; color: #e65100; }
        .action-btn {
          padding: 5px 10px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
          border: 1px solid #ddd; background: none; cursor: pointer; font-family: inherit;
          text-decoration: none; color: #111; display: inline-block;
        }
        .action-btn:hover { background: #111; color: #fff; border-color: #111; }
        .action-btn-danger { border-color: #e74c3c; color: #e74c3c; }
        .action-btn-danger:hover { background: #e74c3c; color: #fff; }
        .action-btn-success { border-color: #27ae60; color: #27ae60; }
        .action-btn-success:hover { background: #27ae60; color: #fff; }
        .action-btn-delete { border-color: #111; color: #111; background: none; }
        .action-btn-delete:hover { background: #111; color: #fff; }
        .pagination { display: flex; gap: 8px; margin-top: 20px; align-items: center; }
        .page-btn {
          padding: 6px 12px; border: 1px solid #ddd; background: none;
          font-size: 12px; cursor: pointer; font-family: inherit;
        }
        .page-btn.active { background: #111; color: #fff; border-color: #111; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .empty-state { text-align: center; padding: 60px; color: #bbb; font-size: 14px; }
      `}</style>

      <div className="products-header">
        <div>
          <div className="page-title">Products</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{total} total products</div>
        </div>
        <a href="/admin/products/new" className="btn-primary">+ Add Product</a>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, slug, category..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <button type="submit" className="search-btn">Search</button>
        {search && (
          <button type="button" className="search-btn" style={{ background: '#888' }} onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
            Clear
          </button>
        )}
      </form>

      <div className="products-table-wrap">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            {search ? `No products found for "${search}"` : 'No products yet.'}{' '}
            <a href="/admin/products/new" style={{ color: '#111' }}>Add one →</a>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.coverImage ? (
                        <img src={p.coverImage} alt={p.title} className="product-img" />
                      ) : (
                        <div className="product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 18 }}>📦</div>
                      )}
                      <div>
                        <div className="product-title">{p.title}</div>
                        <div className="product-slug">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#666' }}>{p.category || '—'}</td>
                  <td style={{ fontWeight: 600 }}>Rs.{p.price?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${p.inventory <= 0 ? 'badge-inactive' : p.inventory <= 10 ? 'badge-low' : 'badge-active'}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: '#aaa' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`/admin/products/${p._id}`} className="action-btn">Edit</a>
                      {p.isActive ? (
                        <button
                          className="action-btn action-btn-danger"
                          onClick={() => handleDelete(p._id, p.title)}
                          disabled={deleting === p._id}
                        >
                          {deleting === p._id ? '...' : 'Deactivate'}
                        </button>
                      ) : (
                        <button
                          className="action-btn action-btn-success"
                          onClick={() => handleReactivate(p._id)}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        className="action-btn action-btn-delete"
                        onClick={() => handlePermanentDelete(p._id, p.title)}
                        disabled={deleting === p._id}
                        title="Permanently delete"
                      >
                        {deleting === p._id ? '...' : 'Delete'}
                      </button>
                    </div>
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
