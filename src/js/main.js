// src/js/main.js
import '../css/main.css';
import { setupLenis } from './utils/lenis-setup.js';
import { initScrollObserver } from './utils/scroll-observer.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize smooth scrolling
    setupLenis();

    // 2. Initialize intersection observers for fade-up reveals
    initScrollObserver();

    // 3. Update copyright year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
