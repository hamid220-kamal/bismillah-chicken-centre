/* =====================================================
   BISMILLAH CHICKEN CENTRE - Theme Toggle
   ===================================================== */

// Theme state
const THEME_KEY = 'bismillah_theme';

// Get current theme (default: light)
function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

// Set theme
function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
}

// Apply theme to body
function applyTheme(theme) {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    if (theme === 'dark') {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const theme = getTheme();
    applyTheme(theme);
});

// Make functions globally available
window.toggleTheme = toggleTheme;
window.getTheme = getTheme;
window.setTheme = setTheme;
