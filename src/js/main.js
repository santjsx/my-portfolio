import '../css/main.css';
import { setupLenis } from './utils/lenis-setup.js';
import { initScrollObserver } from './utils/scroll-observer.js';
import { initTitleAnimation } from './utils/title-anim.js';
import { initResumeDrawer } from './utils/drawer.js';
import { initPreloader } from './utils/preloader.js';
import { initHeroEffects } from './utils/hero-effects.js';
import { initContactSection } from './utils/contact.js';
import { initLanyardWidget } from './utils/lanyard.js';
import { initGSAPAnimations } from './utils/gsap-animations.js';
import { initHeroCorrection } from './utils/hero-correction.js';
import { initAboutReveal } from './utils/about-reveal.js';
import { initMusicHistory } from './utils/music.js';
import { initNavHighlighter } from './utils/nav-highlighter.js';

document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 0. Preloader (Mobile & Desktop)
    const preloaderPromise = initPreloader();

    // 1. Lenis smooth scrolling (Single initialization)
    const lenis = setupLenis();
    
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

    // Mobile Overlay Menu Toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const navClose = document.getElementById('nav-close');
    const navItemLinks = document.querySelectorAll('.nav-overlay .nav-item');

    if (mobileToggle && navOverlay) {
        mobileToggle.addEventListener('click', () => {
            const isActive = mobileToggle.classList.contains('active');
            mobileToggle.classList.toggle('active');
            navOverlay.classList.toggle('active');
            
            // Lock background scroll when open
            document.body.style.overflow = isActive ? '' : 'hidden';
        });

        if (navClose) {
            navClose.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close menu when a link is clicked
        navItemLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mobileToggle.classList.remove('active');
                    navOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // Initialize animations after preloader finishes
    preloaderPromise.then(() => {
        // 0.5. Hero cinematic effects
        initHeroEffects();

        // 2. Title typewriter animation
        initTitleAnimation();

        // 3. Initialize Parallax & Interactions via GSAP
        initGSAPAnimations();
        
        // 3.5. Hero correction sequence (Strike + Arrow)
        initHeroCorrection();

        // 3.6. About cinematic reveal
        initAboutReveal();

        // 4. Scroll reveal observer (now using GSAP ScrollTrigger batches)
        initScrollObserver();

        // 5. Music History Sync
        initMusicHistory();

        // 6. Navigation ScrollSpy
        initNavHighlighter();
    });
});
