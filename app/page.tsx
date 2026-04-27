'use client';

import Image from 'next/image';

export default function HomePage() {
  return (
    <>
      <style suppressHydrationWarning>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
          background: #000;
        }

        .hero {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000;
        }

        .hero-img {
          position: absolute;
          top: 10px;
          left: 0;
          right: 0;
          bottom: 55px;
          opacity: 0.9;
        }

        /* floating bar z-index on top of hero */
        .tf-footer { z-index: 800; }
        .modal-overlay { z-index: 9999; }

        @media (max-width: 768px) {
          .hero-img {
            top: 5px;
            bottom: 50px;
          }
        }

        @media (max-width: 480px) {
          .hero-img {
            top: 5px;
            bottom: 50px;
          }
        }
      `}</style>

      {/* ── FULL SCREEN HERO IMAGE ── */}
      <section className="hero" id="home">
        <div className="hero-img">
          <Image
            src="/asset/images/hero4.jpeg"
            alt="Nofoal"
            fill
            priority
            quality={100}
            sizes="100vw"
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>
      </section>

      {/* ── FLOATING BAR ── */}
      <footer className="tf-footer">
        <div className="floating-bar">
          <img src="/asset/images/logo/black-logo-mark.png" alt="NOFOAL" />
          <a
            href="#"
            className="floating-btn"
            onClick={(e) => { e.preventDefault(); (window as any).openModal?.(e, 'waitlistModal'); }}
          >
            Join Waitlist
          </a>
        </div>
      </footer>

      {/* ── WAITLIST MODAL ── */}
      <div className="modal-overlay" id="waitlistModal">
        <div className="modal-content">
          <button
            className="modal-close"
            onClick={() => (window as any).closeModal?.('waitlistModal')}
          >
            <img src="/asset/images/logo/black-logo-mark.png" alt="Close" style={{ width: 20, height: 20 }} />
          </button>
          <div className="modal-header">
            <h2>Limited Access</h2>
            <p>Get notified when objects arrive</p>
          </div>
          <form className="modal-form" id="waitlistForm">
            <div className="form-group">
              <input
                type="email"
                className="form-input"
                name="email"
                placeholder="Email Address"
                required
              />
            </div>
            <button type="submit" className="modal-submit">
              <span className="btn-text">Confirm</span>
              <span className="spinner" style={{ display: 'none' }}></span>
            </button>
          </form>
          <div className="success-message" id="waitlistSuccess">
            <div className="success-icon">✓</div>
            <h3>{"You're on the list!"}</h3>
            <p>{"We'll notify you when it's your turn."}</p>
          </div>
        </div>
      </div>
    </>
  );
}
