export function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        // Only count stagger for elements that are actually being processed in this batch
        let batchStagger = 0;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Calculate delay dynamically for this batch (60ms stagger)
                const delay = batchStagger * 60;
                batchStagger++;

                setTimeout(() => {
                    entry.target.classList.add('visible');

                    // Release will-change after transition completes to free GPU memory
                    entry.target.addEventListener('transitionend', () => {
                        entry.target.style.willChange = 'auto';
                    }, { once: true });
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        // Reduced negative margin so it triggers earlier and feels more accurate
        rootMargin: '0px 0px -30px 0px',
        // Slight threshold so part of the element needs to be visible
        threshold: 0.05 
    });

    // We no longer pre-calculate delay based on global index, preventing massive delays for footer items
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}
