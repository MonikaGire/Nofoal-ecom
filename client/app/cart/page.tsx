'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import type { CartItem } from '@/types';

export default function CartPage() {
  const { items, total, removeItem, updateItem, clearCart, syncCart, isLoading } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    syncCart();
  }, []);

  if (!mounted) return null;

  return (
    <>
      <link rel="stylesheet" href="/css/common.css" />
      <style suppressHydrationWarning>{`
        body { background: #f5f4f0; color: #111; }
        nav { background-color: #f5f4f0; }
        nav a { color: #111; }
        nav a::after { background: #111; }
        .menu-toggle span { background: #111; }
        .navbar-icon svg { stroke: #111; }

        .cart-wrap {
          max-width: 1200px;
          margin: 100px auto 80px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }

        /* ---- Table ---- */
        .cart-table {
          width: 100%;
          border-collapse: collapse;
        }

        .cart-table thead tr {
          border-bottom: 1px solid #ccc;
        }

        .cart-table th {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #666;
          padding: 0 0 12px;
          text-align: left;
        }

        .cart-table th:not(:first-child) { text-align: center; }
        .cart-table th:last-child { text-align: right; }

        .cart-table tbody tr {
          border-bottom: 1px solid #e0dfd8;
          vertical-align: top;
        }

        .cart-table td {
          padding: 20px 0;
        }

        .cart-table td:not(:first-child) { text-align: center; }
        .cart-table td:last-child { text-align: right; }

        /* Product cell */
        .cart-product {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .cart-img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          flex-shrink: 0;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }

        .cart-product-info { flex: 1; }

        .cart-product-name {
          font-size: 13px;
          font-weight: 600;
          color: #111;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cart-product-meta {
          font-size: 11px;
          color: #999;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .cart-product-actions {
          display: flex;
          gap: 12px;
          font-size: 11px;
        }

        .cart-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          letter-spacing: 0.5px;
          color: #666;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .cart-action-btn:hover { color: #111; }

        /* Qty control */
        .qty-control {
          display: inline-flex;
          align-items: center;
          border: 1px solid #ccc;
          gap: 0;
        }

        .qty-btn {
          background: none;
          border: none;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 16px;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .qty-btn:hover { background: #eee; }

        .qty-num {
          width: 36px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          line-height: 32px;
        }

        .cart-price {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }

        /* Shipping notice */
        .shipping-notice {
          border: 1px dashed #9D9688;
          padding: 8px 12px;
          font-size: 11px;
          color: #666;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 8px;
          display: inline-block;
        }

        .cart-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 0;
          color: #999;
        }

        .cart-empty p { font-size: 14px; margin-bottom: 24px; }
        .cart-empty a {
          display: inline-block;
          background: #111;
          color: #fff;
          padding: 12px 32px;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        /* ---- Order Summary Sidebar ---- */
        .order-summary {
          background: #fff;
          padding: 28px 24px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          position: sticky;
          top: 100px;
        }

        .order-summary h2 {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #111;
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #444;
          padding: 8px 0;
          border-bottom: 1px solid #f0ede6;
        }

        .summary-row.total {
          border-bottom: none;
          font-size: 15px;
          font-weight: 700;
          color: #111;
          padding-top: 14px;
          margin-top: 4px;
        }

        .summary-row.total span:last-child {
          font-size: 18px;
        }

        .checkout-btn {
          display: block;
          width: 100%;
          background: #111;
          color: #fff;
          border: none;
          padding: 16px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 20px;
          transition: background 0.2s;
          text-align: center;
          text-decoration: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        .checkout-btn:hover { background: #333; }

        .payment-icons {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .payment-icon {
          font-size: 10px;
          color: #999;
          letter-spacing: 1px;
          border: 1px solid #ddd;
          padding: 4px 8px;
          text-transform: uppercase;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .cart-wrap { grid-template-columns: 1fr; gap: 24px; }
          .order-summary { position: static; }
        }

        @media (max-width: 600px) {
          .cart-wrap { margin: 80px auto 60px; padding: 0 16px; }
          .cart-table th, .cart-table td { padding: 14px 0; }
          .cart-table th:nth-child(3),
          .cart-table td:nth-child(3) { display: none; }
          .cart-img { width: 56px; height: 56px; }
          .cart-product-name { font-size: 12px; }
        }
      `}</style>

      <div className="cart-wrap">
        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <a href="/products">Browse Objects</a>
          </div>
        ) : (
          <>
            {/* Cart Table */}
            <div>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: CartItem) => (
                    <tr key={item.productId}>
                      <td>
                        <div className="cart-product">
                          <img className="cart-img" src={item.coverImage} alt={item.productName} />
                          <div className="cart-product-info">
                            <div className="cart-product-name">{item.productName}</div>
                            <div className="cart-product-meta">—</div>
                            <div className="cart-product-actions">
                              <button
                                className="cart-action-btn"
                                onClick={() => removeItem(item.productId)}
                                disabled={isLoading}
                              >Remove</button>
                              <button
                                className="cart-action-btn"
                                onClick={() => router.push('/products')}
                              >Save</button>
                            </div>
                            <div className="shipping-notice">Early Shipping:<br />This item will ship first</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#999', fontSize: '13px' }}>-</td>
                      <td className="cart-price">₹{item.price.toLocaleString('en-IN')}</td>
                      <td>
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateItem(item.productId, item.quantity - 1)}
                            disabled={isLoading}
                          >−</button>
                          <span className="qty-num">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateItem(item.productId, item.quantity + 1)}
                            disabled={isLoading || item.quantity >= 2}
                            title={item.quantity >= 2 ? 'Maximum 2 per order' : ''}
                            style={item.quantity >= 2 ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                          >+</button>
                        </div>
                        {item.quantity >= 2 && (
                          <div style={{ fontSize: 10, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>
                            Max 2 per order
                          </div>
                        )}
                      </td>
                      <td className="cart-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a href="/products" style={{ display: 'inline-block', marginTop: 20, fontSize: 11, letterSpacing: 1, color: '#666', textDecoration: 'none', textTransform: 'uppercase' }}>
                ← Back to Products
              </a>
            </div>

            {/* Order Summary Sidebar */}
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-row total">
                <span>Total (VAT included)</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <a href="/checkout" className="checkout-btn">Go to Checkout</a>

              <div className="payment-icons">
                <span className="payment-icon">G Pay</span>
                <span className="payment-icon">PayPal</span>
                <span className="payment-icon">Visa</span>
                <span className="payment-icon">MC</span>
                <span className="payment-icon">Apple Pay</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
