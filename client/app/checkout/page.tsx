'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder, verifyPayment } from '@/lib/api';
import AuthModal from '@/components/AuthModal';
import type { CartItem } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '', customer_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) setAuthOpen(true);
  }, [mounted, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        customer_name: user.name || '',
        customer_email: user.email || '',
        customer_phone: user.phone || '',
      }));
    }
  }, [user]);

  if (!mounted) return null;

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise(resolve => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await createOrder({
        customerName: form.customer_name,
        customerEmail: form.customer_email,
        customerPhone: form.customer_phone,
        shippingAddress: form.customer_address,
        items: items.map((item: CartItem) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          coverImage: item.coverImage,
        })),
        totalAmount: total,
      } as any);

      if (!res.razorpayOrderId || !res.razorpayKey) {
        throw new Error('Payment system unavailable. Please try again.');
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load payment gateway. Check your connection.');

      setLoading(false);

      const rzp = new (window as any).Razorpay({
        key: res.razorpayKey,
        amount: res.amount * 100,
        currency: 'INR',
        order_id: res.razorpayOrderId,
        name: 'NOFOAL',
        description: 'Order Payment',
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
          contact: form.customer_phone,
        },
        theme: { color: '#111111' },
        modal: { ondismiss: () => setError('Payment cancelled. Your order is saved — you can complete payment from your orders page.') },
        handler: async (response: any) => {
          setLoading(true);
          try {
            await verifyPayment({
              orderId: res.orderId,
              razorpayOrderId: res.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            window.location.href = `/order-confirmation?order_id=${res.orderId}&short_id=${res.shortId}`;
          } catch (err: any) {
            setError('Payment received but verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Unable to place order. Please try again.');
      setLoading(false);
    }
  };

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

        .checkout-wrap {
          max-width: 1200px;
          margin: 100px auto 80px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
          align-items: start;
        }

        .checkout-items h2 {
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #666; margin-bottom: 16px;
        }

        .cart-table { width: 100%; border-collapse: collapse; }
        .cart-table thead tr { border-bottom: 1px solid #ccc; }
        .cart-table th {
          font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: #666; padding: 0 0 12px; text-align: left;
        }
        .cart-table th:not(:first-child) { text-align: center; }
        .cart-table th:last-child { text-align: right; }
        .cart-table tbody tr { border-bottom: 1px solid #e0dfd8; vertical-align: top; }
        .cart-table td { padding: 20px 0; }
        .cart-table td:not(:first-child) { text-align: center; }
        .cart-table td:last-child { text-align: right; }

        .cart-product { display: flex; gap: 16px; align-items: flex-start; }
        .cart-img {
          width: 72px; height: 72px; object-fit: cover; flex-shrink: 0;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }
        .cart-product-name {
          font-size: 13px; font-weight: 600; color: #111;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
        }
        .cart-product-meta { font-size: 11px; color: #999; letter-spacing: 0.5px; }
        .cart-price { font-size: 14px; font-weight: 600; color: #111; }

        .checkout-sidebar { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 24px; }

        .order-summary {
          background: #fff; padding: 28px 24px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .order-summary h2 {
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #111; margin-bottom: 20px;
        }
        .summary-row {
          display: flex; justify-content: space-between;
          font-size: 13px; color: #444; padding: 8px 0; border-bottom: 1px solid #f0ede6;
        }
        .summary-row.total {
          border-bottom: none; font-size: 15px; font-weight: 700;
          color: #111; padding-top: 14px; margin-top: 4px;
        }
        .summary-row.total span:last-child { font-size: 18px; }

        .checkout-form {
          background: #fff; padding: 28px 24px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .checkout-form h2 {
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #111; margin-bottom: 20px;
        }
        .form-group { margin-bottom: 16px; }
        .form-group label {
          display: block; font-size: 10px; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 6px; color: #666;
        }
        .form-group input, .form-group textarea {
          width: 100%; padding: 10px 12px; border: 1px solid #e0dfd8;
          background: #f5f4f0; font-size: 13px; font-family: inherit;
          outline: none; resize: vertical; color: #111;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #111; background: #fff; }

        .submit-btn {
          width: 100%; background: #111; color: #fff; border: none;
          padding: 16px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; margin-top: 8px; transition: background 0.2s;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .submit-btn:hover { background: #333; }
        .submit-btn:disabled { background: #999; cursor: not-allowed; }

        .error-msg { color: #c0392b; font-size: 12px; margin-bottom: 12px; }

        .payment-icons {
          display: flex; gap: 8px; align-items: center;
          justify-content: center; margin-top: 16px; flex-wrap: wrap;
        }
        .payment-icon {
          font-size: 10px; color: #999; letter-spacing: 1px;
          border: 1px solid #ddd; padding: 4px 8px; text-transform: uppercase;
        }

        .success-box {
          grid-column: 1 / -1; text-align: center; padding: 60px 40px;
          background: #fff;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        .success-icon { font-size: 40px; margin-bottom: 16px; }
        .success-box h2 { font-size: 22px; margin-bottom: 8px; }
        .success-box p { font-size: 14px; color: #666; }
        .back-link {
          font-size: 12px; color: #fff; text-decoration: none;
          display: inline-block; margin-top: 20px; letter-spacing: 1px;
          background: #111; padding: 12px 28px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        @media (max-width: 900px) {
          .checkout-wrap { grid-template-columns: 1fr; gap: 24px; }
          .checkout-sidebar { position: static; }
        }
        @media (max-width: 600px) {
          .checkout-wrap { margin: 80px auto 60px; padding: 0 16px; }
          .cart-table th:nth-child(2), .cart-table td:nth-child(2) { display: none; }
          .cart-img { width: 56px; height: 56px; }
        }
      `}</style>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          if (!isAuthenticated) router.push('/products');
        }}
      />

      <div className="checkout-wrap">
        {!isAuthenticated ? (
          <div className="success-box">
            <div className="success-icon">🔒</div>
            <h2>Sign in to continue</h2>
            <p>Please sign in or create an account to place your order.</p>
            <button className="back-link" style={{ border: 'none', cursor: 'pointer', marginTop: 20 }} onClick={() => setAuthOpen(true)}>
              Sign In →
            </button>
          </div>
        ) : (
          <>
            {/* Left — Items Table */}
            <div className="checkout-items">
              <h2>Your Order</h2>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: CartItem) => (
                    <tr key={item.productId}>
                      <td>
                        <div className="cart-product">
                          <img className="cart-img" src={item.coverImage} alt={item.productName} />
                          <div>
                            <div className="cart-product-name">{item.productName}</div>
                            <div className="cart-product-meta">—</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#999', fontSize: '13px' }}>-</td>
                      <td style={{ fontSize: '13px', fontWeight: 600 }}>× {item.quantity}</td>
                      <td className="cart-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right — Summary + Form */}
            <div className="checkout-sidebar">
              <div className="checkout-form">
                <h2>Shipping Details</h2>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={form.customer_name}
                      onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                      required placeholder="Enter your full name" />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" value={form.customer_email}
                      onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                      required placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" value={form.customer_phone}
                      onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                      required placeholder="+91 9000-0000" />
                  </div>
                  <div className="form-group">
                    <label>Shipping Address *</label>
                    <textarea value={form.customer_address}
                      onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))}
                      required rows={3} placeholder="Street address, City, State, PIN Code" />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading || items.length === 0}>
                    {loading ? 'Processing...' : `Pay Now — ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </form>
                <div className="payment-icons">
                  <span className="payment-icon">Secured by Razorpay</span>
                </div>
              </div>

              <div className="order-summary">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Calculated at delivery</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
