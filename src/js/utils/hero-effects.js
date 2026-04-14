// src/js/utils/hero-effects.js
// Premium Fight Club hero: staggered reveal, scramble text, subliminal flash, glow tracking

const FC_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/01';

/**
 * Staggered cinematic Blur Reveal of headline rows
 */
function initHeadlineReveal() {
    const rows = document.querySelectorAll('.headline-row, .headline-divider');
    if (!rows.length) return;

    rows.forEach((row, i) => {
        row.style.opacity = '0';
        row.style.filter = 'blur(12px)';
        row.style.transform = 'translateY(15px) scale(0.98)';
        row.style.transition = `opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1), filter 1.2s cubic-bezier(0.19, 1, 0.22, 1), transform 1.2s cubic-bezier(0.19, 1, 0.22, 1)`;
        row.style.transitionDelay = `${0.3 + i * 0.15}s`;
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            rows.forEach(row => {
                row.style.opacity = '1';
                row.style.filter = 'blur(0)';
                row.style.transform = 'translateY(0) scale(1)';
            });
        });
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
    
    const flashEl = document.getElementById('subliminal-flash');
    if (!flashEl) return;

    const quotes = [
        'You are not your code.',
        'It\'s only after we\'ve lost everything that we\'re free to build anything.',
        'The things you own end up owning you.',
        'Self-improvement is masturbation.',
        'First rule: you do not talk about bugs.',
    ];

    function triggerFlash() {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        flashEl.querySelector('span').textContent = quote;
        flashEl.classList.add('active');
        
        setTimeout(() => {
            flashEl.classList.remove('active');
        }, 100);

        setTimeout(triggerFlash, 12000 + Math.random() * 18000);
    }

    setTimeout(triggerFlash, 6000 + Math.random() * 8000);
}

/**
 * Cinematic Mouse tracking (Flashlight Spotlight via CSS Variables)
 */
function initGlowTracking() {
    const hero = document.querySelector('.hero');
    if (!hero || window.innerWidth < 900) return;

    let targetX = 50, targetY = 50, currentX = 50, currentY = 50;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width) * 100;
        targetY = ((e.clientY - rect.top) / rect.height) * 100;
    });

    function lerp() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        
        hero.style.setProperty('--mouse-x', `${currentX}%`);
        hero.style.setProperty('--mouse-y', `${currentY}%`);
        
        requestAnimationFrame(lerp);
    }
    lerp();
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
