'use client';

import Script from 'next/script';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';

const MAX_QTY = 2;

export default function ClientProductPage({ product }: { product: Product }) {
  const { addItem, items } = useCartStore();
  const router = useRouter();
  const formattedDescription = product.description.replace(/\n/g, '<br>');

  const cartQty = items.find(i => i.productId === product._id)?.quantity || 0;
  const canAdd = cartQty < MAX_QTY;

  function getSelectedQty(): number {
    if (typeof window === 'undefined') return 1;
    const btn = document.querySelector('.sizes button.active');
    return btn ? parseInt(btn.textContent || '1') : 1;
  }

  async function handleSave() {
    if (!canAdd) {
      alert(`Maximum ${MAX_QTY} units per order. You already have ${cartQty} in your cart.`);
      return;
    }
    await addItem(product._id, getSelectedQty());
  }

  async function handleBuyNow() {
    if (!canAdd) {
      alert(`Maximum ${MAX_QTY} units per order. You already have ${cartQty} in your cart.`);
      return;
    }
    await addItem(product._id, getSelectedQty());
    router.push('/checkout');
  }

  return (
    <>
      {/* Load product-specific CSS */}
      <link rel="stylesheet" href="/css/common.css" />
      <link rel="stylesheet" href="/css/product.css" />

      {/* Page Header */}
      <div className="page-header">
        <a href="/">
          <img src="/asset/images/logo/logo-b.png" alt="Nofoal" />
        </a>
      </div>

      <div className="container">
        {/* CENTER - Desktop scroll / Mobile carousel */}
        <main className="middle center-section" aria-label="Product images">

          {/* Desktop scroll */}
          <div className="scroll-content">
            {product.images.map((img, i) => (
              <img key={i} src={img} alt={`${product.title} view ${i + 1}`} />
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="carousel-container">
            <div className="carousel-wrapper">
              <button className="carousel-nav prev" aria-label="Previous image">‹</button>
              <button className="carousel-nav next" aria-label="Next image">›</button>
              <div className="carousel-track">
                {product.images.map((img, i) => (
                  <div className="carousel-slide" key={i}>
                    <img src={img} alt={`${product.title} view ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="carousel-dots">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot${i === 0 ? ' active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </main>

        {/* LEFT - Product info */}
        <aside className="side left-side left-section">
          <div className="card-wrap left-card">
            <div className="title-row">
              <h3>{product.title}</h3>
              <span className="edition">Rs.{product.price.toLocaleString('en-IN')}</span>
            </div>
            <div
              className="price"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            />
            <div className="accordion">
              {product.specs.map((spec, i) => (
                <div className="acc-item" key={i}>
                  <div
                    className="acc-header"
                    style={{ cursor: 'pointer' }}
                    onClick={() => (window as any).openAccModal?.(spec.key, spec.modalContent)}
                  >
                    {spec.key}
                    <span className="acc-toggle">
                      <img
                        src="/asset/images/logo/black-logo-mark.png"
                        alt="Open"
                        style={{ width: 20, height: 20 }}
                      />
                    </span>
                  </div>
                  <div className="acc-body" style={{ display: 'none' }}>{spec.value}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT - Quantity & Pre-order */}
        <aside className="side right-side right-section">
          <div className="card-wrap right-card">
            <h3 style={{ margin: '0 0 6px 0', fontSize: '11px', letterSpacing: '1px' }}>SELECT QUANTITY</h3>
            <div className="sizes">
              <button className="active">1</button>
              <button>2</button>
            </div>
            <p style={{ fontSize: '10px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', margin: '6px 0 0' }}>
              Max 2 per order
            </p>
            <div className="choose-row">
              <button className="btn-primary" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button className="btn-secondary" onClick={handleSave}>
                Save
              </button>
              <p style={{ border: '1px dashed #9D9688', fontSize: '15px', padding: '5px' }}>
                The estimated shipping date for this item is {product.shippingDate}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ACCORDION MODAL */}
      <div className="acc-modal-overlay" id="accModal">
        <div className="acc-modal-card">
          <button className="acc-modal-close" onClick={() => (window as any).closeAccModal?.()}>
            <img src="/asset/images/logo/black-logo-mark.png" alt="Close" style={{ width: 20, height: 20 }} />
          </button>
          <div className="acc-modal-header">
            <div className="acc-modal-title" id="accModalTitle"></div>
          </div>
          <div className="acc-modal-body" id="accModalBody"></div>
        </div>
      </div>

      {/* KEY ELEMENTS SECTION */}
      {product.keyElements && product.keyElements.length > 0 && (
        <section className="key-elements-section">
          <div className="section-header">
            <div className="section-title">Key Elements</div>
            <div className="scroll-hint">Scroll to explore</div>
          </div>

          <div className="h-scroll-outer">
            <button className="h-scroll-nav prev" id="hScrollPrev">‹</button>
            <button className="h-scroll-nav next" id="hScrollNext">›</button>

            <div className="h-scroll-container" id="hScroll">
              {product.keyElements.map((element, cardIndex) => (
                <div className="key-card" key={cardIndex}>
                  <div className="key-card-carousel">
                    <div className="carousel-wrapper-card">
                      <div className="carousel-track-card">
                        {element.images.map((img, imgIndex) => (
                          <div className="carousel-slide-card" key={imgIndex}>
                            <img src={img} alt={`${element.title} ${imgIndex + 1}`} />
                          </div>
                        ))}
                      </div>
                      {element.images.length > 1 && (
                        <button className="key-card-arrow-btn">→</button>
                      )}
                    </div>
                    <div className="carousel-dots-card">
                      {element.images.length > 1 && element.images.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          className={`carousel-dot-card${dotIndex === 0 ? ' active' : ''}`}
                          data-index={dotIndex}
                        ></button>
                      ))}
                    </div>
                  </div>
                  <div className="key-card-body">
                    <div className="key-card-tag">{element.tag}</div>
                    <div className="key-card-title">{element.title}</div>
                    <div className="key-card-desc">{element.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRE-ORDER MODAL */}
      <div className="modal-overlay" id="preorderModal">
        <div className="modal-content" style={{ maxWidth: '500px' }}>
          <button className="modal-close" onClick={() => (window as any).closeModal?.('preorderModal')}>
            <img src="/asset/images/logo/black-logo-mark.png" alt="Close" style={{ width: 20, height: 20 }} />
          </button>

          <div className="modal-header">
            <p id="preorderProductName" style={{ fontSize: '18px', fontWeight: 600, marginTop: '12px', color: '#111' }}>
              {product.title}
            </p>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>First release — March 2026</p>
          </div>

          <div className="order-summary-box">
            <div className="order-row">
              <span>Product</span>
              <span id="summaryProduct">{product.title}</span>
            </div>
            <div className="order-row">
              <span>Quantity</span>
              <span id="summaryQuantity">1</span>
            </div>
            <div className="order-row">
              <span>Price per unit</span>
              <span id="summaryUnitPrice">Rs.{product.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="order-row total">
              <span>Total Amount</span>
              <span id="summaryTotal">Rs.{product.price.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <form id="preorderForm" style={{ marginTop: '20px' }}>
            <input type="hidden" name="product_name" id="hiddenProductName" value={product.title} />
            <input type="hidden" name="product_price" id="hiddenProductPrice" value={product.price} />
            <input type="hidden" name="quantity" id="hiddenQuantity" value="1" />
            <input type="hidden" name="total_amount" id="hiddenTotalAmount" value={product.price} />

            <div style={{ marginBottom: '15px' }}>
              <label className="form-label">Full Name *</label>
              <input type="text" name="customer_name" className="form-control" placeholder="Enter your full name" required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label className="form-label">Email Address *</label>
              <input type="email" name="customer_email" className="form-control" placeholder="your@email.com" required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label className="form-label">Phone Number *</label>
              <input type="tel" name="customer_phone" className="form-control" placeholder="+91 9000-0000" required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label className="form-label">Shipping Address *</label>
              <textarea name="customer_address" className="form-control" placeholder="Street address, City, State, ZIP" required rows={3}></textarea>
            </div>

            <button type="submit" className="modal-submit" style={{ marginTop: '10px' }}>
              <span className="btn-text">SUBMIT PRE-ORDER</span>
              <span className="spinner" style={{ display: 'none' }}>⏳</span>
            </button>
          </form>

          <div className="success-message" id="preorderSuccess" style={{ display: 'none' }}>
            <div className="success-icon">✓</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#111' }}>Pre-Order Submitted!</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Payment link sent to your email.</p>
          </div>

          <div className="modal-footer">
            <p style={{ fontSize: '11px', color: '#999' }}>Payment requested before shipment</p>
          </div>
        </div>
      </div>

      {/* WAITLIST MODAL */}
      <div className="modal-overlay" id="waitlistModal">
        <div className="modal-content">
          <button className="modal-close" onClick={() => (window as any).closeModal?.('waitlistModal')}>
            <img src="/asset/images/logo/black-logo-mark.png" alt="Close" style={{ width: 20, height: 20 }} />
          </button>
          <div className="modal-header">
            <h2>Limited Access</h2>
            <p>{"We're opening in this phase."}</p>
            <p>Leave your email to be considered.</p>
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

      {/* Floating Footer */}
      <footer className="tf-footer">
        <div className="floating-bar">
          <img src="/asset/images/logo/black-logo-mark.png" alt="NOFOAL" />
          <a href="#" className="floating-btn" onClick={(e) => { e.preventDefault(); (window as any).openModal?.(e, 'waitlistModal'); }}>
            Join Waitlist
          </a>
        </div>
      </footer>

      {/* Image Zoom Modal */}
      <div className="image-zoom-overlay" id="imageZoomModal">
        <button className="zoom-close" id="zoomCloseBtn">
          <img src="/asset/images/logo/white-logo-mark.png" alt="Close" style={{ width: 70, height: 60 }} />
        </button>
        <div className="zoom-content">
          <img id="zoomedImage" src="" alt="Product Image" />
        </div>
      </div>

      {/* Product JS — loaded after interactive */}
      <Script src="/js/product.js" strategy="afterInteractive" />
    </>
  );
}
