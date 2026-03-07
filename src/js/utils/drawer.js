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

    // Close drawer
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.remove('drawer-open');
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
            document.body.classList.remove('drawer-open');
        }
    });
}
