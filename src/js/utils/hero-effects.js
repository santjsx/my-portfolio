// src/js/utils/hero-effects.js
// Cinematic hero enhancements: word-by-word title reveal, scramble text, floating particles

/**
 * Builds the hero title with word-by-word stagger animation
 */
function initHeroTitle() {
    const titleEl = document.getElementById('hero-title');
    if (!titleEl) return;

    // Define the title as segments. Each segment is either plain text or a special span.
    const segments = [
        { text: "I'm Santhosh, a Developer who doesn't build what you ", type: 'plain' },
        { text: "want", type: 'serif-italic' },
        { text: " ", type: 'plain' },
        { html: '<span style="color: var(--accent-danger); font-family: var(--font-mono); margin: 0 4px;">//</span>', type: 'raw' },
        { text: " I build what you ", type: 'plain' },
        { text: "need.", type: 'serif-italic' },
        { text: " Where ", type: 'plain' },
        { text: "destruction meets creation.", type: 'highlight-raw' },
    ];

    let wordIndex = 0;

    segments.forEach(seg => {
        if (seg.type === 'raw') {
            // Insert raw HTML element directly
            const wrapper = document.createElement('span');
            wrapper.classList.add('hero-word');
            wrapper.innerHTML = seg.html;
            wrapper.style.animationDelay = `${0.4 + wordIndex * 0.05}s`;
            titleEl.appendChild(wrapper);
            wordIndex++;
            return;
        }

        const words = seg.text.split(/(\s+)/);
        words.forEach(word => {
            if (word === '') return;

            const span = document.createElement('span');
            span.classList.add('hero-word');

            if (word.trim() === '') {
                // Whitespace
                span.innerHTML = '&nbsp;';
                span.style.animationDelay = `${0.4 + wordIndex * 0.05}s`;
            } else {
                if (seg.type === 'serif-italic') {
                    const inner = document.createElement('span');
                    inner.className = 'serif-italic';
                    inner.textContent = word;
                    span.appendChild(inner);
                } else if (seg.type === 'highlight-raw') {
                    const inner = document.createElement('span');
                    inner.className = 'highlight-raw';
                    inner.textContent = word;
                    span.appendChild(inner);
                } else {
                    span.textContent = word;
                }
                span.style.animationDelay = `${0.4 + wordIndex * 0.05}s`;
                wordIndex++;
            }

            titleEl.appendChild(span);
        });
    });
}

/**
 * Scramble text effect on the hero intro line
 */
function initScrambleText() {
    const el = document.getElementById('hero-intro-text');
    if (!el) return;

    const originalText = el.getAttribute('data-text') || el.textContent;
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/01';
    let iteration = 0;

    el.textContent = '';

    // Start after a short delay
    setTimeout(() => {
        const interval = setInterval(() => {
            el.textContent = originalText
                .split('')
                .map((char, i) => {
                    if (i < iteration) return originalText[i];
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 2; // Speed: 2 frames per character
        }, 30);
    }, 600);
}

/**
 * Ambient floating particles
 */
function initParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const PARTICLE_COUNT = 20;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement('div');
        particle.classList.add('hero-particle');

        // Random positioning & timing
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${60 + Math.random() * 40}%`; // Start from bottom half
        particle.style.animationDuration = `${4 + Math.random() * 6}s`;
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.width = `${1 + Math.random() * 2}px`;
        particle.style.height = particle.style.width;

        container.appendChild(particle);
    }
}

/**
 * Initialize all hero effects
 */
export function initHeroEffects() {
    initHeroTitle();
    initScrambleText();
    initParticles();
}
