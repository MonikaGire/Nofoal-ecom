'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const params = useSearchParams();
  const shortId = params.get('short_id') || params.get('preorder_id') || '';
  const orderId = params.get('order_id') || '';
  const isPreorder = !!params.get('preorder_id');

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

        .confirm-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
        }

        .confirm-card {
          background: #fff;
          padding: 60px 48px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 26px 100%, 0 calc(100% - 26px));
        }

        .confirm-check {
          font-size: 48px;
          margin-bottom: 24px;
          color: #111;
        }

        .confirm-title {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #111;
          margin-bottom: 12px;
        }

        .confirm-id {
          font-size: 12px;
          letter-spacing: 2px;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .confirm-msg {
          font-size: 13px;
          color: #666;
          line-height: 1.8;
          margin-bottom: 36px;
        }

        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .confirm-btn {
          display: inline-block;
          padding: 14px 28px;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: opacity 0.2s;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        .confirm-btn:hover { opacity: 0.8; }

        .confirm-btn.primary { background: #111; color: #fff; }
        .confirm-btn.secondary { background: #fff; color: #111; border: 1px solid #ccc; }

        @media (max-width: 600px) {
          .confirm-card { padding: 40px 24px; }
          .confirm-actions { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div className="confirm-wrap">
        <div className="confirm-card">
          <div className="confirm-check">✓</div>
          <h1 className="confirm-title">
            {isPreorder ? 'Pre-order Confirmed' : 'Payment Successful'}
          </h1>
          {shortId && (
            <p className="confirm-id">
              Order #{typeof shortId === 'string' && shortId.length > 8
                ? shortId.slice(-8).toUpperCase()
                : shortId.toUpperCase()}
            </p>
          )}
          <p className="confirm-msg">
            {isPreorder
              ? 'Your pre-order has been received. A confirmation email has been sent. We\'ll notify you when your item ships.'
              : 'Your payment has been confirmed and your order is being processed. A confirmation email is on its way.'}
          </p>
          <div className="confirm-actions">
            <a href="/account/orders" className="confirm-btn primary">View My Orders</a>
            <a href="/products" className="confirm-btn secondary">Continue Shopping</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmationContent />
    </Suspense>
  );
}
