import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function setupLenis() {
    gsap.registerPlugin(ScrollTrigger);

    // Disable Lenis on mobile for native momentum scrolling performance
    if (window.innerWidth < 900) {
        return null;
    }

    const lenis = new Lenis({
        duration: 1.2,           /* Slightly faster but smoother duration */
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.1,               /* Added lerp for smoother interpolation */
    });

    // Synchronize Lenis with ScrollTrigger
    if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);

        // Optimization: Use gsap.ticker.add for perfect sync
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Prevents lagging by setting GSAP's max lag processing to 0
        gsap.ticker.lagSmoothing(0);

        // Pause Lenis when tab is hidden to save GPU cycles
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                lenis.stop();
            } else {
                lenis.start();
            }
        });

        // Optimization: Handle window resize for Lenis
        window.addEventListener('resize', () => {
            lenis.resize();
        });

        // Expose lenis for other modules if needed
        window.__lenis = lenis;
    }

    return lenis;
}
