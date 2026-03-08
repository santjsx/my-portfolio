// src/js/utils/drawer.js
export function initResumeDrawer() {
    const openBtns = document.querySelectorAll('.js-open-resume');
    const closeBtns = document.querySelectorAll('.js-close-resume');

    // Open drawer
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('drawer-open');
        });
    });

    // Close drawer logic
    const closeHandler = (e) => {
        const btn = e.target.closest('.js-close-resume');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        console.log('Closing resume drawer...');
        document.body.classList.remove('drawer-open');
    };

    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeHandler);
    });

    // Also close if clicking the overlay specifically (redundant but safe)
    const overlay = document.querySelector('.resume-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            document.body.classList.remove('drawer-open');
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
            document.body.classList.remove('drawer-open');
        }
    });
}
