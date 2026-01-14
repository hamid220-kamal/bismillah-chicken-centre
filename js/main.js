/* =====================================================
   ZAID CHICKEN CENTRE - Main JavaScript
   ===================================================== */

// =====================================================
// NAVBAR FUNCTIONALITY
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
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
    anchor.addEventListener('click', function(e) {
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
// PRODUCTS DATA
// =====================================================
const products = [
    {
        id: 1,
        name: 'Whole Chicken',
        category: 'fresh',
        price: 320,
        unit: 'kg',
        description: 'Farm-fresh whole chicken, cleaned and ready to cook. Perfect for roasting, grilling, or making delicious curry.',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
        badge: 'Bestseller'
    },
    {
        id: 2,
        name: 'Chicken Breast',
        category: 'fresh',
        price: 380,
        unit: 'kg',
        description: 'Boneless chicken breast, lean and healthy. Ideal for grilling, salads, and healthy meal prep.',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
        badge: null
    },
    {
        id: 3,
        name: 'Chicken Legs',
        category: 'fresh',
        price: 300,
        unit: 'kg',
        description: 'Juicy chicken legs with bone-in, perfect for tandoori, BBQ, or traditional curry preparations.',
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
        badge: null
    },
    {
        id: 4,
        name: 'Chicken Wings',
        category: 'fresh',
        price: 340,
        unit: 'kg',
        description: 'Crispy chicken wings, great for frying or grilling. Party favorite!',
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
        badge: 'Popular'
    },
    {
        id: 5,
        name: 'Chicken Keema',
        category: 'fresh',
        price: 360,
        unit: 'kg',
        description: 'Freshly minced chicken, perfect for kebabs, koftas, burgers, and samosa filling.',
        image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=400',
        badge: null
    },
    {
        id: 6,
        name: 'Tandoori Chicken',
        category: 'marinated',
        price: 420,
        unit: 'kg',
        description: 'Pre-marinated with authentic tandoori spices. Just grill and serve!',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
        badge: 'Ready to Grill'
    },
    {
        id: 7,
        name: 'Malai Chicken',
        category: 'marinated',
        price: 440,
        unit: 'kg',
        description: 'Creamy, mild marination with cream and cashews. Melt-in-mouth texture.',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400',
        badge: null
    },
    {
        id: 8,
        name: 'Afghani Chicken',
        category: 'marinated',
        price: 450,
        unit: 'kg',
        description: 'Rich Afghani style marination with cream, cheese, and herbs.',
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
        badge: 'Chef Special'
    },
    {
        id: 9,
        name: 'Spicy BBQ Chicken',
        category: 'marinated',
        price: 400,
        unit: 'kg',
        description: 'Smoky BBQ marination with a spicy kick. Perfect for outdoor grilling.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
        badge: null
    },
    {
        id: 10,
        name: 'Chicken Seekh Kebab',
        category: 'ready',
        price: 480,
        unit: 'kg',
        description: 'Ready-to-cook seekh kebabs made with premium chicken keema and aromatic spices.',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
        badge: 'Easy Cook'
    },
    {
        id: 11,
        name: 'Chicken Nuggets',
        category: 'ready',
        price: 350,
        unit: '500g',
        description: 'Crispy breaded chicken nuggets. Just fry for 5 minutes. Kids favorite!',
        image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        badge: 'Kids Love'
    },
    {
        id: 12,
        name: 'Chicken Sausages',
        category: 'ready',
        price: 280,
        unit: '500g',
        description: 'Premium chicken sausages, smoked and seasoned. Great for breakfast or snacks.',
        image: 'https://images.unsplash.com/photo-1601911167747-7d2e9fa8f7d4?w=400',
        badge: null
    },
    {
        id: 13,
        name: 'Family Feast Pack',
        category: 'combos',
        price: 999,
        unit: 'pack',
        description: '1kg Whole Chicken + 500g Chicken Keema + 500g Marinated Wings. Perfect for family dinner!',
        image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400',
        badge: 'Value Pack'
    },
    {
        id: 14,
        name: 'BBQ Party Pack',
        category: 'combos',
        price: 1299,
        unit: 'pack',
        description: '1kg Tandoori Chicken + 500g Seekh Kebab + 500g BBQ Wings + Free Chutney.',
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        badge: 'Party Special'
    },
    {
        id: 15,
        name: 'Healthy Pack',
        category: 'combos',
        price: 850,
        unit: 'pack',
        description: '1kg Chicken Breast + 500g Chicken Keema. Low fat, high protein meals.',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
        badge: 'Fitness'
    }
];

// Make products globally available
window.products = products;

// =====================================================
// RENDER PRODUCTS
// =====================================================
function renderProducts(productsToRender, containerId = 'products-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = productsToRender.map((product, index) => `
        <div class="product-card animate-on-scroll animate-delay-${(index % 4) + 1}" data-category="${product.category}">
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-content">
                <span class="product-category">${getCategoryLabel(product.category)}</span>
                <h4 class="product-title">${product.name}</h4>
                <p class="product-description">${product.description.substring(0, 60)}...</p>
                <div class="product-footer">
                    <div class="product-price">
                        ₹${product.price} <span>/ ${product.unit}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" title="Add to Cart">
                        🛒
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Reinitialize scroll animations
    initScrollAnimations();
}

function getCategoryLabel(category) {
    const labels = {
        fresh: 'Fresh Chicken',
        marinated: 'Marinated',
        ready: 'Ready to Cook',
        combos: 'Combo Pack'
    };
    return labels[category] || category;
}

// =====================================================
// FILTER PRODUCTS
// =====================================================
function filterProducts(category) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    const filtered = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    renderProducts(filtered);
}

// =====================================================
// SEARCH PRODUCTS
// =====================================================
function searchProducts(query) {
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
    renderProducts(filtered);
}

// Initialize search on menu page
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('menu-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
    }
});

// =====================================================
// WHATSAPP ORDER
// =====================================================
function sendWhatsAppOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = '🍗 *New Order from Zaid Chicken Centre Website*\n\n';
    message += '*Order Details:*\n';
    message += '─────────────────\n';
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    message += '─────────────────\n';
    message += `*Total: ₹${total}*\n\n`;
    message += 'Please confirm my order. Thank you! 🙏';

    const phoneNumber = '919876543210'; // Replace with actual WhatsApp number
    const encodedMessage = encodeURIComponent(message);
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

window.sendWhatsAppOrder = sendWhatsAppOrder;
