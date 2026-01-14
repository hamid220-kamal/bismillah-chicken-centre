/* =====================================================
   BISMILLAH CHICKEN CENTRE - Main JavaScript
   ===================================================== */

// =====================================================
// NAVBAR FUNCTIONALITY
// =====================================================
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navMenu?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// =====================================================
// SCROLL ANIMATIONS
// =====================================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initScrollAnimations);

// =====================================================
// COUNTER ANIMATION
// =====================================================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + suffix;
            }
        };

        // Start animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counter);
    });
}

document.addEventListener('DOMContentLoaded', animateCounters);

// =====================================================
// SMOOTH SCROLL
// =====================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Make showToast globally available
window.showToast = showToast;

// =====================================================
// FORM VALIDATION
// =====================================================
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--secondary)';
            input.addEventListener('input', function handler() {
                input.style.borderColor = '';
                input.removeEventListener('input', handler);
            });
        }
    });

    // Email validation
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            isValid = false;
            emailInput.style.borderColor = 'var(--secondary)';
        }
    }

    // Phone validation
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput && phoneInput.value) {
        const phoneRegex = /^[\d\s+()-]{10,}$/;
        if (!phoneRegex.test(phoneInput.value)) {
            isValid = false;
            phoneInput.style.borderColor = 'var(--secondary)';
        }
    }

    return isValid;
}

// =====================================================
// LOADING STATE
// =====================================================
function setLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loader" style="width:20px;height:20px;border-width:2px;"></span>';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
    }
}

// =====================================================
// PRODUCT DATA - SIMPLE CHICKEN PRODUCT
// =====================================================
const products = [
    {
        id: 1,
        name: 'Fresh Chicken',
        category: 'fresh',
        pricePerKg: 200,
        minGrams: 250,
        description: 'Farm-fresh whole chicken, cleaned and ready to cook. 100% Halal, hygienically processed daily.',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
        badge: 'Fresh Daily'
    }
];

// Quantity options in grams
const quantityOptions = [250, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000];

function getQuantityLabel(grams) {
    if (grams >= 1000) {
        return (grams / 1000) + ' kg';
    }
    return grams + ' gm';
}

function calculatePrice(pricePerKg, grams) {
    return Math.round((pricePerKg / 1000) * grams);
}

// Current quantity state (in grams)
let currentQtyGrams = 1000;
const PRICE_PER_KG = 200;
const MIN_GRAMS = 250;
const MAX_GRAMS = 5000;
const STEP_GRAMS = 250;

// Increment quantity by 250gm
function incrementQty() {
    if (currentQtyGrams < MAX_GRAMS) {
        currentQtyGrams += STEP_GRAMS;
        updateQtyDisplay();
    }
}

// Decrement quantity by 250gm
function decrementQty() {
    if (currentQtyGrams > MIN_GRAMS) {
        currentQtyGrams -= STEP_GRAMS;
        updateQtyDisplay();
    }
}

// Update the quantity and price display
function updateQtyDisplay() {
    const qtyDisplay = document.getElementById('qty-display');
    const priceDisplay = document.getElementById('price-display');
    const hiddenInput = document.getElementById('qty-1');

    if (qtyDisplay && priceDisplay && hiddenInput) {
        qtyDisplay.textContent = getQuantityLabel(currentQtyGrams);
        priceDisplay.textContent = '₹' + calculatePrice(PRICE_PER_KG, currentQtyGrams);
        hiddenInput.value = currentQtyGrams;
    }
}

// Make functions globally available
window.incrementQty = incrementQty;
window.decrementQty = decrementQty;
window.updateQtyDisplay = updateQtyDisplay;

// Make products globally available
window.products = products;

// =====================================================
// RENDER PRODUCTS
// =====================================================
function renderProducts(productsToRender, containerId = 'products-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productsToRender.map((product) => `
        <div class="product-card animate-on-scroll" data-category="${product.category}">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-content">
                <span class="product-category">100% Halal</span>
                <h4 class="product-title">${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <div style="margin-bottom: var(--space-sm);">
                    <label style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: var(--space-xs); display: block;">Select Quantity:</label>
                    <select id="qty-${product.id}" class="form-input" style="padding: 0.75rem; background: var(--bg-darker);">
                        ${quantityOptions.map(g => `<option value="${g}">${getQuantityLabel(g)} - ₹${calculatePrice(product.pricePerKg, g)}</option>`).join('')}
                    </select>
                </div>
                <div class="product-footer">
                    <div class="product-price">
                        ₹${product.pricePerKg} <span>/ kg</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCartWithQty(${product.id})" title="Add to Cart">
                        🛒
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Reinitialize scroll animations
    initScrollAnimations();
}

// Add to cart with quantity from dropdown
function addToCartWithQty(productId) {
    const product = window.products?.find(p => p.id === productId);
    if (!product) return;

    const select = document.getElementById(`qty-${productId}`);
    const grams = parseInt(select.value);
    const price = calculatePrice(product.pricePerKg, grams);

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId && item.grams === grams);

    if (existingItem) {
        existingItem.count += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            grams: grams,
            price: price,
            pricePerKg: product.pricePerKg,
            image: product.image,
            count: 1
        });
    }

    saveCart(cart);
    showToast(`${getQuantityLabel(grams)} Fresh Chicken added! 🛒`, 'success');

    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => cartBtn.style.transform = '', 300);
    }
}

window.addToCartWithQty = addToCartWithQty;
window.getQuantityLabel = getQuantityLabel;
window.calculatePrice = calculatePrice;
window.quantityOptions = quantityOptions;

// =====================================================
// WHATSAPP ORDER
// =====================================================
function sendWhatsAppOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * (item.count || 1);
    });

    let message = '🍗 *Bismillah Chicken Centre - New Order*\n\n';
    message += '*Order Details:*\n';
    message += '─────────────────\n';

    cart.forEach(item => {
        const qtyLabel = item.grams >= 1000 ? (item.grams / 1000) + ' kg' : item.grams + ' gm';
        message += `• Fresh Chicken - ${qtyLabel}`;
        if (item.count > 1) message += ` x${item.count}`;
        message += ` - ₹${item.price * (item.count || 1)}\n`;
    });

    message += '─────────────────\n';
    message += `*Total: ₹${total}*\n\n`;
    message += 'Please confirm my order. Thank you! 🙏';

    const phoneNumber = '918688235701';
    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

window.sendWhatsAppOrder = sendWhatsAppOrder;
