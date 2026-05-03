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
import { initRippleGrid } from './utils/ripple-grid.js';
import { initStaggeredMenu } from './utils/staggered-menu.js';
import { initFooterMarquee } from './utils/footer-marquee.js';
import { ProfileCard } from './components/ProfileCard.js';

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
        displaySocials: false,
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
        
        // Initialize Hero Waves immediately for better perceived performance
        initRippleGrid('hero-ripple-grid', {
            enableRainbow: false,
            color1: getComputedStyle(document.documentElement).getPropertyValue('--accent-purple').trim() || '#3A1C71',
            color2: getComputedStyle(document.documentElement).getPropertyValue('--accent-salmon').trim() || '#FFA07A',
            rippleIntensity: 0.05,
            gridSize: 10,
            gridThickness: 15,
            mouseInteraction: true,
            mouseInteractionRadius: 1.2,
            opacity: 0.8
        });
        
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
            { fn: initFooterMarquee, delay: 1500 },
            { fn: initProfileCard, delay: 1600 }
        ];

        deferredModules.forEach(({ fn, delay }) => {
            setTimeout(() => {
                if (typeof fn === 'function') fn();
            }, delay);
        });
    }

    function initProfileCard() {
        const container = document.getElementById('profile-card-container');
        if (!container) return;

        // Custom SVG Icon Pattern for the background
        const iconSvg = `
            <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2">
                    <path d="M50 100 L30 120 L50 140 M100 100 L120 120 L100 140" />
                    <path d="M250 50 L230 70 L250 90 M300 50 L320 70 L300 90" />
                    <path d="M150 300 L130 320 L150 340 M200 300 L220 320 L200 340" />
                    <path d="M320 250 L300 270 L320 290 M370 250 L390 270 L370 290" />
                </g>
            </svg>
        `.trim();
        const iconUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`;

        new ProfileCard(container, {
            name: "Santhosh Reddy",
            title: "Developer",
            handle: "santjsx",
            status: "Online",
            contactText: "Contact",
            avatarUrl: "images/santhoshh-removebg-preview.png",
            iconUrl: iconUrl,
            behindGlowEnabled: true,
            behindGlowColor: "rgba(100, 150, 255, 0.4)", 
            innerGradient: "linear-gradient(180deg, #16162d 0%, #08081a 100%)",
            enableTilt: true,
            showUserInfo: false,
            onContactClick: () => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Mobile Menu Replaced by StaggeredMenu
});
