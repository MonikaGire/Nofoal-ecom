'use client';

import { useState } from 'react';
import ClientModals from '@/components/ClientModals';

export default function ReturnPolicyPage() {
  const sections = [
    {
      title: 'DELIVERY OPTIONS',
      content: `We offer fast and secure delivery through our trusted brand partners.\n\nStandard shipping: 5–7 business days to most locations across India.\n\nExpress delivery: 2–3 business days to major cities.\n\nAll packages are carefully packaged to ensure your product arrives in perfect condition.`,
    },
    {
      title: 'DELIVERY COSTS',
      content: `Shipping costs are calculated at checkout based on your delivery location and the weight of your order.\n\nOrders exceeding ₹50,000 qualify for free standard shipping.\n\nFinal costs are displayed before you complete your purchase.`,
    },
    {
      title: 'DELIVERY RULES & RESTRICTIONS',
      content: `Please ensure your shipping address is complete and accurate to avoid delays.\n\nOrders are processed within 1–2 business days (Monday – Friday, excluding holidays).\n\nYou will receive a tracking number via email once your order dispatches.\n\nRemote or difficult-to-access areas may incur additional delivery fees.\n\nPre-ordered items ship according to their estimated release date.`,
    },
    {
      title: 'TAXES',
      content: `All prices are tax inclusive.`,
    },
    {
      title: 'RETURN POLICY',
      content: `Items must be returned within 14 days of receipt, unworn, unwashed, and undamaged — in original packaging with all labels intact.\n\nThe following items are not eligible for return:\n— Custom or bespoke items\n— Used or damaged goods\n— Items with removed tags\n\nReturn shipping costs are the responsibility of the customer, unless the item received was defective or incorrect.\n\nTo initiate a return, contact us at sildein@nofoal.com with your order number.`,
    },
    {
      title: 'REFUND PROCESS',
      content: `Once your return is received and inspected, refunds are processed within 2–3 weeks.\n\nRefunds are credited to your original payment method.`,
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <link rel="stylesheet" href="/css/common.css" />
      <style suppressHydrationWarning>{`
        body { background: #f5f4f0; color: #111; }
        nav { background: #f5f4f0; }
        nav a { color: #000; }
        nav a::after { background: #111; }
        .menu-toggle span { background: #111; }
        .navbar-icon svg { stroke: #111; }

        .rp-page {
          min-height: 100vh;
          padding: 130px 60px 120px;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          align-items: start;
        }

        /* ── LEFT TITLE ── */
        .rp-left {
          position: sticky;
          top: 110px;
        }

        .rp-title {
          font-size: 34px;
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #111;
        }

        /* ── RIGHT CARD ── */
        .rp-card {
          background: #fff;
          clip-path: polygon(
            0 0,
            100% 0,
            100% 100%,
            26px 100%,
            0 calc(100% - 26px)
          );
        }

        /* ── ACCORDION ROW ── */
        .rp-item {
          border-bottom: 1px solid #e8e6de;
        }

        .rp-item:first-child {
          border-top: none;
        }

        .rp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          cursor: pointer;
          user-select: none;
          gap: 16px;
        }

        .rp-label {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #111;
          font-weight: 500;
          font-family: 'Roboto', sans-serif;
        }

        /* logo mark icon — rotates 45° on open */
        .rp-plus {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          transition: transform 0.35s ease;
          opacity: 0.55;
        }

        .rp-plus.is-open {
          transform: rotate(90deg);
          opacity: 1;
        }

        /* ── BODY ── */
        .rp-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.32s ease;
        }

        .rp-body.is-open {
          grid-template-rows: 1fr;
        }

        .rp-body-inner {
          overflow: hidden;
        }

        .rp-body-text {
          padding: 0 24px 24px;
          font-size: 13px;
          line-height: 1.9;
          color: #666;
          white-space: pre-line;
          font-family: 'Roboto', sans-serif;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .rp-page {
            grid-template-columns: 1fr;
            gap: 36px;
            padding: 100px 28px 80px;
          }
          .rp-left { position: static; }
          .rp-title { font-size: 28px; }
        }

        @media (max-width: 480px) {
          .rp-page { padding: 85px 16px 70px; gap: 24px; }
          .rp-title { font-size: 22px; }
          .rp-header { padding: 18px 16px; }
          .rp-label { font-size: 10px; letter-spacing: 1.5px; }
          .rp-body-text { padding: 0 16px 20px; font-size: 12px; }
          .rp-card {
            clip-path: polygon(
              0 0,
              100% 0,
              100% 100%,
              18px 100%,
              0 calc(100% - 18px)
            );
          }
        }
      `}</style>

      <div className="rp-page">

        {/* LEFT — sticky title */}
        <div className="rp-left">
          <h1 className="rp-title">Shipping &amp;<br />Returns</h1>
        </div>

        {/* RIGHT — white card with clip-path + accordion */}
        <div className="rp-card">
          {sections.map((section, i) => (
            <div className="rp-item" key={i}>
              <div
                className="rp-header"
                onClick={() => setOpen(open === i ? null : i)}
                role="button"
                aria-expanded={open === i}
              >
                <span className="rp-label">{section.title}</span>
                <img
                  src="/asset/images/logo/black-logo-mark.png"
                  alt=""
                  className={`rp-plus${open === i ? ' is-open' : ''}`}
                />
              </div>
              <div className={`rp-body${open === i ? ' is-open' : ''}`}>
                <div className="rp-body-inner">
                  <p className="rp-body-text">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <ClientModals />
    </>
  );
}
