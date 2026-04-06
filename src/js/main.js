// src/js/main.js
import '../css/main.css';
import { setupLenis } from './utils/lenis-setup.js';
import { initScrollObserver } from './utils/scroll-observer.js';
import { initTitleAnimation } from './utils/title-anim.js';
import { initResumeDrawer } from './utils/drawer.js';
import { initPreloader } from './utils/preloader.js';

document.addEventListener('DOMContentLoaded', () => {
    // 0. Preloader (mobile only)
    initPreloader();

    // 1. Lenis smooth scrolling
    setupLenis();

    // 2. Title typewriter animation
    initTitleAnimation();

    // 3. Resume drawer
    initResumeDrawer();

    // 4. Scroll reveal observer
    initScrollObserver();

    // 5. Header scroll effect
    const header = document.getElementById('header');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 40);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
});
