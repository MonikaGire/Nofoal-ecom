/* ===================================
   COMMON JAVASCRIPT FOR ALL PAGES
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== MOBILE MENU TOGGLE ==========
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }

    // ========== MODAL FUNCTIONALITY ==========
    window.openModal = function(e, modalId) {
        e.preventDefault();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form and success message
            const form = modal.querySelector('form');
            const successMessage = modal.querySelector('.success-message');
            
            if (form) {
                form.style.display = 'block';
                form.reset();
                
                // Reset button state
                const submitBtn = form.querySelector('.modal-submit');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    const btnText = submitBtn.querySelector('.btn-text');
                    const spinner = submitBtn.querySelector('.spinner');
                    if (btnText) btnText.style.display = 'inline';
                    if (spinner) spinner.style.display = 'none';
                }
            }
            
            if (successMessage) {
                successMessage.classList.remove('active');
            }
        }
    };

    // Close modal when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });

    // ========== PRE-ORDER MODAL ==========
function openPreorderModal(productName, price) {
    const modal = document.getElementById('preorderModal');
    const quantityBtn = document.querySelector('.sizes button.active');
    const quantity = quantityBtn ? parseInt(quantityBtn.textContent) : 1;
    const total = price * quantity;
    
    // Update modal display
    document.getElementById('preorderProductName').textContent = productName;
    document.getElementById('summaryProduct').textContent = productName;
    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summaryUnitPrice').textContent = '$' + price;
    document.getElementById('summaryTotal').textContent = '$' + total;
    
    // Update hidden form fields
    document.getElementById('hiddenProductName').value = productName;
    document.getElementById('hiddenProductPrice').value = price;
    document.getElementById('hiddenQuantity').value = quantity;
    
    // Open modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

    // ========== HANDLE SIGN UP FORM (SIMPLE SUBMISSION) ==========
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function() {
            const submitBtn = this.querySelector('.modal-submit');
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const spinner = submitBtn.querySelector('.spinner');
                
                submitBtn.disabled = true;
                if (btnText) btnText.style.display = 'none';
                if (spinner) spinner.style.display = 'inline-block';
            }
            // Form will submit normally to signup.php
        });
    }
    
    // ========== HANDLE WAITLIST FORM (SIMPLE SUBMISSION) ==========
    const waitlistForm = document.getElementById('waitlistForm');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function() {
            const submitBtn = this.querySelector('.modal-submit');
            if (submitBtn) {
                const btnText = submitBtn.querySelector('.btn-text');
                const spinner = submitBtn.querySelector('.spinner');
                
                submitBtn.disabled = true;
                if (btnText) btnText.style.display = 'none';
                if (spinner) spinner.style.display = 'inline-block';
            }
            // Form will submit normally to waitlist.php
        });
    }
});