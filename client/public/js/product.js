// ========== GLOBAL MODAL FUNCTIONS ==========
window.openAccModal = function(title, content) {
    const modal = document.getElementById('accModal');
    document.getElementById('accModalTitle').textContent = title;
    document.getElementById('accModalBody').innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeAccModal = function() {
    const modal = document.getElementById('accModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
};

window.openModal = function(event, modalId) {
    if (event && event.preventDefault) event.preventDefault();
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        const form = modal.querySelector('form');
        const successMsg = modal.querySelector('.success-message');
        if (form) form.style.display = 'block';
        if (successMsg) successMsg.style.display = 'none';
    }
};

// ========== PRE-ORDER MODAL ==========
window.openPreorderModal = function(productName, price) {
    const modal = document.getElementById('preorderModal');
    if (!modal) return;
    
    const quantityBtn = document.querySelector('.sizes button.active');
    const quantity = quantityBtn ? parseInt(quantityBtn.textContent) : 1;
    const total = price * quantity;
    
    document.getElementById('preorderProductName').textContent = productName;
    document.getElementById('summaryProduct').textContent = productName;
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summaryUnitPrice').textContent = 'Rs.' + price;
    document.getElementById('summaryTotal').textContent = 'Rs.' + total;
    
    document.getElementById('hiddenProductName').value = productName;
    document.getElementById('hiddenProductPrice').value = price;
    document.getElementById('hiddenQuantity').value = quantity;
    document.getElementById('hiddenTotalAmount').value = total;
    
    const form = document.getElementById('preorderForm');
    const successMsg = document.getElementById('preorderSuccess');
    if (form) {
        form.style.display = 'block';
        form.reset();
    }
    if (successMsg) successMsg.style.display = 'none';
    
    modal.classList.add('active');
    modal.style.cssText = `
        z-index: 999999 !important;
        padding: 20px !important;
        overflow: auto !important;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.style.cssText = `
            position: relative !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            z-index: 1000000 !important;
        `;
    }
    
    document.body.style.overflow = 'hidden';
};

// ========== IMAGE ZOOM FUNCTIONALITY (DESKTOP ONLY) ==========
let currentImageIndex = 0;
let imageArray = [];

function isDesktop() {
    return window.innerWidth > 820;
}

function initializeImageZoom() {
    if (!isDesktop()) return;
    
    imageArray = [];
    const imgs = document.querySelectorAll('.scroll-content img');
    
    imgs.forEach((img, index) => {
        imageArray.push(img.src);
        img.style.cursor = 'zoom-in';
        
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);
        
        newImg.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.openImageZoom(index);
        });
    });
}

function removeImageZoom() {
    const imgs = document.querySelectorAll('.scroll-content img');
    imgs.forEach(img => {
        img.style.cursor = 'default';
        const newImg = img.cloneNode(true);
        img.parentNode.replaceChild(newImg, img);
    });
}

// ========== ZOOM SCALE STATE ==========
let zoomScale = 1;
let zoomTranslateX = 0;
let zoomTranslateY = 0;
let zoomIsDragging = false;
let zoomDragStartX = 0;
let zoomDragStartY = 0;
let zoomDragOriginX = 0;
let zoomDragOriginY = 0;

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const ZOOM_STEP = 0.25;

function applyZoomTransform(img) {
    if (!img) return;
    img.style.transform = `translate(${zoomTranslateX}px, ${zoomTranslateY}px) scale(${zoomScale})`;
    img.style.cursor = zoomScale > 1 ? 'grab' : 'zoom-in';
}

function resetZoom(img) {
    zoomScale = 1;
    zoomTranslateX = 0;
    zoomTranslateY = 0;
    if (img) {
        img.style.transform = '';
        img.style.cursor = 'zoom-in';
    }
}

function clampTranslate(img) {
    if (!img || zoomScale <= 1) { zoomTranslateX = 0; zoomTranslateY = 0; return; }
    const rect = img.getBoundingClientRect();
    const scaledW = img.naturalWidth * zoomScale;
    const scaledH = img.naturalHeight * zoomScale;
    const maxX = Math.max(0, (scaledW - window.innerWidth) / 2);
    const maxY = Math.max(0, (scaledH - window.innerHeight) / 2);
    zoomTranslateX = Math.max(-maxX, Math.min(maxX, zoomTranslateX));
    zoomTranslateY = Math.max(-maxY, Math.min(maxY, zoomTranslateY));
}

function attachZoomModalEvents() {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');
    if (!modal || !zoomedImg) return;

    // Scroll wheel zoom
    modal.addEventListener('wheel', function(e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        zoomScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomScale + delta));
        if (zoomScale === ZOOM_MIN) { zoomTranslateX = 0; zoomTranslateY = 0; }
        clampTranslate(zoomedImg);
        applyZoomTransform(zoomedImg);
    }, { passive: false });

    // Drag to pan when zoomed
    zoomedImg.addEventListener('mousedown', function(e) {
        if (zoomScale <= 1) return;
        zoomIsDragging = true;
        zoomDragStartX = e.clientX;
        zoomDragStartY = e.clientY;
        zoomDragOriginX = zoomTranslateX;
        zoomDragOriginY = zoomTranslateY;
        zoomedImg.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
        if (!zoomIsDragging) return;
        zoomTranslateX = zoomDragOriginX + (e.clientX - zoomDragStartX);
        zoomTranslateY = zoomDragOriginY + (e.clientY - zoomDragStartY);
        clampTranslate(zoomedImg);
        applyZoomTransform(zoomedImg);
    });

    window.addEventListener('mouseup', function() {
        if (!zoomIsDragging) return;
        zoomIsDragging = false;
        zoomedImg.style.cursor = zoomScale > 1 ? 'grab' : 'zoom-in';
    });

    // Double-click to reset zoom
    zoomedImg.addEventListener('dblclick', function() {
        resetZoom(zoomedImg);
        applyZoomTransform(zoomedImg);
    });
}

// Ctrl + / Ctrl - / Ctrl 0 keyboard zoom
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');
    if (!modal || !modal.classList.contains('active') || !zoomedImg) return;

    if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' ) {
            e.preventDefault();
            zoomScale = Math.min(ZOOM_MAX, zoomScale + ZOOM_STEP);
            clampTranslate(zoomedImg);
            applyZoomTransform(zoomedImg);
        } else if (e.key === '-') {
            e.preventDefault();
            zoomScale = Math.max(ZOOM_MIN, zoomScale - ZOOM_STEP);
            if (zoomScale === ZOOM_MIN) { zoomTranslateX = 0; zoomTranslateY = 0; }
            clampTranslate(zoomedImg);
            applyZoomTransform(zoomedImg);
        } else if (e.key === '0') {
            e.preventDefault();
            resetZoom(zoomedImg);
            applyZoomTransform(zoomedImg);
        }
    }
});

window.openImageZoom = function(index) {
    if (!isDesktop()) return;

    if (!imageArray || imageArray.length === 0) {
        console.error('No images available for zoom');
        return;
    }

    currentImageIndex = index;
    const modal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');

    if (!modal || !zoomedImg) {
        console.error('Image zoom modal elements not found');
        return;
    }

    resetZoom(zoomedImg);
    zoomedImg.src = imageArray[currentImageIndex];
    modal.classList.add('active');
    document.body.classList.add('zoom-active');
    document.body.style.overflow = 'hidden';
};

window.closeImageZoom = function() {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');
    if (!modal) {
        console.error('Image zoom modal not found');
        return;
    }
    resetZoom(zoomedImg);
    modal.classList.remove('active');
    document.body.classList.remove('zoom-active');
    document.body.style.overflow = 'auto';
    zoomIsDragging = false;
};

// ========== SIDE CARDS SCROLL EFFECT ==========
function handleSideCardsScroll() {
    if (window.innerWidth <= 820) return;
    
    const container = document.querySelector('.container');
    const leftSide = document.querySelector('.left-side');
    const rightSide = document.querySelector('.right-side');
    
    if (!container || !leftSide || !rightSide) return;
    
    const scrollY = window.scrollY || window.pageYOffset;
    const containerTop = container.offsetTop;
    const containerHeight = container.offsetHeight;
    const windowHeight = window.innerHeight;
    const triggerPoint = containerTop + containerHeight - windowHeight;
    
    if (scrollY >= triggerPoint) {
        if (!leftSide.classList.contains('scrolled')) {
            leftSide.classList.add('scrolled');
            rightSide.classList.add('scrolled');
        }
    } else {
        if (leftSide.classList.contains('scrolled')) {
            leftSide.classList.remove('scrolled');
            rightSide.classList.remove('scrolled');
        }
    }
}

// ========== DOM READY ==========
function initProduct() {
    console.log('DOM loaded - initializing...');
    
    // Initialize image zoom
    initializeImageZoom();
    
    // Initialize side cards scroll
    handleSideCardsScroll();
    
    // Accordion modal clicks
    const accModal = document.getElementById('accModal');
    if (accModal) {
        accModal.addEventListener('click', function(e) {
            if (e.target === this) window.closeAccModal();
        });
    }

    // All modal overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) window.closeModal(this.id);
        });
    });

    // IMAGE ZOOM MODAL - CLOSE BUTTON
    const imageZoomModal = document.getElementById('imageZoomModal');
    const zoomCloseBtn = document.getElementById('zoomCloseBtn');
    
    console.log('Image Zoom Modal:', imageZoomModal);
    console.log('Zoom Close Button:', zoomCloseBtn);
    
    if (zoomCloseBtn) {
        zoomCloseBtn.addEventListener('click', function(e) {
            console.log('Close button clicked!');
            e.preventDefault();
            e.stopPropagation();
            window.closeImageZoom();
        });
        console.log('Close button listener attached');
    } else {
        console.error('Zoom close button not found!');
    }
    
    if (imageZoomModal) {
        // Click anywhere on overlay to close
        imageZoomModal.addEventListener('click', function(e) {
            if (e.target === this) {
                console.log('Overlay clicked, closing...');
                window.closeImageZoom();
            }
        });
    }

    // Attach scroll/drag/keyboard zoom events
    attachZoomModalEvents();

    // ESC key - close all modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (accModal && accModal.classList.contains('active')) {
                window.closeAccModal();
            }
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display === 'flex') window.closeModal(modal.id);
            });
            if (imageZoomModal && imageZoomModal.classList.contains('active')) {
                console.log('ESC pressed, closing zoom...');
                window.closeImageZoom();
            }
        }
    });

    // ========== PRE-ORDER FORM SUBMISSION ==========
    // Submits to Express /api/preorder
    const preorderForm = document.getElementById('preorderForm');
    if (preorderForm) {
        preorderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const btn = this.querySelector('.modal-submit');
            const btnText = btn.querySelector('.btn-text');
            const spinner = btn.querySelector('.spinner');

            btnText.style.display = 'none';
            spinner.style.display = 'inline';
            btn.disabled = true;

            const formData = {
                customer_name: this.querySelector('[name="customer_name"]')?.value || '',
                customer_email: this.querySelector('[name="customer_email"]')?.value || '',
                customer_phone: this.querySelector('[name="customer_phone"]')?.value || '',
                customer_address: this.querySelector('[name="customer_address"]')?.value || '',
                product_name: document.getElementById('hiddenProductName')?.value || '',
                product_price: parseFloat(document.getElementById('hiddenProductPrice')?.value || 0),
                quantity: parseInt(document.getElementById('hiddenQuantity')?.value || 1),
                total_amount: parseFloat(document.getElementById('hiddenTotalAmount')?.value || 0),
            };

            fetch('/api/preorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    this.style.display = 'none';
                    document.getElementById('preorderSuccess').style.display = 'block';
                    
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                    
                    // Close modal after 3 seconds
                    setTimeout(() => {
                        window.closeModal('preorderModal');
                        this.reset();
                    }, 3000);
                } else {
                    alert('Error: ' + (data.error || 'Unable to submit order'));
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting form. Please try again.');
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                btn.disabled = false;
            });
        });
    }

    // ========== SIGNUP FORM SUBMISSION ==========
    // ✅ FIX: Now actually submits to signup.php
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('.modal-submit');
            const btnText = btn.querySelector('.btn-text');
            const spinner = btn.querySelector('.spinner');
            
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            btn.disabled = true;
            
            const email = this.querySelector('[name="email"]')?.value || '';

            fetch('/api/auth/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.style.display = 'none';
                    document.getElementById('signupSuccess').style.display = 'block';
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                    
                    setTimeout(() => {
                        window.closeModal('signupModal');
                        this.reset();
                    }, 3000);
                } else {
                    alert('Error: ' + (data.error || 'Unable to sign up'));
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting form. Please try again.');
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                btn.disabled = false;
            });
        });
    }


    // Size selection
    document.querySelectorAll('.sizes button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.sizes button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Accordion click handled by React onClick on .acc-header

    // Mobile carousel
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    const carouselWrapper = document.querySelector('.carousel-wrapper');

    if (track && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        let carouselPaused = false;

        function updateCarousel() {
            // ✅ FIX: Fixed typo from Rs.{currentIndex} to ${currentIndex}
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        function nextSlide() { currentIndex = (currentIndex + 1) % totalSlides; updateCarousel(); }
        function prevSlide() { currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; updateCarousel(); }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        dots.forEach((dot, i) => dot.addEventListener('click', () => { currentIndex = i; updateCarousel(); }));

        if (carouselWrapper) {
            let touchStartX = 0;
            carouselWrapper.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
                carouselPaused = true;
            });
            carouselWrapper.addEventListener('touchend', e => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
                setTimeout(() => { carouselPaused = false; }, 500);
            });
            carouselWrapper.addEventListener('mouseenter', () => { carouselPaused = true; });
            carouselWrapper.addEventListener('mouseleave', () => { carouselPaused = false; });
        }

        if (window.innerWidth <= 820) {
            setInterval(() => { if (!carouselPaused) nextSlide(); }, 3500);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProduct);
} else {
    initProduct();
}

// ========== SCROLL EVENT ==========
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleSideCardsScroll);
});

// ========== RESIZE EVENT ==========
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        if (isDesktop()) {
            initializeImageZoom();
        } else {
            removeImageZoom();
            window.closeImageZoom();
        }
        
        if (window.innerWidth <= 820) {
            const leftSide = document.querySelector('.left-side');
            const rightSide = document.querySelector('.right-side');
            if (leftSide) leftSide.classList.remove('scrolled');
            if (rightSide) rightSide.classList.remove('scrolled');
        } else {
            handleSideCardsScroll();
        }
    }, 250);
});










// ===== KEY CARD CAROUSEL JAVASCRIPT =====
function initKeyCardCarousels() {

    // Initialize carousels in each key card
    const keyCards = document.querySelectorAll('.key-card');
    
    keyCards.forEach((card) => {
        const track = card.querySelector('.carousel-track-card');
        const dots = card.querySelectorAll('.carousel-dot-card');
        const slides = card.querySelectorAll('.carousel-slide-card');
        
        if (!track || !dots.length || !slides.length) return;
        
        let currentIndex = 0;
        
        /**
         * Go to specific slide
         * @param {number} index - Slide index
         */
        function goToSlide(index) {
            // Clamp index between 0 and slides length
            currentIndex = Math.max(0, Math.min(index, slides.length - 1));
            
            // Move track
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        /**
         * Go to next slide (loops)
         */
        function nextSlide() {
            goToSlide((currentIndex + 1) % slides.length);
        }
        
        /**
         * Go to previous slide (loops)
         */
        function prevSlide() {
            goToSlide((currentIndex - 1 + slides.length) % slides.length);
        }
        
        // ===== DOT CLICK HANDLERS =====
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // ===== ARROW BUTTON =====
        const arrowBtn = card.querySelector('.key-card-arrow-btn');
        if (arrowBtn) {
            arrowBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextSlide();
            });
        }
        
        // ===== KEYBOARD NAVIGATION (Optional) =====
        // Enable arrow keys to navigate carousel when hovering
        card.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
        
        // ===== SWIPE NAVIGATION (Optional) =====
        // For touch devices
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swiped left
                nextSlide();
            }
            if (touchEndX > touchStartX + 50) {
                // Swiped right
                prevSlide();
            }
        }
        // ===== AUTO-ADVANCE (Optional - commented out) =====
        // Uncomment to enable auto-advance every 5 seconds
        // let autoPlayInterval = setInterval(nextSlide, 5000);
        
        // Pause on hover
        // card.addEventListener('mouseenter', () => {
        //     clearInterval(autoPlayInterval);
        // });
        
        // Resume on mouse leave
        // card.addEventListener('mouseleave', () => {
        //     autoPlayInterval = setInterval(nextSlide, 5000);
        // });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyCardCarousels);
} else {
    initKeyCardCarousels();
}