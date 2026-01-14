/* =====================================================
   ZAID CHICKEN CENTRE - Shopping Cart System
   ===================================================== */

// =====================================================
// CART STATE MANAGEMENT
// =====================================================
const CART_KEY = 'zaid_chicken_cart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartUI();
}

// =====================================================
// CART OPERATIONS
// =====================================================
function addToCart(productId, quantity = 1) {
    const product = window.products?.find(p => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart(cart);
    showToast(`${product.name} added to cart! 🛒`, 'success');

    // Animate cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => cartBtn.style.transform = '', 300);
    }
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    showToast('Item removed from cart', 'info');
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
    }
}

function getCartTotal() {
    return getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return getCart().reduce((count, item) => count + item.quantity, 0);
}

// =====================================================
// CART UI UPDATES
// =====================================================
function updateCartUI() {
    updateCartBadge();
    renderCartItems();
    renderOrderSummary();
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    const count = getCartCount();

    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function renderCartItems() {
    const container = document.querySelector('.cart-items');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <a href="menu.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Menu</a>
            </div>
        `;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">₹${item.price} / ${item.unit}</p>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
        </div>
    `).join('');

    // Update total
    const totalEl = document.querySelector('.cart-total-value');
    if (totalEl) {
        totalEl.textContent = `₹${getCartTotal()}`;
    }
}

function renderOrderSummary() {
    const container = document.querySelector('.order-items');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = '<p class="cart-empty" style="padding:1rem;">No items in cart</p>';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="order-item-info">
                <span class="order-item-qty">${item.quantity}</span>
                <span class="order-item-name">${item.name}</span>
            </div>
            <span class="order-item-price">₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    // Update totals
    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('order-total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (deliveryEl) deliveryEl.textContent = subtotal > 500 ? 'FREE' : '₹50';
    if (totalEl) totalEl.textContent = `₹${total}`;
}

// =====================================================
// CART SIDEBAR
// =====================================================
function openCart() {
    const overlay = document.querySelector('.cart-overlay');
    const sidebar = document.querySelector('.cart-sidebar');

    if (overlay && sidebar) {
        overlay.classList.add('active');
        sidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderCartItems();
    }
}

function closeCart() {
    const overlay = document.querySelector('.cart-overlay');
    const sidebar = document.querySelector('.cart-sidebar');

    if (overlay && sidebar) {
        overlay.classList.remove('active');
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Cart button click
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }

    // Close cart on overlay click
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }

    // Close cart button
    const closeBtn = document.querySelector('.cart-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }

    // Escape key to close cart
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCart();
    });
});

// =====================================================
// ORDER FORM HANDLING
// =====================================================
function handleOrderSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const cart = getCart();

    if (cart.length === 0) {
        showToast('Please add items to your cart first!', 'error');
        return;
    }

    if (!validateForm(form)) {
        showToast('Please fill in all required fields correctly', 'error');
        return;
    }

    const formData = new FormData(form);
    const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        landmark: formData.get('landmark'),
        deliveryTime: formData.get('delivery-time'),
        notes: formData.get('notes')
    };

    // Create WhatsApp message with full order details
    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    let message = '🍗 *ZAID CHICKEN CENTRE - NEW ORDER*\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

    message += '👤 *Customer Details:*\n';
    message += `Name: ${customerData.name}\n`;
    message += `Phone: ${customerData.phone}\n`;
    message += `Address: ${customerData.address}\n`;
    if (customerData.landmark) message += `Landmark: ${customerData.landmark}\n`;
    message += `Delivery Time: ${customerData.deliveryTime}\n`;
    if (customerData.notes) message += `Special Notes: ${customerData.notes}\n`;

    message += '\n📦 *Order Items:*\n';
    message += '────────────────────\n';

    cart.forEach(item => {
        message += `• ${item.name} (${item.quantity} ${item.unit}) - ₹${item.price * item.quantity}\n`;
    });

    message += '────────────────────\n';
    message += `Subtotal: ₹${subtotal}\n`;
    message += `Delivery: ${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}\n`;
    message += `*TOTAL: ₹${total}*\n\n`;
    message += '💳 Payment: Cash on Delivery\n\n';
    message += 'Please confirm this order. Thank you! 🙏';

    const phoneNumber = '919876543210'; // Replace with actual number
    const encodedMessage = encodeURIComponent(message);

    // Clear cart after order
    clearCart();

    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');

    showToast('Order sent successfully! 🎉', 'success');
    form.reset();
}

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openCart = openCart;
window.closeCart = closeCart;
window.getCart = getCart;
window.clearCart = clearCart;
window.handleOrderSubmit = handleOrderSubmit;
