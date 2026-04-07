import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function setupLenis() {
    const lenis = new Lenis({
        lerp: 0.12,               /* Slightly higher = snappier feel while staying silky */
        wheelMultiplier: 0.9,     /* Tame aggressive scroll wheels */
        smoothWheel: true,
        smoothTouch: true,
        touchMultiplier: 2.0,     /* Natural mobile swipe without overshoot */
        gestureOrientation: 'vertical',
        infinite: false,
        autoResize: true,
        syncTouch: true,          /* Synchronize touch events with rAF for zero-stutter */
        syncTouchLerp: 0.06,     /* Gentle touch deceleration curve */
    });

    // Use a single, clean rAF loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

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

    return lenis;
}
