/**
 * VIBE PORTAL — Cinematic Choice Overlay
 * Opens a full-screen choice when clicking "My Vibe" in navigation.
 */
import gsap from 'gsap';

export function initVibePortal() {
    const portal = document.getElementById('vibe-portal');
    if (!portal) return;

    const closeBtn = document.getElementById('portal-close');
    const vibeLinks = document.querySelectorAll('.js-open-vibe-portal');
    const cards = portal.querySelectorAll('.portal-card');

    const openPortal = (e) => {
        e.preventDefault();

        // Close the mobile nav if it's open
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const navOverlay = document.getElementById('nav-overlay');
        if (mobileToggle && navOverlay && navOverlay.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        portal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Animate entrance
        gsap.fromTo(cards,
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "power4.out", delay: 0.15 }
        );
    };

    const closePortal = () => {
        gsap.to(cards, {
            opacity: 0, y: -30, duration: 0.3, stagger: 0.05, ease: "power2.in",
            onComplete: () => {
                portal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    };

    // Bind all "My Vibe" links
    vibeLinks.forEach(link => {
        link.addEventListener('click', openPortal);
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closePortal);
    }

    // Close on ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && portal.classList.contains('active')) {
            closePortal();
        }
    });

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const href = card.getAttribute('href');
            
            if (href) {
                gsap.to(cards, {
                    opacity: 0, y: -30, duration: 0.25, stagger: 0.05, ease: "power2.in",
                    onComplete: () => {
                        portal.classList.remove('active');
                        document.body.style.overflow = '';
                        window.location.href = href;
                    }
                });
            }
        });
    });
}
