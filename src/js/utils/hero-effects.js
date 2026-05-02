// src/js/utils/hero-effects.js
// Premium Fight Club hero: staggered reveal, scramble text, subliminal flash, glow tracking

import gsap from 'gsap';

const FC_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/01';

/**
 * Staggered cinematic Blur Reveal of headline rows using GSAP (Hardware accelerated)
 */
function initHeadlineReveal() {
    const rows = document.querySelectorAll('.headline-row, .headline-divider');
    if (!rows.length) return;

    // Reset initial states manually in JS to prevent FOUC while GSAP loads,
    // though CSS should handle most. We remove transition so GSAP controls it fully.
    rows.forEach(row => {
        row.style.opacity = '0';
        row.style.transition = 'none';
        row.style.filter = 'blur(10px)';
        row.style.transform = 'translateY(10px) scale(0.98)';
    });

    const tl = gsap.timeline({ delay: 0.1 });
    
    tl.to(rows, { 
        opacity: 1, 
        filter: 'blur(0px)', 
        y: 0, 
        scale: 1, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power3.out",
        clearProps: "filter,transform,transition" 
    });
}

/**
 * Scramble-reveal the hero rule tag "// first rule of clean code"
 */
function initRuleTagScramble() {
    const el = document.getElementById('hero-rule-tag');
    if (!el) return;

    const originalText = el.textContent;
    el.textContent = '';
    let iteration = 0;

    setTimeout(() => {
        const interval = setInterval(() => {
            el.textContent = originalText
                .split('')
                .map((char, i) => {
                    if (i < iteration) return originalText[i];
                    if (char === ' ') return ' ';
                    return FC_CHARS[Math.floor(Math.random() * FC_CHARS.length)];
                })
                .join('');

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }
            iteration += 0.5;
        }, 30);
    }, 400);
}

/**
 * Subliminal Tyler Flash
 * (Disabled per user request as the full-screen pink flashes were disruptive)
 */
function initSubliminalFlash() {
    return; // Fast exit to disable feature
}

/**
 * Cinematic Mouse tracking (Flashlight Spotlight via CSS Variables) using GSAP quickTo
 */
function initGlowTracking() {
    const hero = document.querySelector('.hero');
    const glow = document.querySelector('.hero-ambient-glow');
    if (!hero || !glow || window.innerWidth < 900) return;

    // 1. Initialize starting variables to match CSS default (50/50 center)
    gsap.set(hero, { "--mouse-x": 50, "--mouse-y": 50 });

    // 2. Optimized quickTo trackers
    const xTo = gsap.quickTo(hero, "--mouse-x", { duration: 0.4, ease: "power3", modifier: val => `${val}%` });
    const yTo = gsap.quickTo(hero, "--mouse-y", { duration: 0.4, ease: "power3", modifier: val => `${val}%` });

    let hasInteracted = false;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const targetX = ((e.clientX - rect.left) / rect.width) * 100;
        const targetY = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Fade in the effect only on first movement so it doesn't "glitch" into view on load
        if (!hasInteracted) {
            gsap.to(glow, { opacity: 1, duration: 1, ease: "power2.out" });
            hasInteracted = true;
        }

        xTo(targetX);
        yTo(targetY);
    });

    // Reset interaction on mouse leave if desired, or keep it on. 
    // Usually cleaner to keep it on once activated.
}

/**
 * Initialize all hero effects
 */
export function initHeroEffects() {
    initHeadlineReveal();
    initRuleTagScramble();
    initSubliminalFlash();
    initGlowTracking();
}
