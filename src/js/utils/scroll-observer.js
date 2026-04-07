export function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
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
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.fade-up').forEach((el, i) => {
        // Auto-stagger sequential elements
        el.dataset.delay = i * 60; // Slightly longer stagger for smoother cascade feel
        observer.observe(el);
    });
}
