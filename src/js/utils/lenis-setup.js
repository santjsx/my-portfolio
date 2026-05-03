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
        duration: 1.5,           /* Buttery smooth duration */
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,     /* Normalized for better predictability */
        touchMultiplier: 1.5,
        infinite: false,
    });

    // Synchronize Lenis with ScrollTrigger
    if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);

        // Add Lenis's requestAnimationFrame to GSAP's ticker
        // This ensures perfect synchronization between GSAP animations and smooth scrolling
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

        // Expose lenis for other modules if needed
        window.__lenis = lenis;
    }

    return lenis;
}
