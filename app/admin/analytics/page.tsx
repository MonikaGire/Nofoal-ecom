'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { adminGetSalesAnalytics } from '@/lib/api';

const PIE_COLORS = ['#111', '#444', '#777', '#aaa', '#ddd'];

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '1y', label: 'This Year' },
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30d');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminGetSalesAnalytics(period) as any;
      // Format sales chart data
      const formatted = (res.salesData || []).map((d: any) => ({
        label: d._id.day
          ? `${d._id.day}/${d._id.month}`
          : d._id.week
          ? `W${d._id.week}`
          : `${d._id.month}/${d._id.year}`,
        revenue: d.revenue,
        orders: d.orders,
      }));
      setSalesData(formatted);
      setTopProducts(res.topProducts || []);
      setCategoryRevenue((res.categoryRevenue || []).filter((c: any) => c._id));
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const fmt = (n: number) => `Rs.${(n || 0).toLocaleString('en-IN')}`;

  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <>
      <style>{`
        .analytics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .page-title { font-size: 20px; font-weight: 600; color: #111; }
        .period-tabs { display: flex; gap: 4px; }
        .period-btn {
          padding: 6px 14px; border: 1px solid #ddd; background: none;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; font-family: inherit; color: #888;
        }
        .period-btn.active { background: #111; color: #fff; border-color: #111; }
        .period-btn:hover:not(.active) { border-color: #888; color: #111; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
        .kpi-card { background: #fff; padding: 20px 24px; clip-path: polygon(0 0,100% 0,100% 100%,10px 100%,0 calc(100% - 10px)); }
        .kpi-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 8px; }
        .kpi-value { font-size: 26px; font-weight: 700; color: #111; }
        .section-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin: 24px 0 14px; }
        .chart-card { background: #fff; padding: 24px; margin-bottom: 24px; }
        .chart-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #aaa; margin-bottom: 18px; }
        .charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #aaa; text-align: left; padding: 8px 0; border-bottom: 1px solid #f0ede6; }
        .data-table td { font-size: 13px; padding: 10px 0; border-bottom: 1px solid #f5f4f0; }
        .data-table tr:last-child td { border-bottom: none; }
        .loading-state { text-align: center; padding: 60px; color: #aaa; font-size: 14px; }
        .error-state { color: #c0392b; padding: 14px; background: #fff3f3; font-size: 13px; margin-bottom: 20px; }
        .revenue-bar { background: #e0dfd8; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 6px; }
        .revenue-fill { background: #111; height: 100%; }
        @media (max-width: 900px) { .charts-row { grid-template-columns: 1fr; } .kpi-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="analytics-header">
        <div>
          <div className="page-title">Analytics</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Sales performance overview</div>
        </div>
        <div className="period-tabs">
          {PERIODS.map(p => (
            <button
              key={p.value}
              className={`period-btn${period === p.value ? ' active' : ''}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-state">{error} — <button onClick={fetchAnalytics} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: '#c0392b' }}>Retry</button></div>}

      {loading ? (
        <div className="loading-state">Loading analytics...</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{fmt(totalRevenue)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Orders</div>
              <div className="kpi-value">{totalOrders}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Order Value</div>
              <div className="kpi-value">{fmt(avgOrderValue)}</div>
            </div>
          </div>

          {/* Revenue trend chart */}
          <div className="section-title">Revenue Trend</div>
          <div className="chart-card">
            <div className="chart-title">Revenue over time</div>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#bbb' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#bbb' }} tickFormatter={v => v >= 1000 ? `${v / 1000}k` : String(v)} />
                  <Tooltip formatter={(v: any) => [`Rs.${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#ccc', padding: '40px 0', fontSize: 13 }}>No sales data for this period</div>
            )}
          </div>

          {/* Orders trend */}
          <div className="section-title">Orders Trend</div>
          <div className="chart-card">
            <div className="chart-title">Orders over time</div>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#bbb' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#bbb' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#111" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#ccc', padding: '40px 0', fontSize: 13 }}>No order data for this period</div>
            )}
          </div>

          {/* Top products + Category */}
          <div className="section-title">Product & Category Performance</div>
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-title">Top Products by Revenue</div>
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#ccc', padding: '24px 0' }}>No data</td></tr>
                  ) : topProducts.map((p, i) => {
                    const maxRev = topProducts[0]?.totalRevenue || 1;
                    return (
                      <tr key={String(p._id)}>
                        <td style={{ color: '#aaa', fontSize: 12, width: 24 }}>{i + 1}</td>
                        <td>
                          <div>{p.productName}</div>
                          <div className="revenue-bar" style={{ maxWidth: 160 }}>
                            <div className="revenue-fill" style={{ width: `${(p.totalRevenue / maxRev) * 100}%` }} />
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.totalSold}</td>
                        <td>{fmt(p.totalRevenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="chart-card">
              <div className="chart-title">Revenue by Category</div>
              {categoryRevenue.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={categoryRevenue} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={70}>
                        {categoryRevenue.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`Rs.${Number(v).toLocaleString('en-IN')}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: 12 }}>
                    {categoryRevenue.map((c, idx) => (
                      <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f5f4f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                          {c._id || 'Uncategorized'}
                        </div>
                        <div style={{ fontWeight: 600 }}>{fmt(c.revenue)}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#ccc', padding: '40px 0', fontSize: 13 }}>No category data</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
