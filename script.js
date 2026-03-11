// SWEET DELIGHTS BAKERY — SCRIPT v6.0
// Bugs Fixed: nested li/button in navbar, Google Translate removed, coupon discount applied properly,
// dark mode flash fix, store status outside button, clean cart rendering, auth link logic fixed

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // SAFE STORAGE — GitHub Pages / private browsing safe localStorage wrapper
    // ==========================================================================
    var safeStorage = {
        get: function(key) {
            try { return localStorage.getItem(key); } catch(e) { return null; }
        },
        set: function(key, val) {
            try { localStorage.setItem(key, val); return true; } catch(e) { return false; }
        },
        getJSON: function(key, fallback) {
            try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
        },
        setJSON: function(key, val) {
            try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e) { return false; }
        }
    };
    window.safeStorage = safeStorage;
    function showToast(message, type = 'default') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.classList.add('custom-toast');
        if (type === 'error') toast.classList.add('error');
        if (type === 'success') toast.classList.add('success');
        if (type === 'info') toast.classList.add('info');
        const icons = { default: '🍰', error: '⚠️', success: '✅', info: 'ℹ️' };
        toast.innerHTML = `<span>${icons[type] || icons.default}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3600);
    }
    window.showToast = showToast;

    // ==========================================================================
    // 1. CINEMATIC PRELOADER
    // ==========================================================================
    const preloader = document.getElementById('premium-loader');
    const percentageText = document.getElementById('loader-percentage');
    const loaderBarFill = document.querySelector('.loader-bar-fill');

    if (preloader && percentageText) {
        let count = 0;
        const loaderInterval = setInterval(() => {
            count += Math.floor(Math.random() * 14) + 5;
            if (count > 100) count = 100;
            percentageText.textContent = count + '%';
            if (loaderBarFill) loaderBarFill.style.width = count + '%';
            if (count === 100) {
                clearInterval(loaderInterval);
                setTimeout(() => preloader.classList.add('loaded'), 350);
            }
        }, 60);
        setTimeout(() => { if (preloader) preloader.classList.add('loaded'); }, 3000);
    }

    // ==========================================================================
    // 2. MOBILE HAMBURGER MENU
    // ==========================================================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    // Inject close button into nav panel (for mobile)
    if (navLinks && !document.querySelector('.nav-close-btn')) {
        var navCloseBtn = document.createElement('button');
        navCloseBtn.className = 'nav-close-btn';
        navCloseBtn.innerHTML = '&#x2715;';
        navCloseBtn.title = 'Close menu';
        navCloseBtn.setAttribute('aria-label', 'Close navigation');
        navLinks.insertBefore(navCloseBtn, navLinks.firstChild);
        navCloseBtn.addEventListener('click', closeNav);
    }

    function openNav() {
        if (!navLinks) return;
        navLinks.classList.add('nav-active');
        if (hamburger) hamburger.classList.add('toggle');
        document.body.classList.add('tray-open');
    }
    function closeNav() {
        if (!navLinks) return;
        navLinks.classList.remove('nav-active');
        if (hamburger) hamburger.classList.remove('toggle');
        document.body.classList.remove('tray-open');
    }
    window.closeNav = closeNav;

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navLinks.classList.contains('nav-active')) closeNav();
            else openNav();
        });
        // Close when a nav link is tapped
        navLinks.querySelectorAll('a').forEach(function(item) {
            item.addEventListener('click', closeNav);
        });
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('nav-active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                closeNav();
            }
        });
    }

    // ==========================================================================
    // 3. DARK MODE — persists across all pages, no flash
    // ==========================================================================
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Apply saved theme immediately
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeBtn) themeBtn.textContent = '☀️';
    } else {
        if (themeBtn) themeBtn.textContent = '🌙';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeBtn.textContent = isDark ? '☀️' : '🌙';
        });
    }

    // ==========================================================================
    // 4. HERO SLIDESHOW WITH DOT INDICATORS
    // ==========================================================================
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slide-dots');

    if (slides.length > 0) {
        let currentSlide = 0;
        if (dotsContainer) {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            });
        }
        function goToSlide(index) {
            slides[currentSlide].classList.remove('active');
            if (dotsContainer) dotsContainer.children[currentSlide]?.classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if (dotsContainer) dotsContainer.children[currentSlide]?.classList.add('active');
        }
        setInterval(() => goToSlide(currentSlide + 1), 5500);
    }

    // ==========================================================================
    // 5. 3D TILT CARDS
    // ==========================================================================
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y - rect.height / 2) / rect.height) * -10;
            const rotateY = ((x - rect.width / 2) / rect.width) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            setTimeout(() => { card.style.transition = 'transform 0.15s ease'; }, 500);
        });
    });

    // ==========================================================================
    // 6. SCROLL PROGRESS BAR, FADE-UP OBSERVER & NAVBAR SCROLL
    // ==========================================================================
    const progressBar = document.getElementById('myBar');
    const navbar = document.querySelector('.navbar');
    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const winScroll = window.scrollY;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                if (progressBar && height > 0) progressBar.style.width = ((winScroll / height) * 100) + '%';
                if (navbar) navbar.classList.toggle('scrolled', winScroll > 50);
                const backToTopBtn = document.getElementById('back-to-top');
                if (backToTopBtn) backToTopBtn.classList.toggle('visible', winScroll > 300);
                ticking = false;
            });
            ticking = true;
        }
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // ==========================================================================
    // 7. SEARCH BAR (integrated with filters)
    // ==========================================================================
    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            document.querySelectorAll('.menu-grid .menu-card').forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const category = card.getAttribute('data-category') || '';
                const matchesSearch = !query || title.includes(query);
                const matchesFilter = activeFilter === 'all' || category === activeFilter;
                card.style.display = matchesSearch && matchesFilter ? 'flex' : 'none';
            });
        });
    }

    // ==========================================================================
    // 8. ORDER TRAY SIDEBAR
    // ==========================================================================
    const trayToggleBtn = document.getElementById('tray-toggle');
    const closeTrayBtn = document.getElementById('close-tray');
    const traySidebar = document.getElementById('tray-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const trayItemsContainer = document.getElementById('tray-items');
    const trayBadge = document.getElementById('tray-badge');
    const subtotalDisplay = document.getElementById('tray-subtotal');
    const taxDisplay = document.getElementById('tray-tax');
    const discountDisplay = document.getElementById('tray-discount');
    const totalPriceDisplay = document.getElementById('tray-total-price');

    function openTray() {
        if (traySidebar) traySidebar.classList.add('open');
        if (sidebarOverlay) sidebarOverlay.classList.add('open');
        document.body.classList.add('tray-open');
    }
    function closeTray() {
        if (traySidebar) traySidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('open');
        document.body.classList.remove('tray-open');
    }
    window.openTray = openTray;
    window.closeTray = closeTray;

    if (trayToggleBtn) trayToggleBtn.addEventListener('click', openTray);
    if (closeTrayBtn) closeTrayBtn.addEventListener('click', closeTray);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeTray);

    let cart = safeStorage.getJSON('bakeryCart', []);
    let discountPercent = 0;

    function renderCart() {
        if (!trayItemsContainer) return;
        trayItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            trayItemsContainer.innerHTML = '<p class="empty-msg">🛍️ Your tray is empty!<br><small>Add some sweet treats above.</small></p>';
            if (trayBadge) trayBadge.textContent = '0';
            updateTotals(0);
            return;
        }

        cart.forEach((item, index) => {
            const numericPrice = parseFloat(item.price.replace('$', '')) || 0;
            subtotal += numericPrice;
            const displayEmoji = item.emoji || '🧁';
            const displayBg = item.bg || '#f9edd8';

            const itemWrapper = document.createElement('div');
            itemWrapper.classList.add('tray-item-wrapper');
            itemWrapper.innerHTML = `
                <div class="delete-bg">🗑️</div>
                <div class="tray-item">
                    <div class="tray-item-img" style="background:${displayBg};">${displayEmoji}</div>
                    <div class="tray-item-info"><h4>${item.name}</h4><p>${item.price}</p></div>
                    <button class="remove-item" title="Remove">✖</button>
                </div>`;

            const trayItemInner = itemWrapper.querySelector('.tray-item');
            itemWrapper.querySelector('.remove-item').addEventListener('click', () => deleteItem(index));

            // Swipe to delete
            let startX = 0, currentX = 0, isSwiping = false;
            trayItemInner.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX; currentX = startX; isSwiping = true;
                trayItemInner.classList.add('swiping');
            }, { passive: true });
            trayItemInner.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;
                currentX = e.touches[0].clientX;
                const diffX = currentX - startX;
                if (diffX < 0) trayItemInner.style.transform = `translateX(${diffX}px)`;
            }, { passive: true });
            trayItemInner.addEventListener('touchend', () => {
                isSwiping = false;
                trayItemInner.classList.remove('swiping');
                const diffX = currentX - startX;
                if (diffX < -70) {
                    trayItemInner.style.transform = 'translateX(-100%)';
                    setTimeout(() => deleteItem(index), 250);
                } else {
                    trayItemInner.style.transform = 'translateX(0)';
                }
            });
            trayItemsContainer.appendChild(itemWrapper);
        });

        if (trayBadge) trayBadge.textContent = cart.length;
        updateTotals(subtotal);
    }

    function updateTotals(subtotal) {
        const discount = subtotal * discountPercent;
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.05;
        const finalTotal = afterDiscount + tax;

        if (subtotalDisplay) subtotalDisplay.textContent = '$' + subtotal.toFixed(2);
        if (discountDisplay) discountDisplay.textContent = '-$' + discount.toFixed(2);
        if (taxDisplay) taxDisplay.textContent = '$' + tax.toFixed(2);
        if (totalPriceDisplay) totalPriceDisplay.textContent = '$' + finalTotal.toFixed(2);
    }

    function deleteItem(index) {
        cart.splice(index, 1);
        safeStorage.setJSON('bakeryCart', cart);
        renderCart();
        showToast('Item removed from tray', 'info');
    }

    renderCart();

    // ADD TO TRAY buttons
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.menu-card');
            if (!card) return;
            const imgPlaceholder = card.querySelector('.img-placeholder');
            cart.push({
                name: this.getAttribute('data-name'),
                price: this.getAttribute('data-price'),
                emoji: imgPlaceholder ? imgPlaceholder.textContent.trim() : '🧁',
                bg: imgPlaceholder ? (imgPlaceholder.style.background || imgPlaceholder.style.backgroundColor || '#f9edd8') : '#f9edd8'
            });
            safeStorage.setJSON('bakeryCart', cart);
            renderCart();
            if (trayBadge) { trayBadge.classList.add('pop'); setTimeout(() => trayBadge.classList.remove('pop'), 300); }
            const orig = this.innerHTML;
            this.innerHTML = '✅ Added!';
            this.style.background = 'var(--primary)';
            this.style.color = 'white';
            setTimeout(() => { this.innerHTML = orig; this.style.background = ''; this.style.color = ''; }, 1600);
        });
    });

    // ==========================================================================
    // 9. COUPON SYSTEM (BUG FIX: discount actually applied to totals)
    // ==========================================================================
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', () => {
            const couponInput = document.getElementById('coupon-input');
            if (!couponInput) return;
            const code = couponInput.value.toUpperCase().trim();
            const coupons = { 'SWEET10': 0.10, 'BAKE20': 0.20, 'FIRST15': 0.15 };
            if (coupons[code]) {
                discountPercent = coupons[code];
                showToast(`${Math.round(discountPercent * 100)}% Discount Applied! 🎉`, 'success');
                applyCouponBtn.textContent = '✓';
                applyCouponBtn.style.background = '#27ae60';
                couponInput.disabled = true;
                renderCart();
            } else {
                showToast('Invalid coupon code', 'error');
                couponInput.value = '';
            }
        });
    }

    // ==========================================================================
    // ==========================================================================
    // 10. PLACE ORDER → NAVIGATE TO CHECKOUT PAGE
    // ==========================================================================
    window.__placeOrderNav = function() {
        var cartData = safeStorage.getJSON('bakeryCart', []);
        if (!cartData || cartData.length === 0) {
            showToast('Your tray is empty! Add some treats first.', 'error');
            return;
        }
        // Navigate to checkout page
        window.location.href = 'checkout.html';
    };

    // Also support the button directly (in case onclick attr not used)
    var placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.__placeOrderNav();
        });
    }

        // 11. LIGHTBOX
    // ==========================================================================
    const lightbox = document.getElementById('lightbox');
    const closeLightbox = document.querySelector('.close-lightbox');
    if (closeLightbox && lightbox) closeLightbox.addEventListener('click', () => lightbox.classList.remove('active'));
    if (lightbox) lightbox.addEventListener('click', e => { if (e.target !== document.getElementById('lightbox-img')) lightbox.classList.remove('active'); });

    // ==========================================================================
    // 12. RIPPLE EFFECT
    // ==========================================================================
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const span = document.createElement('span');
            span.classList.add('ripple-span');
            span.style.left = (e.clientX - rect.left) + 'px';
            span.style.top = (e.clientY - rect.top) + 'px';
            this.appendChild(span);
            setTimeout(() => span.remove(), 650);
        });
    });

    // ==========================================================================
    // 13. STAR RATING
    // ==========================================================================
    const starElements = document.querySelectorAll('#star-rating span');
    let selectedRating = 0;
    if (starElements.length > 0) {
        starElements.forEach(star => {
            star.addEventListener('mouseover', function () {
                const val = parseInt(this.getAttribute('data-value'));
                starElements.forEach(s => { s.style.color = parseInt(s.getAttribute('data-value')) <= val ? '#f1c40f' : '#ccc'; });
            });
            star.addEventListener('mouseleave', function () {
                starElements.forEach(s => { s.style.color = parseInt(s.getAttribute('data-value')) <= selectedRating ? '#f1c40f' : '#ccc'; });
            });
            star.addEventListener('click', function () {
                selectedRating = parseInt(this.getAttribute('data-value'));
                starElements.forEach(s => {
                    const active = parseInt(s.getAttribute('data-value')) <= selectedRating;
                    s.style.color = active ? '#f1c40f' : '#ccc';
                    s.style.transform = active ? 'scale(1.25)' : 'scale(1)';
                });
            });
        });
    }

    // ==========================================================================
    // 14. WISHLIST
    // ==========================================================================
    document.querySelectorAll('.save-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            const card = this.closest('.menu-card');
            const img = card?.querySelector('.img-placeholder');
            const emoji = img ? img.textContent.trim() : '🧁';
            const bg = img ? (img.style.background || img.style.backgroundColor || '#f9edd8') : '#f9edd8';
            const wishlist = safeStorage.getJSON('bakeryWishlist', []);
            const exists = wishlist.find(i => i.name === name);
            if (!exists) {
                wishlist.push({ name, price, emoji, bg });
                safeStorage.setJSON('bakeryWishlist', wishlist);
                const orig = this.innerHTML;
                this.innerHTML = '⭐ Saved!';
                this.style.background = 'var(--primary)';
                this.style.color = 'white';
                showToast(`${name} saved to wishlist!`);
                setTimeout(() => { this.innerHTML = orig; this.style.background = ''; this.style.color = ''; }, 1600);
            } else {
                showToast('Already in your wishlist!', 'info');
                this.innerHTML = '✓ In Wishlist';
                setTimeout(() => { this.innerHTML = '🤍 Save'; }, 1600);
            }
        });
    });

    // WISHLIST PAGE — render saved items
    const wishlistContainer = document.getElementById('wishlist-container');
    function renderWishlist() {
        if (!wishlistContainer) return;
        const savedItems = safeStorage.getJSON('bakeryWishlist', []);
        if (savedItems.length === 0) {
            wishlistContainer.innerHTML = `
                <div style="width:100%;text-align:center;padding:60px 20px;">
                    <div style="font-size:4rem;margin-bottom:16px;">🤍</div>
                    <h3 style="color:var(--text-muted);">Your wishlist is empty!</h3>
                    <a href="index.html#featured" class="btn" style="margin-top:16px;">Explore Menu</a>
                </div>`;
            return;
        }
        wishlistContainer.innerHTML = '';
        savedItems.forEach((item, index) => {
            const displayEmoji = item.emoji || '🧁';
            const displayBg = item.bg || '#f9edd8';
            const itemCard = document.createElement('div');
            itemCard.classList.add('menu-card', 'fade-up', 'is-visible');
            itemCard.innerHTML = `
                <div class="img-placeholder" style="background:${displayBg};height:180px;margin-bottom:15px;border-radius:12px;font-size:5rem;width:100%;display:flex;align-items:center;justify-content:center;">${displayEmoji}</div>
                <h3>${item.name}</h3>
                <p class="price-tag">${item.price}</p>
                <div class="card-actions">
                    <button class="btn wishlist-add-tray ripple" style="flex:1;padding:10px;font-size:0.88rem;">🛍️ Add to Tray</button>
                    <button class="btn remove-wishlist-btn ripple" data-index="${index}" style="flex:1;padding:10px;font-size:0.88rem;background:transparent;color:#e74c3c;border:1.5px solid #e74c3c;">🗑️ Remove</button>
                </div>`;

            itemCard.querySelector('.wishlist-add-tray').addEventListener('click', function () {
                cart.push({ name: item.name, price: item.price, emoji: item.emoji, bg: item.bg });
                safeStorage.setJSON('bakeryCart', cart);
                renderCart();
                const orig = this.innerHTML;
                this.innerHTML = '✅ Added!';
                this.style.background = '#27ae60';
                this.style.color = 'white';
                showToast(`${item.name} added to tray!`);
                setTimeout(() => { this.innerHTML = orig; this.style.background = ''; this.style.color = ''; }, 1500);
            });
            itemCard.querySelector('.remove-wishlist-btn').addEventListener('click', function () {
                savedItems.splice(parseInt(this.getAttribute('data-index')), 1);
                safeStorage.setJSON('bakeryWishlist', savedItems);
                showToast('Removed from wishlist', 'info');
                renderWishlist();
            });
            wishlistContainer.appendChild(itemCard);
        });
    }
    renderWishlist();

    // ==========================================================================
    // 15. MISC — Footer Year, Back to Top
    // ==========================================================================
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ==========================================================================
    // 16. MY ORDERS — Real-time tracking
    // ==========================================================================
    const ordersContainer = document.getElementById('orders-container');

    function renderOrders() {
        if (!ordersContainer) return;
        const orderHistory = safeStorage.getJSON('bakeryOrders', []);
        if (orderHistory.length === 0) {
            ordersContainer.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:4rem;margin-bottom:16px;">📦</div>
                    <h3 style="color:var(--text-muted);">No orders yet!</h3>
                    <a href="index.html#featured" class="btn" style="margin-top:16px;">Start Shopping</a>
                </div>`;
            return;
        }
        ordersContainer.innerHTML = '';
        orderHistory.forEach(order => {
            let itemsHtml = (order.items || []).map(item =>
                `<li class="order-item-row"><span class="order-item-name">${item.emoji || '🧁'} ${item.name}</span><span class="order-item-price">${item.price}</span></li>`
            ).join('');

            let statusHtml = '';
            if (order.status === 0) {
                statusHtml = `<div class="cancelled-text">⚠️ Order Cancelled.</div>`;
            } else {
                const progressMap = { 1: '5%', 2: '50%', 3: '100%' };
                const vehicleMap = { 1: '🛒', 2: '👨‍🍳', 3: '🛵' };
                const progress = progressMap[order.status] || '5%';
                const vehicle = vehicleMap[order.status] || '🛒';
                const labels = [order.status >= 1, order.status >= 2, order.status >= 3];
                statusHtml = `
                    <div class="animated-tracker-container">
                        <div class="animated-tracker">
                            <div class="tracker-progress" style="width:${progress};"></div>
                            <div class="tracker-vehicle" style="left:${progress};">${vehicle}</div>
                        </div>
                        <div class="tracker-labels">
                            <span class="${labels[0] ? 'active' : ''}">Placed</span>
                            <span class="${labels[1] ? 'active' : ''}">Baking</span>
                            <span class="${labels[2] ? 'active' : ''}">Ready/Out</span>
                        </div>
                    </div>`;
            }

            const typeTag = order.orderType ? `<span style="background:rgba(200,64,30,0.1);color:var(--primary);padding:3px 10px;border-radius:50px;font-size:0.78rem;font-weight:700;">${order.orderType}</span>` : '';
            const card = document.createElement('div');
            card.classList.add('order-card', 'fade-up', 'is-visible');
            card.innerHTML = `
                <div class="order-header">
                    <h3>Order #${order.id} ${typeTag}</h3>
                    <span>${order.date}</span>
                </div>
                <ul class="order-items-list">${itemsHtml}</ul>
                <div style="text-align:right;font-size:1.15rem;font-weight:700;color:var(--primary);margin-bottom:18px;">Total: ${order.total}</div>
                ${statusHtml}
                <div style="text-align:center;margin-top:20px;border-top:1px dashed var(--border-color);padding-top:14px;">
                    <button class="btn-receipt ripple" onclick="window.downloadReceipt('${order.id}')">⬇️ Download Receipt</button>
                </div>`;
            ordersContainer.appendChild(card);
        });
    }

    if (ordersContainer) {
        renderOrders();
        let lastOrderData = safeStorage.get('bakeryOrders');
        setInterval(() => {
            const newData = safeStorage.get('bakeryOrders');
            if (newData !== lastOrderData) { lastOrderData = newData; renderOrders(); }
        }, 1500);
    }

    // ==========================================================================
    // 17. ADMIN DASHBOARD
    // ==========================================================================
    const adminOrdersContainer = document.getElementById('admin-orders-container');

    window.renderAdminOrders = function () {
        if (!adminOrdersContainer) return;
        const allOrders = safeStorage.getJSON('bakeryOrders', []);
        if (allOrders.length === 0) {
            adminOrdersContainer.innerHTML = '<p style="color:var(--text-muted);">No orders yet.</p>';
            updateAdminAnalytics();
            return;
        }
        adminOrdersContainer.innerHTML = '';
        allOrders.forEach((order, index) => {
            const itemsList = (order.items || []).map(i => `${i.name}`).join(', ');
            const statusLabel = ['❌ CANCELLED', '🆕 New Order', '👨‍🍳 Baking...', '📦 Ready/Delivering'][order.status] || 'Unknown';
            const card = document.createElement('div');
            card.classList.add('admin-card');
            card.innerHTML = `
                <div class="admin-card-info">
                    <h3 style="margin:0;color:var(--primary);font-size:1.1rem;">Order #${order.id}</h3>
                    <p style="margin:6px 0;color:var(--text-muted);font-size:0.88rem;">${order.date} · <strong style="color:var(--text-dark);">${order.total}</strong> · ${order.orderType || 'Pickup'}</p>
                    <p style="margin:4px 0;font-size:0.9rem;"><strong>Items:</strong> ${itemsList}</p>
                    ${order.address && order.address !== 'Store Pickup' ? `<p style="margin:4px 0;color:#888;font-size:0.85rem;">📍 ${order.address}</p>` : ''}
                    <p style="margin:10px 0 0;font-size:0.95rem;color:var(--primary);"><strong>Status: ${statusLabel}</strong></p>
                </div>
                <div class="admin-card-actions">
                    <button class="admin-btn btn-bake" onclick="window.updateOrderStatus(${index},2)">Mark Baking 👨‍🍳</button>
                    <button class="admin-btn btn-ready" onclick="window.updateOrderStatus(${index},3)">Mark Ready 📦</button>
                    <button class="admin-btn btn-cancel" onclick="window.updateOrderStatus(${index},0)">Cancel ❌</button>
                </div>`;
            adminOrdersContainer.appendChild(card);
        });
        updateAdminAnalytics();
    };

    window.updateOrderStatus = function (orderIndex, newStatus) {
        const allOrders = safeStorage.getJSON('bakeryOrders', []);
        if (!allOrders[orderIndex]) return;
        allOrders[orderIndex].status = newStatus;
        safeStorage.setJSON('bakeryOrders', allOrders);
        showToast('Order status updated!', 'success');
        window.renderAdminOrders();
    };

    function updateAdminAnalytics() {
        const revEl = document.getElementById('admin-total-revenue');
        const countEl = document.getElementById('admin-total-orders');
        if (!revEl && !countEl) return;
        const allOrders = safeStorage.getJSON('bakeryOrders', []);
        let revenue = 0, count = 0;
        allOrders.forEach(o => {
            if (o.status !== 0) { count++; revenue += parseFloat(o.total?.replace('$', '') || 0); }
        });
        if (countEl) countEl.textContent = count;
        if (revEl) revEl.textContent = '$' + revenue.toFixed(2);

        // Revenue chart
        if (document.getElementById('revenueChart')) {
            let deliveryRev = 0, pickupRev = 0;
            allOrders.forEach(o => {
                const amt = parseFloat(o.total?.replace('$', '') || 0);
                if (o.orderType === 'Delivery') deliveryRev += amt;
                else pickupRev += amt;
            });
            const ctx = document.getElementById('revenueChart').getContext('2d');
            if (window._adminChart) window._adminChart.destroy();
            window._adminChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Delivery Revenue', 'Pickup Revenue'],
                    datasets: [{ data: [deliveryRev || 0.1, pickupRev || 0.1], backgroundColor: ['#c8401e', '#c9963e'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { font: { family: 'Outfit' } } } } }
            });
        }
    }

    window.renderAdminOrders();

    // ==========================================================================
    // 18. CONTACT FORM
    // ==========================================================================
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn ? (submitBtn.querySelector('.btn-text') || submitBtn) : null;
            if (submitBtn) submitBtn.classList.add('loading');
            if (btnText) btnText.textContent = 'Sending... ⌛';

            try {
                const ctrl = new AbortController();
                setTimeout(() => ctrl.abort(), 8000);
                fetch('https://formspree.io/f/xvzwzlln', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: ctrl.signal,
                    body: JSON.stringify({
                        Subject: 'New Custom Cake Request!',
                        Customer_Name: document.getElementById('name')?.value || '',
                        Customer_Email: document.getElementById('email')?.value || '',
                        Date_Needed: document.getElementById('date')?.value || '',
                        Order_Details: document.getElementById('details')?.value || ''
                    })
                }).then(function() {
                    if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.classList.add('success'); }
                    if (btnText) btnText.textContent = '✅ Request Sent!';
                    orderForm.reset();
                    showToast('Your cake request was sent! 🎂', 'success');
                    setTimeout(function() {
                        if (submitBtn) submitBtn.classList.remove('success');
                        if (btnText) btnText.textContent = 'Send Request ✉️';
                    }, 3500);
                }).catch(function() {
                    if (submitBtn) submitBtn.classList.remove('loading');
                    if (btnText) btnText.textContent = 'Send Request ✉️';
                    showToast('Something went wrong. Try again.', 'error');
                });
            } catch(err) {
                if (submitBtn) submitBtn.classList.remove('loading');
                if (btnText) btnText.textContent = 'Send Request ✉️';
                showToast('Something went wrong. Try again.', 'error');
            }
        });
    }

    // ==========================================================================
    // 19. PUBLIC REVIEWS
    // ==========================================================================
    function renderPublicReviews() {
        const container = document.getElementById('public-reviews-container');
        if (!container) return;
        const allReviews = safeStorage.getJSON('bakeryReviews', []);
        if (allReviews.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-style:italic;">No reviews yet. Be the first to share!</p>';
            return;
        }
        container.innerHTML = `<h3 style="text-align:center;color:var(--primary);font-size:1.6rem;margin-bottom:24px;font-family:\'Cormorant Garamond\',serif;">What Our Customers Say 💖</h3>`;
        allReviews.forEach(rev => {
            const filled = '★'.repeat(rev.rating);
            const empty = '★'.repeat(5 - rev.rating);
            container.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div><span style="color:#f1c40f;font-size:1.15rem;">${filled}</span><span style="color:#ddd;font-size:1.15rem;">${empty}</span></div>
                        <div style="color:var(--text-muted);font-size:0.8rem;">${rev.date}</div>
                    </div>
                    <p class="review-text">"${rev.text}"</p>
                </div>`;
        });
    }
    renderPublicReviews();

    const submitFeedback = document.getElementById('submit-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackSuccess = document.getElementById('feedback-success');
    if (submitFeedback) {
        submitFeedback.onclick = () => {
            if (selectedRating > 0 && feedbackText?.value.trim()) {
                const allReviews = safeStorage.getJSON('bakeryReviews', []);
                allReviews.unshift({ rating: selectedRating, text: feedbackText.value.trim(), date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) });
                safeStorage.setJSON('bakeryReviews', allReviews);
                submitFeedback.style.display = 'none';
                if (feedbackText) feedbackText.style.display = 'none';
                const starRating = document.getElementById('star-rating');
                if (starRating) starRating.style.display = 'none';
                if (feedbackSuccess) feedbackSuccess.classList.add('show');
                renderPublicReviews();
                showToast('Thank you for your feedback! 💖', 'success');
            } else {
                showToast('Please select stars and write a comment!', 'error');
            }
        };
    }

    // ==========================================================================
    // 20. ADMIN REVIEWS
    // ==========================================================================
    const adminReviewsContainer = document.getElementById('admin-reviews-container');
    window.renderAdminReviews = function () {
        if (!adminReviewsContainer) return;
        const allReviews = safeStorage.getJSON('bakeryReviews', []);
        if (allReviews.length === 0) { adminReviewsContainer.innerHTML = '<p style="color:var(--text-muted);">No reviews yet.</p>'; return; }
        adminReviewsContainer.innerHTML = '';
        allReviews.forEach((rev, index) => {
            adminReviewsContainer.innerHTML += `
                <div class="admin-card" style="align-items:center;">
                    <div class="admin-card-info">
                        <p style="font-size:1.1rem;margin:0 0 5px;"><span style="color:#f1c40f;">${'★'.repeat(rev.rating)}</span><span style="color:#ddd;">${'★'.repeat(5-rev.rating)}</span> <span style="color:var(--text-muted);font-size:0.82rem;">${rev.date}</span></p>
                        <p style="margin:0;font-style:italic;color:var(--text-muted);">"${rev.text}"</p>
                    </div>
                    <div class="admin-card-actions">
                        <button class="admin-btn btn-cancel" onclick="window.deleteReview(${index})">Delete 🗑️</button>
                    </div>
                </div>`;
        });
        const reviewsEl = document.getElementById('admin-total-reviews');
        if (reviewsEl) reviewsEl.textContent = allReviews.length;
    };
    window.deleteReview = function (index) {
        if (confirm('Delete this review permanently?')) {
            const allReviews = safeStorage.getJSON('bakeryReviews', []);
            allReviews.splice(index, 1);
            safeStorage.setJSON('bakeryReviews', allReviews);
            window.renderAdminReviews();
            renderPublicReviews();
        }
    };
    window.renderAdminReviews();

    // ==========================================================================
    // 21. MENU CATEGORY FILTERS
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-grid .menu-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            const query = document.getElementById('menu-search')?.value.toLowerCase().trim() || '';
            menuCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const matchesFilter = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
                const matchesSearch = !query || title.includes(query);
                card.style.display = matchesFilter && matchesSearch ? 'flex' : 'none';
            });
        });
    });

    // ==========================================================================
    // 22. DELIVERY FEE LOGIC
    // ==========================================================================
    const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
    const addressContainer = document.getElementById('delivery-address-container');

    if (orderTypeRadios.length > 0) {
        orderTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isDelivery = e.target.value === 'delivery';
                if (addressContainer) addressContainer.style.display = isDelivery ? 'block' : 'none';
                const addressInput = document.getElementById('delivery-address');
                if (addressInput) {
                    isDelivery ? addressInput.setAttribute('required', '') : addressInput.removeAttribute('required');
                }
                const baseTotal = parseFloat(document.getElementById('tray-total-price')?.textContent.replace('$', '') || '0');
                const deliveryFee = isDelivery ? 5.00 : 0;
                if (payAmountSpan) payAmountSpan.textContent = '$' + (baseTotal + deliveryFee).toFixed(2);
            });
        });
    }

    // ==========================================================================
    // 23. QUICK VIEW MODAL
    // ==========================================================================
    const quickViewModal = document.getElementById('quick-view-modal');
    const closeQuickView = document.getElementById('close-quick-view');
    let currentQvItem = null;
    let qvQuantity = 1;

    document.querySelectorAll('.menu-card').forEach(card => {
        const imgWrapper = card.querySelector('.card-image-wrapper');
        if (imgWrapper) {
            imgWrapper.addEventListener('click', () => {
                const title = card.querySelector('h3')?.textContent || '';
                const desc = card.querySelector('p')?.textContent || '';
                const price = card.querySelector('.wishlist-btn')?.getAttribute('data-price') || '$0.00';
                const img = card.querySelector('.img-placeholder');
                const emoji = img?.textContent.trim() || '🧁';
                const bg = img?.style.background || '#f9edd8';

                document.getElementById('qv-title').textContent = title;
                document.getElementById('qv-desc').textContent = desc;
                document.getElementById('qv-price').textContent = price;
                const qvImg = document.getElementById('qv-image');
                if (qvImg) { qvImg.textContent = emoji; qvImg.style.background = bg; }

                currentQvItem = { name: title, price, emoji, bg };
                qvQuantity = 1;
                document.getElementById('qv-qty').textContent = 1;
                if (quickViewModal) { quickViewModal.classList.add('active'); document.body.classList.add('modal-open'); }
            });
        }
    });

    if (closeQuickView) closeQuickView.addEventListener('click', function() {
        if (quickViewModal) quickViewModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    });
    if (quickViewModal) quickViewModal.addEventListener('click', function(e) {
        if (e.target === quickViewModal) { quickViewModal.classList.remove('active'); document.body.classList.remove('modal-open'); }
    });

    const qvMinus = document.getElementById('qv-minus');
    const qvPlus = document.getElementById('qv-plus');
    if (qvMinus) qvMinus.addEventListener('click', () => { if (qvQuantity > 1) { qvQuantity--; document.getElementById('qv-qty').textContent = qvQuantity; } });
    if (qvPlus) qvPlus.addEventListener('click', () => { qvQuantity++; document.getElementById('qv-qty').textContent = qvQuantity; });

    const qvAddToCart = document.getElementById('qv-add-to-cart');
    if (qvAddToCart) {
        qvAddToCart.addEventListener('click', () => {
            if (!currentQvItem) return;
            for (let i = 0; i < qvQuantity; i++) { cart.push({ ...currentQvItem }); }
            safeStorage.setJSON('bakeryCart', cart);
            renderCart();
            if (trayBadge) { trayBadge.classList.add('pop'); setTimeout(() => trayBadge.classList.remove('pop'), 300); }
            const orig = qvAddToCart.innerHTML;
            qvAddToCart.innerHTML = '✅ Added!';
            qvAddToCart.style.backgroundColor = '#27ae60';
            showToast(`${qvQuantity}x ${currentQvItem.name} added! 🎉`);
            setTimeout(() => {
                qvAddToCart.innerHTML = orig;
                qvAddToCart.style.backgroundColor = '';
                if (quickViewModal) { quickViewModal.classList.remove('active'); document.body.classList.remove('modal-open'); }
                openTray();
            }, 900);
        });
    }

    // ==========================================================================
    // 24. CART UPSELL
    // ==========================================================================
    document.querySelectorAll('.upsell-add').forEach(btn => {
        btn.addEventListener('click', function () {
            cart.push({ name: this.getAttribute('data-name'), price: this.getAttribute('data-price'), emoji: this.getAttribute('data-emoji'), bg: this.getAttribute('data-bg') });
            safeStorage.setJSON('bakeryCart', cart);
            renderCart();
            const orig = this.textContent;
            this.textContent = '✓';
            this.style.backgroundColor = '#27ae60';
            showToast(this.getAttribute('data-name') + ' added!');
            setTimeout(() => { this.textContent = orig; this.style.backgroundColor = ''; }, 1000);
        });
    });

    // ==========================================================================
    // 25. GPS LOCATION
    // ==========================================================================
    const gpsBtn = document.getElementById('gps-btn');
    const addressInput = document.getElementById('delivery-address');
    if (gpsBtn && addressInput) {
        gpsBtn.addEventListener('click', () => {
            if (!navigator.geolocation) { showToast('Geolocation not supported.', 'error'); return; }
            gpsBtn.innerHTML = 'Locating... ⌛';
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`)
                    .then(r => r.json())
                    .then(data => {
                        addressInput.value = data.display_name;
                        gpsBtn.innerHTML = '📍 Location Found!';
                        gpsBtn.style.background = '#27ae60';
                        showToast('Location detected!', 'success');
                        setTimeout(() => { gpsBtn.innerHTML = '📍 Use Current Location'; gpsBtn.style.background = ''; }, 3000);
                    }).catch(() => {
                        addressInput.value = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                        gpsBtn.innerHTML = '📍 Use Current Location';
                    });
            }, () => {
                showToast('Please allow location access.', 'error');
                gpsBtn.innerHTML = '📍 Use Current Location';
            });
        });
    }

    // ==========================================================================
    // 26. RECEIPT MODAL (in-page, no window.open, no page navigation)
    // ==========================================================================

    // Inject receipt modal into page if not already present
    function ensureReceiptModal() {
        if (document.getElementById('receipt-modal-overlay')) return;
        var overlay = document.createElement('div');
        overlay.id = 'receipt-modal-overlay';
        overlay.innerHTML =
            '<div id="receipt-modal-card">' +
                '<button id="receipt-close-btn" title="Close">&#10005;</button>' +
                '<div id="receipt-modal-body"></div>' +
                '<div id="receipt-modal-actions">' +
                    '<button id="receipt-save-btn" class="btn" style="margin-top:0;padding:12px 28px;font-size:0.92rem;background:#27ae60;">&#128190; Save as PDF</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function(e) { if (e.target === overlay) closeReceiptModal(); });
        document.getElementById('receipt-close-btn').addEventListener('click', closeReceiptModal);

        // MOBILE-SAFE: Use download via blob URL instead of window.print()
        document.getElementById('receipt-save-btn').addEventListener('click', function() {
            var body = document.getElementById('receipt-modal-body').innerHTML;
            var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt - Sweet Delights</title>' +
                '<style>*{box-sizing:border-box;margin:0;padding:0}' +
                'body{font-family:Arial,sans-serif;background:#fdfbf7;padding:24px;color:#1e1208}' +
                '.rct-box{border:2px solid #c8401e;border-radius:16px;padding:32px;max-width:480px;margin:auto}' +
                '.rct-logo{text-align:center;font-size:3rem;margin-bottom:8px}' +
                '.rct-title{text-align:center;color:#c8401e;font-size:1.3rem;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:4px}' +
                '.rct-sub{text-align:center;color:#888;font-size:0.82rem;margin-bottom:18px}' +
                '.rct-divider{border:none;border-top:2px dashed #f0e8e0;margin:16px 0}' +
                '.rct-row{display:flex;justify-content:space-between;margin-bottom:7px;font-size:0.88rem}' +
                '.rct-badge{background:#27ae60;color:white;padding:2px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;display:inline-block}' +
                'table{width:100%;border-collapse:collapse;margin:10px 0}' +
                'td{padding:8px 0;border-bottom:1px solid #f0e8e0;font-size:0.88rem}' +
                'td:last-child{text-align:right;font-weight:700;color:#c8401e}' +
                '.rct-total{text-align:right;font-size:1.5rem;font-weight:700;color:#c8401e;margin-top:12px}' +
                '.rct-footer{text-align:center;margin-top:18px;font-size:0.78rem;color:#aaa;line-height:1.9;font-style:italic}' +
                '@media print{body{padding:0}}</style>' +
                '</head><body>' + body + '</body></html>';
            // Try share API first (mobile native), fallback to blob download
            if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
                // Create blob and share as file
                var blob = new Blob([html], { type: 'text/html' });
                var file = new File([blob], 'receipt-sweet-delights.html', { type: 'text/html' });
                navigator.share({ files: [file], title: 'Sweet Delights Receipt' }).catch(function() {
                    downloadReceiptBlob(html);
                });
            } else {
                downloadReceiptBlob(html);
            }
        });

        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeReceiptModal(); });
    }

    function downloadReceiptBlob(html) {
        try {
            var blob = new Blob([html], { type: 'text/html' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'receipt-sweet-delights.html';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
            showToast('Receipt downloaded! Open the file to print/save as PDF.', 'success');
        } catch(e) {
            showToast('Could not download receipt. Try screenshotting instead.', 'info');
        }
    }

    function closeReceiptModal() {
        var overlay = document.getElementById('receipt-modal-overlay');
        if (!overlay) return;
        overlay.classList.remove('receipt-modal-open');
        document.body.classList.remove('modal-open');
        setTimeout(function() { overlay.style.display = 'none'; }, 350);
    }

    window.downloadReceipt = function (orderId) {
        const allOrders = safeStorage.getJSON('bakeryOrders', []);
        const targetOrder = allOrders.find(o => o.id === orderId);
        if (!targetOrder) { showToast('Receipt not found.', 'error'); return; }

        ensureReceiptModal();

        const itemsHtml = (targetOrder.items || []).map(item =>
            `<tr class="rct-items-row"><td>${item.emoji || '🧁'} ${item.name}</td><td style="text-align:right;font-weight:700;color:#c8401e;">${item.price}</td></tr>`
        ).join('');

        document.getElementById('receipt-modal-body').innerHTML = `
            <div class="rct-box">
                <div class="rct-logo">🧁</div>
                <div class="rct-title">Sweet Delights</div>
                <div class="rct-sub">Artisan Bakery & Pastry Shop</div>
                <hr class="rct-divider">
                <div class="rct-row"><strong>Billed To:</strong> <span>${targetOrder.customerName || 'Valued Customer'}</span></div>
                <div class="rct-row"><strong>Order ID:</strong> <span>#${targetOrder.id}</span></div>
                <div class="rct-row"><strong>Date:</strong> <span>${targetOrder.date}</span></div>
                <div class="rct-row"><strong>Type:</strong> <span>${targetOrder.orderType || 'Store Pickup'}</span></div>
                <div class="rct-row"><strong>Payment:</strong> <span class="rct-badge">Verified ✅</span></div>
                <hr class="rct-divider">
                <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
                <div class="rct-total">Grand Total: ${targetOrder.total}</div>
                <hr class="rct-divider">
                <div class="rct-footer">Thank you, ${targetOrder.customerName || 'dear friend'}! 🌟<br>Sweet Delights Bakery · 123 Baker Street, Pastryville<br>(555) 123-4567</div>
            </div>`;

        var overlay = document.getElementById('receipt-modal-overlay');
        overlay.style.display = 'flex';
        document.body.classList.add('modal-open');
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                overlay.classList.add('receipt-modal-open');
            });
        });
    };

    // ==========================================================================
    // 27. PWA INSTALL
    // ==========================================================================
    let deferredPrompt;
    const installAppBtn = document.getElementById('installAppBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installAppBtn) installAppBtn.style.display = 'inline-flex';
    });
    if (installAppBtn) {
        installAppBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') installAppBtn.style.display = 'none';
                deferredPrompt = null;
            }
        });
    }
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
    }

    // ==========================================================================
    // 28. STORE OPEN/CLOSED INDICATOR
    // ==========================================================================
    const statusBadge = document.getElementById('store-status');
    if (statusBadge) {
        const hour = new Date().getHours();
        const isOpen = hour >= 7 && hour < 19;
        if (!isOpen) {
            statusBadge.innerHTML = '🔴 Closed';
            statusBadge.classList.add('closed');
        }
    }

    // ==========================================================================
    // 29. USER AUTH & LOYALTY SYSTEM
    // ==========================================================================
    const authLink = document.getElementById('auth-nav-link');
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.getElementById('close-auth');
    const authForm = document.getElementById('auth-form');
    const toggleAuth = document.getElementById('toggle-auth');
    const nameGroup = document.getElementById('name-group');
    const authTitle = document.getElementById('auth-title');
    let isSignUp = false;

    const currentUser = safeStorage.getJSON('bakeryCurrentUser', null);
    if (currentUser && authLink) {
        authLink.innerHTML = `👤 ${currentUser.name.split(' ')[0]}`;
        authLink.href = 'profile.html';
        authLink.classList.add('active-pill');
        authLink.removeEventListener('click', openAuthModal);
    } else if (authLink) {
        authLink.href = '#';
        authLink.addEventListener('click', openAuthModal);
    }

    function openAuthModal(e) {
        if (e) e.preventDefault();
        if (!authModal) return;
        authModal.classList.add('active');
        document.body.classList.add('modal-open');
        setTimeout(function() {
            var firstInput = authModal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 240);
    }
    window.openAuthModal = openAuthModal;

    function closeAuthModal() {
        if (authModal) authModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
    if (authModal) authModal.addEventListener('click', function(e) {
        if (e.target === authModal) closeAuthModal();
    });
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAuthModal();
            closeTray();
        }
    });

    if (toggleAuth) {
        toggleAuth.addEventListener('click', () => {
            isSignUp = !isSignUp;
            if (nameGroup) nameGroup.style.display = isSignUp ? 'block' : 'none';
            const nameInput = document.getElementById('auth-name');
            if (nameInput) nameInput.required = isSignUp;
            if (authTitle) authTitle.textContent = isSignUp ? 'Create Account 🧁' : 'Welcome Back! 👋';
            toggleAuth.textContent = isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up";
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email')?.value;
            const pass = document.getElementById('auth-pass')?.value;
            const users = safeStorage.getJSON('bakeryUsers', []);

            if (isSignUp) {
                const name = document.getElementById('auth-name')?.value;
                if (users.find(u => u.email === email)) { showToast('Email already registered!', 'error'); return; }
                const newUser = { name, email, pass, loyaltyPoints: 50 };
                users.push(newUser);
                safeStorage.setJSON('bakeryUsers', users);
                safeStorage.setJSON('bakeryCurrentUser', newUser);
                showToast('Account created! Welcome + 50 Loyalty Points 🌟', 'success');
            } else {
                const user = users.find(u => u.email === email && u.pass === pass);
                if (!user) { showToast('Invalid email or password!', 'error'); return; }
                safeStorage.setJSON('bakeryCurrentUser', user);
                showToast(`Welcome back, ${user.name}! 👋`, 'success');
            }
            closeAuthModal();
            setTimeout(() => location.reload(), 1200);
        });
    }

    // ==========================================================================
    // 30. NEWSLETTER
    // ==========================================================================
    const newsForm = document.getElementById('newsletter-form');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thanks for subscribing! Sweet deals incoming 💌', 'success');
            newsForm.reset();
        });
    }

    // Ensure toast container exists
    if (!document.getElementById('toast-container')) {
        const tc = document.createElement('div');
        tc.id = 'toast-container';
        document.body.appendChild(tc);
    }

}); // End DOMContentLoaded
