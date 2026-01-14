/* =====================================================
   BISMILLAH CHICKEN CENTRE - Shopping Cart System
   ===================================================== */

const CART_KEY = 'bismillah_chicken_cart';

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

function getCartTotal() {
    return getCart().reduce((total, item) => total + (item.price * (item.count || 1)), 0);
}

function getCartCount() {
    return getCart().reduce((count, item) => count + (item.count || 1), 0);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    showToast('Item removed', 'info');
}

function updateItemCount(index, newCount) {
    if (newCount < 1) {
        removeFromCart(index);
        return;
    }
    const cart = getCart();
    if (cart[index]) {
        cart[index].count = newCount;
        saveCart(cart);
    }
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
                <a href="index.html" class="btn btn-primary" style="margin-top:1rem;">Order Chicken</a>
            </div>
        `;
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const qtyLabel = item.grams >= 1000 ? (item.grams / 1000) + ' kg' : item.grams + ' gm';
        return `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <p class="cart-item-price">${qtyLabel} - ₹${item.price}</p>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateItemCount(${index}, ${(item.count || 1) - 1})">−</button>
                    <span class="qty-value">${item.count || 1}</span>
                    <button class="qty-btn" onclick="updateItemCount(${index}, ${(item.count || 1) + 1})">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">✕</button>
        </div>
    `}).join('');

    const totalEl = document.querySelector('.cart-total-value');
    if (totalEl) totalEl.textContent = `₹${getCartTotal()}`;
}

function renderOrderSummary() {
    const container = document.querySelector('.order-items');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = '<p style="padding:1rem;text-align:center;color:var(--text-muted);">No items in cart</p>';
        return;
    }

    container.innerHTML = cart.map(item => {
        const qtyLabel = item.grams >= 1000 ? (item.grams / 1000) + ' kg' : item.grams + ' gm';
        return `
        <div class="order-item">
            <div class="order-item-info">
                <span class="order-item-qty">${item.count || 1}x</span>
                <span class="order-item-name">${qtyLabel}</span>
            </div>
            <span class="order-item-price">₹${item.price * (item.count || 1)}</span>
        </div>
    `}).join('');

    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 300 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('order-total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (deliveryEl) deliveryEl.textContent = subtotal > 300 ? 'FREE' : '₹30';
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    document.querySelector('.cart-btn')?.addEventListener('click', openCart);
    document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);
    document.querySelector('.cart-close')?.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
});

// =====================================================
// ORDER FORM HANDLING
// =====================================================
function handleOrderSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const cart = getCart();

    if (cart.length === 0) {
        showToast('Please add chicken to cart first!', 'error');
        return;
    }

    if (!validateForm(form)) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    const formData = new FormData(form);
    const subtotal = getCartTotal();
    const deliveryFee = subtotal > 300 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const orderData = {
        items: cart.map(item => ({
            name: item.name || 'Fresh Chicken',
            grams: item.grams,
            price: item.price,
            count: item.count || 1
        })),
        subtotal,
        deliveryFee,
        total,
        customerName: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        landmark: formData.get('landmark') || '',
        deliveryTime: formData.get('delivery-time'),
        notes: formData.get('notes') || ''
    };

    // Save to MongoDB if logged in
    const token = localStorage.getItem('bismillah_token');
    if (token) {
        saveOrderToDatabase(orderData, token);
    }

    // Build WhatsApp message
    let message = '🍗 *BISMILLAH CHICKEN CENTRE - ORDER*\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━\n\n';

    message += '👤 *Customer:*\n';
    message += `Name: ${formData.get('name')}\n`;
    message += `Phone: ${formData.get('phone')}\n`;
    message += `Address: ${formData.get('address')}\n`;
    if (formData.get('landmark')) message += `Landmark: ${formData.get('landmark')}\n`;
    message += `Time: ${formData.get('delivery-time')}\n`;
    if (formData.get('notes')) message += `Notes: ${formData.get('notes')}\n`;

    message += '\n📦 *Order:*\n';
    cart.forEach(item => {
        const qtyLabel = item.grams >= 1000 ? (item.grams / 1000) + ' kg' : item.grams + ' gm';
        message += `• ${qtyLabel}`;
        if (item.count > 1) message += ` x${item.count}`;
        message += ` - ₹${item.price * (item.count || 1)}\n`;
    });

    message += `\nSubtotal: ₹${subtotal}\n`;
    message += `Delivery: ${deliveryFee === 0 ? 'FREE' : '₹30'}\n`;
    message += `*TOTAL: ₹${total}*\n\n`;
    message += '💵 Payment: Cash on Delivery\n';
    message += 'Please confirm! 🙏';

    clearCart();
    window.open(`https://wa.me/918688235701?text=${encodeURIComponent(message)}`, '_blank');
    showToast('Order sent! 🎉', 'success');
    form.reset();
}

async function saveOrderToDatabase(orderData, token) {
    try {
        await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
    } catch (err) {
        console.log('Order saved to WhatsApp only');
    }
}

// Global exports
window.getCart = getCart;
window.saveCart = saveCart;
window.clearCart = clearCart;
window.removeFromCart = removeFromCart;
window.updateItemCount = updateItemCount;
window.openCart = openCart;
window.closeCart = closeCart;
window.handleOrderSubmit = handleOrderSubmit;
