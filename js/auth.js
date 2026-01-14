/* =====================================================
   BISMILLAH CHICKEN CENTRE - Authentication
   ===================================================== */

const API_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'bismillah_token';
const USER_KEY = 'bismillah_user';

// Get stored token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Get stored user
function getUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
}

// Save auth data
function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    updateAuthUI();
}

// Clear auth data
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
    showToast('Logged out successfully', 'info');
    window.location.href = 'index.html';
}

// Check if logged in
function isLoggedIn() {
    return !!getToken();
}

// Update UI based on auth state
function updateAuthUI() {
    const authBtn = document.querySelector('.auth-btn');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.querySelector('.user-name');

    if (isLoggedIn()) {
        const user = getUser();
        if (authBtn) authBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            if (userName) userName.textContent = user?.name || 'User';
        }
    } else {
        if (authBtn) authBtn.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Signup
async function signup(formData) {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            saveAuth(data.token, data.user);
            showToast('Account created successfully! 🎉', 'success');
            return { success: true };
        } else {
            showToast(data.message || 'Signup failed', 'error');
            return { success: false, message: data.message };
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
        return { success: false, message: 'Connection error' };
    }
}

// Login
async function login(phone, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });

        const data = await response.json();

        if (data.success) {
            saveAuth(data.token, data.user);
            showToast('Welcome back! 🎉', 'success');
            return { success: true };
        } else {
            showToast(data.message || 'Login failed', 'error');
            return { success: false, message: data.message };
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
        return { success: false, message: 'Connection error' };
    }
}

// Get profile
async function getProfile() {
    try {
        const token = getToken();
        if (!token) return null;

        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        return data.success ? data.user : null;
    } catch {
        return null;
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);

// Make functions globally available
window.signup = signup;
window.login = login;
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getUser = getUser;
window.getProfile = getProfile;
