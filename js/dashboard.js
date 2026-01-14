/* =====================================================
   BISMILLAH CHICKEN CENTRE - User Dashboard
   ===================================================== */

const API_URL = 'http://localhost:5000/api';

// Status config
const STATUS_CONFIG = {
    pending: { icon: '⏳', label: 'Pending', color: '#FF9800' },
    confirmed: { icon: '✓', label: 'Confirmed', color: '#2196F3' },
    on_the_way: { icon: '🚚', label: 'On the Way', color: '#9C27B0' },
    delivered: { icon: '✅', label: 'Delivered', color: '#4CAF50' },
    cancelled: { icon: '❌', label: 'Cancelled', color: '#F44336' }
};

let allOrders = [];
let currentFilter = 'all';

// Load orders on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        document.getElementById('orders-container').style.display = 'none';
        document.getElementById('login-prompt').style.display = 'block';
        return;
    }
    loadOrders();
    setupFilters();
});

async function loadOrders() {
    try {
        const token = localStorage.getItem('bismillah_token');
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            allOrders = data.orders;
            renderOrders();
        } else {
            showError('Failed to load orders');
        }
    } catch (error) {
        showError('Connection error');
    }
}

function renderOrders() {
    const container = document.getElementById('orders-container');
    const emptyState = document.getElementById('empty-state');

    const filteredOrders = currentFilter === 'all'
        ? allOrders
        : allOrders.filter(o => o.status === currentFilter);

    if (filteredOrders.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = filteredOrders.map(order => renderOrderCard(order)).join('');
}

function renderOrderCard(order) {
    const status = STATUS_CONFIG[order.status];
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const items = order.items.map(item => {
        const qty = item.grams >= 1000 ? (item.grams / 1000) + ' kg' : item.grams + ' gm';
        return `<span class="order-item-tag">${qty} x${item.count}</span>`;
    }).join('');

    const canCancel = order.status === 'pending';

    return `
        <div class="glass-card order-card" data-id="${order._id}">
            <div class="order-header">
                <div class="order-id">#${order._id.slice(-6).toUpperCase()}</div>
                <div class="order-status" style="background:${status.color}20;color:${status.color};">
                    ${status.icon} ${status.label}
                </div>
            </div>
            <div class="order-body">
                <div class="order-items">${items}</div>
                <div class="order-meta">
                    <span>📍 ${order.address}</span>
                    <span>📅 ${date}</span>
                </div>
            </div>
            <div class="order-footer">
                <div class="order-total">₹${order.total}</div>
                ${canCancel ? `<button class="btn btn-secondary" onclick="cancelOrder('${order._id}')" style="padding:0.5rem 1rem;font-size:0.9rem;">Cancel</button>` : ''}
            </div>
        </div>
    `;
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const token = localStorage.getItem('bismillah_token');
        const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Order cancelled', 'success');
            loadOrders();
        } else {
            showToast(data.message || 'Failed to cancel', 'error');
        }
    } catch {
        showToast('Connection error', 'error');
    }
}

function setupFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.status;
            renderOrders();
        });
    });
}

function showError(message) {
    document.getElementById('orders-container').innerHTML = `
        <div class="glass-card" style="text-align:center;padding:var(--space-xl);">
            <p style="color:var(--secondary);">❌ ${message}</p>
            <button class="btn btn-primary" onclick="loadOrders()" style="margin-top:var(--space-md);">Retry</button>
        </div>
    `;
}
