/* ===================================
   CART SYSTEM — Nofoal
   Syncs with Zustand store via localStorage
   and Express backend
   =================================== */

(function () {
    'use strict';

    // Get session ID (for guest carts)
    function getSessionId() {
        let id = localStorage.getItem('nofoal_session_id');
        if (!id) {
            id = 'sess_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('nofoal_session_id', id);
        }
        return id;
    }

    // Get auth token (for logged-in users)
    function getToken() {
        try {
            const auth = JSON.parse(localStorage.getItem('nofoal-auth') || '{}');
            return auth?.state?.token || null;
        } catch { return null; }
    }

    // Get cart items from Zustand persisted store
    function getCartItems() {
        try {
            const cartData = JSON.parse(localStorage.getItem('nofoal-cart') || '{}');
            return cartData?.state?.items || [];
        } catch { return []; }
    }

    // Update cart in localStorage (Zustand format)
    function setCartItems(items) {
        try {
            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const cartData = { state: { items, total }, version: 0 };
            localStorage.setItem('nofoal-cart', JSON.stringify(cartData));
        } catch (err) {
            console.error('Cart storage error:', err);
        }
    }

    // API request helper
    async function apiRequest(method, path, body) {
        const headers = {
            'Content-Type': 'application/json',
            'x-session-id': getSessionId(),
        };
        const token = getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const res = await fetch('/api' + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        return res.json();
    }

    // Public cart API
    window.cart = {
        // Get item count
        getItemCount() {
            return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
        },

        // Get total
        getTotal() {
            return getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
        },

        // Get items
        getItems() {
            return getCartItems();
        },

        // Add to cart
        async addItem(productId, quantity = 1) {
            try {
                const res = await apiRequest('POST', '/cart', { productId, quantity });
                if (res.success) {
                    setCartItems(res.cart.items);
                    updateCartBadge();
                    showCartToast('Added to cart');
                    return res.cart;
                }
            } catch (err) {
                console.error('Add to cart error:', err);
            }
        },

        // Remove from cart
        async removeItem(productId) {
            try {
                const res = await apiRequest('DELETE', '/cart/' + productId);
                if (res.success) {
                    setCartItems(res.cart.items);
                    updateCartBadge();
                    return res.cart;
                }
            } catch (err) {
                console.error('Remove from cart error:', err);
            }
        },

        // Clear cart
        async clear() {
            try {
                await apiRequest('DELETE', '/cart/clear');
                setCartItems([]);
                updateCartBadge();
            } catch (err) {
                console.error('Clear cart error:', err);
            }
        },

        // Sync with backend
        async sync() {
            try {
                const res = await apiRequest('GET', '/cart');
                if (res.success) {
                    setCartItems(res.cart.items);
                    updateCartBadge();
                }
            } catch (err) {
                // Silent fail — offline or not started
            }
        },
    };

    // Update cart badge in navbar
    function updateCartBadge() {
        const count = window.cart.getItemCount();
        const badge = document.getElementById('cart-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Toast notification
    function showCartToast(message) {
        let toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 24px;
                background: #111;
                color: #fff;
                padding: 12px 20px;
                font-size: 12px;
                letter-spacing: 1px;
                text-transform: uppercase;
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.3s ease;
                clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 2000);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function () {
        updateCartBadge();
        // Sync cart with backend after a short delay
        setTimeout(() => { window.cart.sync(); }, 500);
    });

    // Cart icon click → go to cart page
    window.goToCart = function () {
        window.location.href = '/cart';
    };

})();
