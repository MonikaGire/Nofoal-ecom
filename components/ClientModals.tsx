'use client';

export default function ClientModals() {
  return (
    <>
      <div className="modal-overlay" id="waitlistModal">
        <div className="modal-content">
          <button className="modal-close" onClick={() => (window as any).closeModal?.('waitlistModal')}>
            <img src="/asset/images/logo/black-logo-mark.png" alt="Close" style={{ width: 20, height: 20 }} />
          </button>
          <div className="modal-header">
            <h2>Limited Access</h2>
            <p>Get notified when objects arrive</p>
          </div>
          <form className="modal-form" id="waitlistForm">
            <div className="form-group">
              <input type="email" className="form-input" name="email" placeholder="Email Address" required />
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
    </>
  );
}
