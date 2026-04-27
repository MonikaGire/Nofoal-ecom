/* ===================================
   COMMON JAVASCRIPT — ALL PAGES
   Updated: PHP endpoints → Express /api/*
   =================================== */

function initCommon() {

    // Mobile menu toggle handled by React Navbar component

    // ========== MODAL FUNCTIONALITY ==========
    window.openModal = function (e, modalId) {
        if (e && e.preventDefault) e.preventDefault();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';

            const form = modal.querySelector('form');
            const successMessage = modal.querySelector('.success-message');

            if (form) {
                form.style.display = 'block';
                form.reset();

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
                successMessage.style.display = 'none';
            }
        }
    };

    // Close modal when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                window.closeModal(modal.id);
            }
        });
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                window.closeModal(modal.id);
            });
        }
    });

    // ========== PRE-ORDER MODAL ==========
    window.openPreorderModal = function (productName, price) {
        const modal = document.getElementById('preorderModal');
        if (!modal) return;

        const quantityBtn = document.querySelector('.sizes button.active');
        const quantity = quantityBtn ? parseInt(quantityBtn.textContent) : 1;
        const total = price * quantity;

        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

        setEl('preorderProductName', productName);
        setEl('summaryProduct', productName);
        setEl('summaryQuantity', quantity);
        setEl('summaryUnitPrice', 'Rs.' + price.toLocaleString('en-IN'));
        setEl('summaryTotal', 'Rs.' + total.toLocaleString('en-IN'));

        setVal('hiddenProductName', productName);
        setVal('hiddenProductPrice', price);
        setVal('hiddenQuantity', quantity);
        setVal('hiddenTotalAmount', total);

        const form = modal.querySelector('form');
        const successMsg = document.getElementById('preorderSuccess');
        if (form) { form.style.display = 'block'; form.reset(); }
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

    // ========== WAITLIST FORM — POST /api/auth/waitlist ==========
    const waitlistForm = document.getElementById('waitlistForm');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.modal-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const spinner = submitBtn.querySelector('.spinner');

            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            submitBtn.disabled = true;

            const email = this.querySelector('[name="email"]').value;

            fetch('/api/auth/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        const form = document.getElementById('waitlistForm');
                        const successMsg = document.getElementById('waitlistSuccess');
                        if (form) form.style.display = 'none';
                        if (successMsg) {
                            successMsg.style.display = 'block';
                            successMsg.classList.add('active');
                        }
                        btnText.style.display = 'inline';
                        spinner.style.display = 'none';
                        submitBtn.disabled = false;
                        setTimeout(() => window.closeModal('waitlistModal'), 3000);
                    } else {
                        alert(data.message || 'Unable to join waitlist');
                        btnText.style.display = 'inline';
                        spinner.style.display = 'none';
                        submitBtn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Waitlist Error:', err);
                    alert('Error submitting form. Please try again.');
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    submitBtn.disabled = false;
                });
        });
    }

    // ========== SIGNUP FORM — POST /api/auth/signup ==========
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.modal-submit');
            const btnText = submitBtn.querySelector('.btn-text');
            const spinner = submitBtn.querySelector('.spinner');

            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
            submitBtn.disabled = true;

            const email = this.querySelector('[name="email"]').value;

            // For email-only signup (waitlist-style), use waitlist endpoint
            fetch('/api/auth/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        this.style.display = 'none';
                        const successMsg = document.getElementById('signupSuccess');
                        if (successMsg) {
                            successMsg.style.display = 'block';
                        }
                        btnText.style.display = 'inline';
                        spinner.style.display = 'none';
                        submitBtn.disabled = false;
                        setTimeout(() => window.closeModal('signupModal'), 3000);
                    } else {
                        alert(data.message || 'Unable to sign up');
                        btnText.style.display = 'inline';
                        spinner.style.display = 'none';
                        submitBtn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Signup Error:', err);
                    alert('Error submitting form. Please try again.');
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    submitBtn.disabled = false;
                });
        });
    }

    // ========== PRE-ORDER FORM — POST /api/preorder ==========
    const preorderForm = document.getElementById('preorderForm');
    if (preorderForm) {
        preorderForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = this.querySelector('.modal-submit');
            const btnText = btn.querySelector('.btn-text');
            const spinner = btn.querySelector('.spinner');

            btnText.style.display = 'none';
            spinner.style.display = 'inline';
            btn.disabled = true;

            // Collect form data
            const formData = {
                customer_name: this.querySelector('[name="customer_name"]').value,
                customer_email: this.querySelector('[name="customer_email"]').value,
                customer_phone: this.querySelector('[name="customer_phone"]').value,
                customer_address: this.querySelector('[name="customer_address"]').value,
                product_name: this.querySelector('[name="product_name"]') ? this.querySelector('[name="product_name"]').value : document.getElementById('hiddenProductName')?.value || '',
                product_price: parseFloat(this.querySelector('[name="product_price"]')?.value || document.getElementById('hiddenProductPrice')?.value || 0),
                quantity: parseInt(this.querySelector('[name="quantity"]')?.value || document.getElementById('hiddenQuantity')?.value || 1),
                total_amount: parseFloat(this.querySelector('[name="total_amount"]')?.value || document.getElementById('hiddenTotalAmount')?.value || 0),
            };

            fetch('/api/preorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        this.style.display = 'none';
                        const successEl = document.getElementById('preorderSuccess');
                        if (successEl) {
                            successEl.style.display = 'block';
                        }

                        btnText.style.display = 'inline';
                        spinner.style.display = 'none';
                        btn.disabled = false;

                        setTimeout(() => {
                            window.closeModal('preorderModal');
                            this.reset();
                        }, 4000);
                    } else {
                        alert('Error: ' + (data.message || 'Unable to submit order'));
                        btnText.style.display = 'inline';
                        spinner.style.display = 'none';
                        btn.disabled = false;
                    }
                })
                .catch(err => {
                    console.error('Preorder Error:', err);
                    alert('Error submitting form. Please try again.');
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    btn.disabled = false;
                });
        });
    }

}

// Next.js loads this script after hydration — DOMContentLoaded already fired.
// Run immediately if DOM is ready, otherwise wait.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommon);
} else {
    initCommon();
}
