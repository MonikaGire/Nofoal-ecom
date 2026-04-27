'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminGetDashboard } from '@/lib/api';
import type { DashboardMetrics, RevenueChartPoint, OrderStatusCount, TopProduct, Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f39c12',
  paid: '#27ae60',
  shipped: '#3498db',
  delivered: '#2ecc71',
  cancelled: '#e74c3c',
};

const PIE_COLORS = ['#111', '#555', '#888', '#bbb', '#e74c3c'];

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: '#fff',
      padding: '20px 24px',
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || '#111', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
  const [statusChart, setStatusChart] = useState<OrderStatusCount[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    setError('');
    try {
      const res = await adminGetDashboard() as any;
      setMetrics(res.metrics);
      setRevenueChart(res.revenueChart || []);
      setStatusChart(res.orderStatusChart || []);
      setTopProducts(res.topProducts || []);
      setRecentOrders(res.recentOrders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number) => `Rs.${(n || 0).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#999', fontSize: 14 }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#c0392b', fontSize: 14, padding: 16, background: '#fff3f3' }}>
        {error} — <button onClick={fetchDashboard} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: '#c0392b' }}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .dash-section-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin: 28px 0 14px; }
        .dash-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .dash-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
        .dash-card { background: #fff; padding: 24px; }
        .dash-card-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 18px; }
        .dash-table { width: 100%; border-collapse: collapse; }
        .dash-table th { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #bbb; text-align: left; padding: 6px 0; border-bottom: 1px solid #f0ede6; }
        .dash-table td { font-size: 13px; padding: 10px 0; border-bottom: 1px solid #f8f6f2; vertical-align: middle; }
        .dash-table tr:last-child td { border-bottom: none; }
        .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }
        @media (max-width: 1100px) { .dash-grid-4 { grid-template-columns: repeat(2,1fr); } .dash-grid-3 { grid-template-columns: repeat(2,1fr); } .dash-grid-2 { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .dash-grid-4, .dash-grid-3 { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: '#111' }}>Dashboard</div>
      <div style={{ fontSize: 12, color: '#999', marginBottom: 28 }}>Welcome back, here&apos;s your store overview.</div>

      {/* Revenue */}
      <div className="dash-section-title">Revenue</div>
      <div className="dash-grid-3">
        <MetricCard label="Today" value={fmt(metrics?.revenue.today || 0)} />
        <MetricCard label="This Month" value={fmt(metrics?.revenue.month || 0)} />
        <MetricCard label="This Year" value={fmt(metrics?.revenue.year || 0)} />
      </div>

      {/* KPIs */}
      <div className="dash-section-title">Key Metrics</div>
      <div className="dash-grid-4">
        <MetricCard label="Total Orders" value={String(metrics?.orders.total || 0)} sub={`${metrics?.orders.today || 0} today`} />
        <MetricCard label="Pre-Orders" value={String(metrics?.preorders.total || 0)} sub={`${metrics?.preorders.pending || 0} pending`} />
        <MetricCard label="Customers" value={String(metrics?.customers.total || 0)} sub={`+${metrics?.customers.newThisMonth || 0} this month`} />
        <MetricCard
          label="Low Stock Alerts"
          value={String(metrics?.products.lowStock || 0)}
          sub={`of ${metrics?.products.total || 0} products`}
          accent={(metrics?.products.lowStock || 0) > 0 ? '#e74c3c' : '#111'}
        />
      </div>

      {/* Charts */}
      <div className="dash-section-title">Revenue — Last 7 Days</div>
      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-title">Revenue Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#bbb' }} />
              <YAxis tick={{ fontSize: 10, fill: '#bbb' }} tickFormatter={v => v >= 1000 ? `${v / 1000}k` : String(v)} />
              <Tooltip formatter={(v: any) => [`Rs.${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} dot={{ r: 3, fill: '#111' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Orders by Status</div>
          {statusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusChart} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={75}>
                  {statusChart.map((entry, idx) => (
                    <Cell key={entry._id} fill={STATUS_COLORS[entry._id] || PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: '#ccc', paddingTop: 70, fontSize: 13 }}>No order data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="dash-section-title">Activity</div>
      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-title">Recent Orders</div>
          <table className="dash-table">
            <thead>
              <tr><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#ccc', paddingTop: 20, paddingBottom: 20 }}>No orders yet</td></tr>
              ) : recentOrders.slice(0, 8).map((o: any) => (
                <tr key={o._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                    <div style={{ fontSize: 11, color: '#bbb' }}>{o.customerEmail}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmt(o.totalAmount)}</td>
                  <td>
                    <span className="status-dot" style={{ background: STATUS_COLORS[o.status] || '#999' }} />
                    <span style={{ fontSize: 11 }}>{o.status}</span>
                  </td>
                  <td style={{ fontSize: 11, color: '#aaa' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length > 0 && (
            <a href="/admin/orders" style={{ display: 'inline-block', marginTop: 16, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#111', textDecoration: 'none', borderBottom: '1px solid #111' }}>
              All Orders →
            </a>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Top Products (30d)</div>
          <table className="dash-table">
            <thead>
              <tr><th>Product</th><th>Sold</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#ccc', paddingTop: 20, paddingBottom: 20 }}>No data yet</td></tr>
              ) : topProducts.map((p) => (
                <tr key={String(p._id)}>
                  <td style={{ fontSize: 12 }}>{p.productName}</td>
                  <td style={{ fontWeight: 600 }}>{p.totalSold}</td>
                  <td style={{ fontSize: 12 }}>{fmt(p.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topProducts.length > 0 && (
            <a href="/admin/analytics" style={{ display: 'inline-block', marginTop: 16, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#111', textDecoration: 'none', borderBottom: '1px solid #111' }}>
              Full Analytics →
            </a>
          )}
        </div>
      </div>
    </>
  );
}
