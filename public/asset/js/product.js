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
    event.preventDefault();
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
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
    
    // Update display
    document.getElementById('preorderProductName').textContent = productName;
    document.getElementById('summaryProduct').textContent = productName;
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summaryUnitPrice').textContent = '$' + price;
    document.getElementById('summaryTotal').textContent = '$' + total;
    
    // Update hidden fields
    document.getElementById('hiddenProductName').value = productName;
    document.getElementById('hiddenProductPrice').value = price;
    document.getElementById('hiddenQuantity').value = quantity;
    document.getElementById('hiddenTotalAmount').value = total;
    
    // Reset form
    const form = document.getElementById('preorderForm');
    const successMsg = document.getElementById('preorderSuccess');
    if (form) {
        form.style.display = 'block';
        form.reset();
    }
    if (successMsg) successMsg.style.display = 'none';
    
    // Force styles
    modal.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.7) !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        margin: 0 !important;
        overflow: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
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

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function() {
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

    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (accModal && accModal.classList.contains('active')) {
                window.closeAccModal();
            }
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                if (modal.style.display === 'flex') window.closeModal(modal.id);
            });
        }
    });

    // Pre-order form submission
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
            
            const formData = new FormData(this);
            
            fetch('submit-preorder.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.style.display = 'none';
                    document.getElementById('preorderSuccess').style.display = 'block';
                    
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                    
                    setTimeout(() => {
                        window.closeModal('preorderModal');
                        this.reset();
                    }, 3000);
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                }
            })
            .catch(error => {
                alert('Error submitting form. Please try again.');
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                btn.disabled = false;
            });
        });
    }

    // Signup form
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
            setTimeout(() => {
                this.style.display = 'none';
                document.getElementById('signupSuccess').style.display = 'block';
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                btn.disabled = false;
                setTimeout(() => { window.closeModal('signupModal'); this.reset(); }, 3000);
            }, 1500);
        });
    }

    // Waitlist form
    const waitlistForm = document.getElementById('waitlistForm');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.modal-submit');
            const btnText = btn.querySelector('.btn-text');
            const spinner = btn.querySelector('.spinner');
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            btn.disabled = true;
            setTimeout(() => {
                this.style.display = 'none';
                document.getElementById('waitlistSuccess').style.display = 'block';
                btnText.style.display = 'inline';
                spinner.style.display = 'none';
                btn.disabled = false;
                setTimeout(() => { window.closeModal('waitlistModal'); this.reset(); }, 3000);
            }, 1500);
        });
    }

    // Size selection
    document.querySelectorAll('.sizes button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.sizes button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Accordion - FIXED to prevent modal closing
    // Accordion - CLICK ANYWHERE OPENS MODAL
document.querySelectorAll('.acc-item').forEach(item => {
    const header = item.querySelector('.acc-header');
    const toggle = item.querySelector('.acc-toggle');
    const body = item.querySelector('.acc-body');
    
    if (header && toggle && body) {
        // Get title from header text (excluding the toggle)
        const title = header.childNodes[0].textContent.trim();
        
        // Get content from acc-body
        const content = body.innerHTML.trim();
        
        // Make entire header clickable
        header.addEventListener('click', function(e) {
            e.preventDefault();
            window.openAccModal(title, content);
        });
    }
});
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
});










// ========== IMAGE ZOOM FUNCTIONALITY (DESKTOP ONLY) ==========
    const scrollImages = document.querySelectorAll('.scroll-content img');
    let currentImageIndex = 0;
    let imageArray = [];

    // Function to check if desktop
    function isDesktop() {
        return window.innerWidth > 820;
    }

    // Initialize zoom functionality
    function initializeImageZoom() {
        if (!isDesktop()) return; // Exit if not desktop
        
        // Convert NodeList to array and store image sources
        imageArray = [];
        scrollImages.forEach((img, index) => {
            imageArray.push(img.src);
            
            // Add click event and cursor only on desktop
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                openImageZoom(index);
            });
        });
    }

    // Remove zoom functionality
    function removeImageZoom() {
        scrollImages.forEach(img => {
            img.style.cursor = 'default';
            // Remove all click listeners by cloning
            const newImg = img.cloneNode(true);
            img.parentNode.replaceChild(newImg, img);
        });
    }

    // Open zoom modal with specific image (desktop only)
    window.openImageZoom = function(index) {
        if (!isDesktop()) return; // Prevent on mobile
        
        currentImageIndex = index;
        const modal = document.getElementById('imageZoomModal');
        const zoomedImg = document.getElementById('zoomedImage');
        const counter = document.getElementById('imageCounter');
        
        zoomedImg.src = imageArray[currentImageIndex];
        counter.textContent = `${currentImageIndex + 1} / ${imageArray.length}`;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close zoom modal
    window.closeImageZoom = function() {
        const modal = document.getElementById('imageZoomModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // Navigate to previous image
    window.prevImage = function() {
        currentImageIndex = (currentImageIndex - 1 + imageArray.length) % imageArray.length;
        document.getElementById('zoomedImage').src = imageArray[currentImageIndex];
        document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${imageArray.length}`;
    };

    // Navigate to next image
    window.nextImage = function() {
        currentImageIndex = (currentImageIndex + 1) % imageArray.length;
        document.getElementById('zoomedImage').src = imageArray[currentImageIndex];
        document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${imageArray.length}`;
    };

    // Close on overlay click
    const imageZoomModal = document.getElementById('imageZoomModal');
    if (imageZoomModal) {
        imageZoomModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeImageZoom();
            }
        });
    }

    // Keyboard navigation (desktop only)
    document.addEventListener('keydown', function(e) {
        if (!isDesktop()) return; // Prevent on mobile
        
        const modal = document.getElementById('imageZoomModal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeImageZoom();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        }
    });

    // Initialize on page load
    initializeImageZoom();

    // Re-initialize on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (isDesktop()) {
                initializeImageZoom();
            } else {
                removeImageZoom();
                // Close modal if open and user resizes to mobile
                closeImageZoom();
            }
        }, 250);
    });