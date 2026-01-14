/* =====================================================
   BISMILLAH CHICKEN CENTRE - Admin Panel
   ===================================================== */

const API_URL = 'http://localhost:5000/api';

const STATUS_CONFIG = {
    pending: { icon: '⏳', label: 'Pending', color: '#FF9800' },
    confirmed: { icon: '✓', label: 'Confirmed', color: '#2196F3' },
    on_the_way: { icon: '🚚', label: 'On the Way', color: '#9C27B0' },
    delivered: { icon: '✅', label: 'Delivered', color: '#4CAF50' },
    cancelled: { icon: '❌', label: 'Cancelled', color: '#F44336' }
};

const STATUS_ORDER = ['pending', 'confirmed', 'on_the_way', 'delivered', 'cancelled'];

let allOrders = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});

async function checkAdminAccess() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        document.getElementById('admin-orders-container').style.display = 'none';
        document.getElementById('access-denied').style.display = 'block';
        return;
    }
    loadOrders();
    setupFilters();
}

async function loadOrders() {
    try {
        const token = localStorage.getItem('bismillah_token');
        const response = await fetch(`${API_URL}/orders/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            allOrders = data.orders;
            updateStats();
            renderOrders();
        }
    } catch (error) {
        console.error('Load error:', error);
    }
}

function updateStats() {
    const stats = { total: allOrders.length, pending: 0, on_the_way: 0, delivered: 0 };
    allOrders.forEach(o => {
        if (o.status === 'pending') stats.pending++;
        if (o.status === 'on_the_way') stats.on_the_way++;
        if (o.status === 'delivered') stats.delivered++;
    });

    document.getElementById('total-orders').textContent = stats.total;
    document.getElementById('pending-orders').textContent = stats.pending;
    document.getElementById('on-way-orders').textContent = stats.on_the_way;
    document.getElementById('delivered-orders').textContent = stats.delivered;
}

function renderOrders() {
    const container = document.getElementById('admin-orders-container');

    const filteredOrders = currentFilter === 'all' ? allOrders : allOrders.filter(o => o.status === currentFilter);

    if (filteredOrders.length === 0) {
        container.innerHTML = '<div class="glass-card" style="text-align:center;padding:var(--space-xl);"><p>No orders found</p></div>';
        return;
    }

    container.innerHTML = filteredOrders.map(order => renderAdminOrderCard(order)).join('');
}

function renderAdminOrderCard(order) {
    const status = STATUS_CONFIG[order.status];
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const items = order.items.map(item => {
        const qty = item.grams >= 1000 ? (item.grams / 1000) + ' kg' : item.grams + ' gm';
        return `${qty} x${item.count}`;
    }).join(', ');

    const statusOptions = STATUS_ORDER.map(s => {
        const cfg = STATUS_CONFIG[s];
        return `<option value="${s}" ${s === order.status ? 'selected' : ''}>${cfg.icon} ${cfg.label}</option>`;
    }).join('');

    return `
        <div class="glass-card admin-order-card" data-id="${order._id}">
            <div class="admin-order-header">
                <div>
                    <div class="order-id" style="font-weight:700;font-size:1.1rem;">#${order._id.slice(-6).toUpperCase()}</div>
                    <div style="font-size:0.85rem;color:var(--text-muted);">${date}</div>
                </div>
                <div class="order-status" style="background:${status.color}20;color:${status.color};padding:0.5rem 1rem;border-radius:20px;font-weight:600;">
                    ${status.icon} ${status.label}
                </div>
            </div>
            
            <div class="admin-order-body">
                <div class="order-customer">
                    <strong>${order.customerName}</strong>
                    <a href="tel:${order.phone}" style="color:var(--primary);">📞 ${order.phone}</a>
                </div>
                <div class="order-address">📍 ${order.address} ${order.landmark ? '(' + order.landmark + ')' : ''}</div>
                <div class="order-items-list">🍗 ${items}</div>
                ${order.notes ? `<div class="order-notes">📝 ${order.notes}</div>` : ''}
            </div>
            
            <div class="admin-order-footer">
                <div class="order-total" style="font-size:1.5rem;font-weight:700;color:var(--primary);">₹${order.total}</div>
                <div class="status-actions">
                    <select class="form-input status-select" onchange="updateStatus('${order._id}', this.value)" style="padding:0.5rem;min-width:150px;">
                        ${statusOptions}
                    </select>
                </div>
            </div>
        </div>
    `;
}

async function updateStatus(orderId, status) {
    try {
        const token = localStorage.getItem('bismillah_token');
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Order updated to ${STATUS_CONFIG[status].label}`, 'success');
            loadOrders();
        } else {
            showToast('Failed to update', 'error');
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
