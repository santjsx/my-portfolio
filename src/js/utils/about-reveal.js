import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAboutReveal() {
    const nameEl = document.querySelector('.character-name');
    if (!nameEl) return;

    // 1. Manually split text to preserve structure (<span>First</span> <span class="accent">Last</span>)
    const spans = nameEl.querySelectorAll('span');
    
    spans.forEach(span => {
        const text = span.textContent;
        const isAccent = span.classList.contains('character-name-accent');
        
        // Wrap each character in a .char span
        const splitText = text.split('').map(char => {
            if (char === ' ') return ' ';
            return `<span class="char">${char}</span>`;
        }).join('');
        
        span.innerHTML = splitText;
    });

    const characters = nameEl.querySelectorAll('.char');

    // 2. Initial State (set via GSAP to avoid layout shifts)
    gsap.set(characters, {
        opacity: 0,
        filter: 'blur(12px)',
        y: 20,
        scale: 1.1
    });

    // 3. ScrollTriggered Cinematic Animation
    ScrollTrigger.create({
        trigger: ".character-band",
        start: "top 75%",
        onEnter: () => {
            gsap.to(characters, {
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                scale: 1,
                duration: 1.2,
                stagger: {
                    amount: 0.8,
                    from: "start"
                },
                ease: "power4.out",
                overwrite: true
            });
        },
        onLeaveBack: () => {
             // Reset for "everytime" behavior
             gsap.set(characters, {
                opacity: 0,
                filter: 'blur(12px)',
                y: 20,
                scale: 1.1,
                overwrite: true
            });
        }
    });

    // Optional: Add a subtle lens flare or glow pass on hover
    nameEl.addEventListener('mouseenter', () => {
        gsap.to(characters, {
            textShadow: "0 0 15px rgba(242, 139, 130, 0.4)",
            duration: 0.5,
            stagger: 0.02
        });
    });

    nameEl.addEventListener('mouseleave', () => {
        gsap.to(characters, {
            textShadow: "none",
            duration: 0.5,
            stagger: 0.02
        });
    });
    // 4. Skill Items Mouse Tracker (Spotlight Effect)
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            item.style.setProperty('--mouse-x', `${x}%`);
            item.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}
