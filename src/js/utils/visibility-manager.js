/**
 * Visibility Manager
 * 
 * Utility to pause/resume expensive animations or logic based on element visibility.
 * Helps achieve 120 FPS by reducing main thread work and GPU usage for off-screen elements.
 */

export function observeVisibility(element, onVisible, onHidden, threshold = 0.05) {
    if (!element) return null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (typeof onVisible === 'function') onVisible();
            } else {
                if (typeof onHidden === 'function') onHidden();
            }
        });
    }, { threshold });

    observer.observe(element);

    return () => observer.disconnect();
}

/**
 * Higher-level wrapper for animation loops
 */
export function manageAnimationVisibility(container, startAnim, stopAnim) {
    let isPaused = true;

    return observeVisibility(
        container,
        () => {
            if (isPaused) {
                startAnim();
                isPaused = false;
            }
        },
        () => {
            if (!isPaused) {
                stopAnim();
                isPaused = true;
            }
        }
    );
}
