import { setupLenis } from './utils/lenis-setup.js';
import { initScrollObserver } from './utils/scroll-observer.js';
import { initTitleAnimation } from './utils/title-anim.js';
import { initResumeDrawer } from './utils/drawer.js';
import { initPreloader, forceHidePreloader } from './utils/preloader.js';
import { initHeroEffects } from './utils/hero-effects.js';
import { initContactSection } from './utils/contact.js';
import { initLanyardWidget } from './utils/lanyard.js';
import { initGSAPAnimations } from './utils/gsap-animations.js';
import { initAboutReveal } from './utils/about-reveal.js';
import { initMusicHistory } from './utils/music.js';
import { initNavHighlighter } from './utils/nav-highlighter.js';
import { initVibePortal } from './utils/vibe-portal.js';
import { initAstrosWidget } from './utils/astros.js';
import { initWaves } from './utils/waves-bg.js';
import { initStaggeredMenu } from './utils/staggered-menu.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ ARCHIVE BOOT: DOM READY');

    // 1. PHASE 0: CRITICAL BOOT (Immediate)
    // The preloader must start before anything else to prevent flicker.
    const preloaderPromise = initPreloader();
    console.log('⏳ PHASE 0: PRELOADER ACTIVE');

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // Initial fundamental UI
    const lenis = setupLenis();
    initVibePortal();

    const isSubpage = window.location.pathname.includes('cinema.html') || window.location.pathname.includes('music.html');
    const homePrefix = isSubpage ? 'index.html?skipLoader=true' : '';

    // Header Logic (Replaced by StaggeredMenu)
    window.staggeredMenu = initStaggeredMenu({
        items: [
            { label: 'About', ariaLabel: 'About section', link: `${homePrefix}#about` },
            { label: 'Projects', ariaLabel: 'Projects section', link: `${homePrefix}#work` },
            { label: 'My Vibe', ariaLabel: 'Open vibe portal', link: '#', className: 'js-open-vibe-portal' },
            { label: 'Resume', ariaLabel: 'Open resume', link: '#', className: 'js-open-resume' },
            { label: 'Contact', ariaLabel: 'Contact section', link: `${homePrefix}#contact` }
        ],
        socialItems: [
            { label: 'GitHub', link: 'https://github.com/santjsx' },
            { label: 'LinkedIn', link: 'https://linkedin.com' },
            { label: 'Twitter', link: 'https://twitter.com' }
        ],
        accentColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#F28B82',
        colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || '#F28B82', '#111111', '#0a0a0a']
    });

    // 2. PHASE 1: UI INTERACTIVITY (After Preloader)
    // Failsafe: If preloader hangs for more than 7s, force-run deferred modules
    const forceBoot = setTimeout(() => {
        console.warn('⚠️ BOOT FAILSAFE: Preloader taking too long, forcing secondary boot');
        runDeferredModules();
    }, 7000);

    preloaderPromise.then(() => {
        clearTimeout(forceBoot);
        runDeferredModules();
    });

    function runDeferredModules() {
        if (window.__ARCHIVE_BOOTED__) return;
        window.__ARCHIVE_BOOTED__ = true;
        
        // Ensure preloader is gone even if it failed to finish its timeline
        forceHidePreloader();
        
        console.log('📦 PHASE 1: INITIALIZING SECONDARY MODULES');
        
        // Essential entrance effects
        initHeroEffects();
        initTitleAnimation();
        
        // Stagger non-critical modules to avoid long tasks
        const deferredModules = [
            { fn: initGSAPAnimations, delay: 0 },
            { fn: initAboutReveal, delay: 100 },
            { fn: initScrollObserver, delay: 200 },
            { fn: initMusicHistory, delay: 400 },
            { fn: initNavHighlighter, delay: 600 },
            { fn: initResumeDrawer, delay: 800 },
            { fn: initContactSection, delay: 1000 },
            { fn: initLanyardWidget, delay: 1200 },
            { fn: initAstrosWidget, delay: 1400 },
            { 
                fn: () => {
                    window.heroWaves = initWaves('hero-waves-container', {
                        lineColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || "#F28B82",
                        backgroundColor: "transparent",
                        waveSpeedX: 0.02,
                        waveSpeedY: 0.01,
                        waveAmpX: 40,
                        waveAmpY: 20,
                        friction: 0.9,
                        tension: 0.01,
                        maxCursorMove: 120,
                        xGap: 12,
                        yGap: 36
                    });
                }, 
                delay: 1500 
            }
        ];

        deferredModules.forEach(({ fn, delay }) => {
            setTimeout(() => {
                if (typeof fn === 'function') fn();
            }, delay);
        });
    }

    // Mobile Menu Replaced by StaggeredMenu
});
