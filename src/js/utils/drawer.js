// src/js/utils/drawer.js
export function initResumeDrawer() {
    const openBtns = document.querySelectorAll('.js-open-resume');
    const closeBtns = document.querySelectorAll('.js-close-resume');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');

    // PDF.js State
    let pdfDoc = null;
    let currentScale = 0.8; // Default 80% view
    let pdfLoaded = false;

    // Single source of truth for rendering
    const renderPage = async (scale) => {
        const url = '/Santhosh%20Reddy%20Resume.pdf';
        const canvas = document.getElementById('pdf-canvas');
        const loadingDiv = document.getElementById('pdf-loading');
        
        if (!canvas || !window.pdfjsLib) return;

        const ctx = canvas.getContext('2d');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        try {
            if (!pdfDoc) {
                pdfDoc = await window.pdfjsLib.getDocument(url).promise;
            }
            
            const page = await pdfDoc.getPage(1);
            
            // Calculate base viewport
            const containerWidth = document.getElementById('pdf-container').clientWidth;
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            
            // The logic: 1.0 scale = full width.
            // currentScale acts as a multiplier of that container width.
            const calculatedScale = (containerWidth / unscaledViewport.width) * scale;
            const viewport = page.getViewport({ scale: calculatedScale });

            // Support high-DPI
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            const renderContext = {
                canvasContext: ctx,
                transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            
            if (loadingDiv) loadingDiv.style.display = 'none';
            canvas.style.display = 'block';
            pdfLoaded = true;

        } catch (error) {
            console.error('Error rendering PDF:', error);
            if (loadingDiv) loadingDiv.textContent = 'Failed to load document.';
        }
    };

    // Zoom Handlers
    const updateZoom = (newScale) => {
        currentScale = Math.min(Math.max(newScale, 0.4), 2.5); // Bound between 40% and 250%
        if (zoomResetBtn) zoomResetBtn.textContent = `${Math.round(currentScale * 100)}%`;
        renderPage(currentScale);
    };

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => updateZoom(currentScale + 0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => updateZoom(currentScale - 0.1));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => updateZoom(0.8));

    // Open drawer (using delegation to support dynamic menu items)
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.js-open-resume');
        if (btn) {
            e.preventDefault();
            document.body.classList.add('drawer-open');
            // Pause Lenis global scroll to allow internal drawer scroll
            if (window.__lenis) window.__lenis.stop();
            
            if (!pdfLoaded) renderPage(currentScale);
        }
    });

    // Close drawer logic
    const closeHandler = (e) => {
        if (e) e.preventDefault();
        document.body.classList.remove('drawer-open');
        // Restart Lenis global scroll
        if (window.__lenis) window.__lenis.start();
    };

    closeBtns.forEach(btn => btn.addEventListener('click', closeHandler));

    const overlay = document.querySelector('.resume-overlay');
    if (overlay) overlay.addEventListener('click', closeHandler);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
            document.body.classList.remove('drawer-open');
        }
    });
}
