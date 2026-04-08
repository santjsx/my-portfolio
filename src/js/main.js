// src/js/main.js
import '../css/main.css';
import { setupLenis } from './utils/lenis-setup.js';
import { initScrollObserver } from './utils/scroll-observer.js';
import { initTitleAnimation } from './utils/title-anim.js';
import { initResumeDrawer } from './utils/drawer.js';
import { initPreloader } from './utils/preloader.js';
import { initHeroEffects } from './utils/hero-effects.js';
import { initContactSection } from './utils/contact.js';

document.addEventListener('DOMContentLoaded', () => {
    // 0. Preloader (mobile only)
    const preloaderPromise = initPreloader();

    // 1. Lenis smooth scrolling
    setupLenis();

    // 3. Resume drawer
    initResumeDrawer();

    // 4.5. Contact section interactions
    initContactSection();
    
    // Header scrolled state
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

    // Initialize animations after preloader finishes
    preloaderPromise.then(() => {
        // 0.5. Hero cinematic effects
        initHeroEffects();

        // 2. Title typewriter animation
        initTitleAnimation();

        // 4. Scroll reveal observer
        initScrollObserver();
    });
});
