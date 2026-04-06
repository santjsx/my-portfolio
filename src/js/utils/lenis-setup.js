import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function setupLenis() {
    const lenis = new Lenis({
        lerp: 0.08,               /* Spring-physics friction (replaces duration) for buttery inertia */
        wheelMultiplier: 1.0,     /* Standard desktop wheel speed */
        smoothWheel: true,
        smoothTouch: true,        /* Forces Lenis physics on mobile swipes */
        touchMultiplier: 2.5,     /* Significantly increases mobile responsiveness */
        gestureOrientation: 'vertical',
        infinite: false,
        autoResize: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Expose lenis for other modules if needed
    window.__lenis = lenis;

    return lenis;
}
