export function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger children with data-stagger for smoother reveals
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
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
        el.dataset.delay = i * 50;
        observer.observe(el);
    });
}
