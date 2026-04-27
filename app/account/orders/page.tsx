'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getUserOrders, cancelOrder } from '@/lib/api';

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#10b981',
  shipped: '#3b82f6',
  delivered: '#6366f1',
  cancelled: '#ef4444',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    getUserOrders()
      .then(res => setOrders(res.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [mounted, isAuthenticated]);

  async function handleCancel(orderId: string) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(orderId);
    try {
      await cancelOrder(orderId);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err: any) {
      alert(err.message || 'Could not cancel order. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  function getTimeLeft(createdAt: string): { expired: boolean; label: string } {
    const WINDOW_MS = (23 * 60 + 59) * 60 * 1000; // 23h 59m
    const remaining = WINDOW_MS - (Date.now() - new Date(createdAt).getTime());
    if (remaining <= 0) return { expired: true, label: '' };
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return { expired: false, label: `${minutes}m left to cancel` };
    return { expired: false, label: `${hours}h ${minutes}m left to cancel` };
  }

  if (!mounted) return null;

  return (
    <>
      <link rel="stylesheet" href="/css/common.css" />
      <style suppressHydrationWarning>{`
        body { background: #f5f4f0; color: #111; font-family: 'Roboto', sans-serif; }
        nav { background-color: #f5f4f0; }
        nav a { color: #111; }
        nav a::after { background: #111; }
        .menu-toggle span { background: #111; }
        .navbar-icon svg { stroke: #111; }

        .orders-wrap {
          max-width: 900px;
          margin: 110px auto 80px;
          padding: 0 24px;
        }

        .orders-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 32px;
          border-bottom: 1px solid #e0dfd8;
          padding-bottom: 16px;
        }

        .orders-header h1 {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #111;
        }

        .orders-header span {
          font-size: 12px;
          color: #999;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Auth wall */
        .auth-wall {
          text-align: center;
          padding: 80px 20px;
          background: #fff;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .auth-wall h2 { font-size: 20px; margin-bottom: 10px; }
        .auth-wall p { font-size: 14px; color: #666; margin-bottom: 24px; }
        .auth-wall a {
          background: #111; color: #fff; padding: 12px 28px;
          text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          display: inline-block;
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #fff;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .empty-state p { font-size: 14px; color: #888; margin-bottom: 24px; }
        .empty-state a {
          background: #111; color: #fff; padding: 12px 28px;
          text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
          display: inline-block;
        }

        /* Order cards */
        .order-card {
          background: #fff;
          margin-bottom: 16px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px));
        }

        .order-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid #f0ede6;
          flex-wrap: wrap;
          gap: 8px;
        }

        .order-meta { display: flex; gap: 32px; align-items: center; flex-wrap: wrap; gap: 16px; }

        .order-id {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          letter-spacing: 0.5px;
        }

        .order-date {
          font-size: 11px;
          color: #999;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .order-total {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 4px 12px;
          color: #fff;
        }

        .order-items { padding: 16px 24px; }

        .order-item-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 0;
          border-bottom: 1px solid #f5f4f0;
        }
        .order-item-row:last-child { border-bottom: none; }

        .order-item-img {
          width: 56px;
          height: 56px;
          object-fit: cover;
          flex-shrink: 0;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }

        .order-item-img-placeholder {
          width: 56px;
          height: 56px;
          background: #f0ede6;
          flex-shrink: 0;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 6px 100%, 0 calc(100% - 6px));
        }

        .order-item-name {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          color: #111;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-item-qty {
          font-size: 12px;
          color: #999;
          white-space: nowrap;
        }

        .order-item-price {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
        }

        .order-card-footer {
          padding: 12px 24px;
          background: #faf9f6;
          border-top: 1px solid #f0ede6;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .shipping-addr {
          font-size: 11px;
          color: #888;
          flex: 1;
          line-height: 1.5;
        }

        .tracking-info {
          font-size: 11px;
          color: #3b82f6;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        /* Order tracking timeline */
        .tracking-timeline {
          padding: 20px 24px 16px;
          border-top: 1px solid #f0ede6;
        }

        .tracking-timeline-label {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 16px;
        }

        .timeline-steps {
          display: flex;
          align-items: center;
          gap: 0;
          width: 100%;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .timeline-step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 12px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #e0dfd8;
          z-index: 0;
        }

        .timeline-step.done:not(:last-child)::after {
          background: #111;
        }

        .step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e0dfd8;
          border: 2px solid #e0dfd8;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          position: relative;
          flex-shrink: 0;
        }

        .timeline-step.done .step-dot {
          background: #111;
          border-color: #111;
        }

        .timeline-step.active .step-dot {
          background: #fff;
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.08);
        }

        .step-dot svg { width: 11px; height: 11px; }

        .step-label {
          font-size: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #bbb;
          margin-top: 6px;
          text-align: center;
          white-space: nowrap;
        }

        .timeline-step.done .step-label,
        .timeline-step.active .step-label {
          color: #111;
          font-weight: 600;
        }

        .timeline-step.cancelled .step-dot {
          background: #ef4444;
          border-color: #ef4444;
        }

        .timeline-step.cancelled .step-label { color: #ef4444; font-weight: 600; }

        .cancel-btn {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #c0392b;
          border: 1px solid #c0392b;
          background: none;
          padding: 5px 14px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .cancel-btn:hover { background: #c0392b; color: #fff; }
        .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .cancel-window {
          font-size: 10px;
          color: #e67e22;
          letter-spacing: 0.5px;
        }

        .spinner {
          display: flex;
          justify-content: center;
          padding: 60px;
        }

        @media (max-width: 600px) {
          .orders-wrap { margin: 90px auto 60px; padding: 0 16px; }
          .order-card-header { padding: 14px 16px; }
          .order-items { padding: 12px 16px; }
          .order-card-footer { padding: 10px 16px; }
          .order-meta { gap: 10px; }
        }
      `}</style>

      <div className="orders-wrap">
        <div className="orders-header">
          <h1>My Orders</h1>
          {user && <span>{user.name}</span>}
        </div>

        {!isAuthenticated ? (
          <div className="auth-wall">
            <h2>Sign in to view your orders</h2>
            <p>You need to be logged in to see your order history.</p>
            <a href="/auth/login">Sign In →</a>
          </div>
        ) : loading ? (
          <div className="spinner">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>You haven't placed any orders yet.</p>
            <a href="/products">Start Shopping →</a>
          </div>
        ) : (
          orders.map((order: any) => {
            const shortId = order._id?.toString().slice(-8).toUpperCase();
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });
            const statusColor = STATUS_COLOR[order.status] || '#999';

            const STEPS = ['pending', 'paid', 'shipped', 'delivered'];
            const currentStep = STEPS.indexOf(order.status);
            const isCancelled = order.status === 'cancelled';

            return (
              <div className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-id">#{shortId}</span>
                    <span className="order-date">{date}</span>
                    <span className="order-total">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="status-badge" style={{ background: statusColor }}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>

                <div className="order-items">
                  {(order.items || []).map((item: any, idx: number) => (
                    <div className="order-item-row" key={idx}>
                      {item.coverImage
                        ? <img className="order-item-img" src={item.coverImage} alt={item.productName} />
                        : <div className="order-item-img-placeholder" />
                      }
                      <span className="order-item-name">{item.productName}</span>
                      <span className="order-item-qty">× {item.quantity}</span>
                      <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking Timeline */}
                <div className="tracking-timeline">
                  <div className="tracking-timeline-label">Order Tracking</div>
                  {isCancelled ? (
                    <div className="timeline-steps">
                      <div className="timeline-step cancelled">
                        <div className="step-dot">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </div>
                        <span className="step-label">Cancelled</span>
                      </div>
                    </div>
                  ) : (
                    <div className="timeline-steps">
                      {[
                        { key: 'pending', label: 'Placed' },
                        { key: 'paid', label: 'Confirmed' },
                        { key: 'shipped', label: 'Shipped' },
                        { key: 'delivered', label: 'Delivered' },
                      ].map((step, idx) => {
                        const isDone = currentStep > idx;
                        const isActive = currentStep === idx;
                        return (
                          <div
                            key={step.key}
                            className={`timeline-step${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}
                          >
                            <div className="step-dot">
                              {isDone && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                              {isActive && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111' }} />
                              )}
                            </div>
                            <span className="step-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  {order.shippingAddress && (
                    <span className="shipping-addr">Ships to: {order.shippingAddress.split('\n')[0]}</span>
                  )}
                  {order.trackingNumber && (
                    <span className="tracking-info">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      Tracking: {order.trackingNumber}
                    </span>
                  )}

                  {/* Cancel button — only for pending/paid within 23h 59m */}
                  {['pending', 'paid'].includes(order.status) && (() => {
                    const { expired, label } = getTimeLeft(order.createdAt);
                    return !expired ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                        <span className="cancel-window">{label}</span>
                        <button
                          className="cancel-btn"
                          disabled={cancelling === order._id}
                          onClick={() => handleCancel(order._id)}
                        >
                          {cancelling === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
