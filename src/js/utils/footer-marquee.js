import gsap from 'gsap';

/**
 * Footer Marquee Interaction
 * Uses GSAP for a buttery smooth, non-glitchy experience.
 * Removes hover effects and follows accent colors via CSS.
 */
export function initFooterMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;

    // 1. Create the base marquee animation
    // We animate to -50% for a seamless loop with the duplicated content
    const marquee = gsap.to(track, {
        xPercent: -50,
        ease: "none",
        duration: 40, // Slightly slower base speed for better readability
        repeat: -1
    });

    let scrollTimeout;
    let lastScrollY = window.scrollY;

    // 2. Scroll-Reactive Speed (TimeScale)
    // We use a smoother interpolation for the velocity
    const updateSpeed = () => {
        const currentScrollY = window.scrollY;
        const velocity = Math.abs(currentScrollY - lastScrollY);
        lastScrollY = currentScrollY;

        // Map velocity to timeScale (1.0 to 6.0)
        // We use a more dampening factor for silkiness
        const targetScale = 1 + (velocity * 0.08);
        
        // Smoothly ramp up the speed
        gsap.to(marquee, {
            timeScale: Math.min(targetScale, 6),
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
        });

        // Clear previous timeout and return to normal speed
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            gsap.to(marquee, {
                timeScale: 1,
                duration: 2.0, // Very smooth return
                ease: "power2.inOut",
                overwrite: "auto"
            });
        }, 50);
    };

    window.addEventListener('scroll', updateSpeed, { passive: true });

    // Initial kick to ensure it's running
    marquee.play();

    console.log('🏁 FOOTER MARQUEE: SILKY SMOOTH ENGINE ACTIVE');
}
