// src/js/utils/drawer.js
export function initResumeDrawer() {
    const openBtns = document.querySelectorAll('.js-open-resume');
    const closeBtns = document.querySelectorAll('.js-close-resume');

    // PDF.js State
    let pdfDoc = null;
    let pageRendering = false;
    let pageNumPending = null;
    let pdfLoaded = false;

    // Async function to load and render the PDF
    const renderPDF = async () => {
        if (pdfLoaded) return; // Prevent re-fetching if already loaded

        const url = '/Santhosh%20Reddy%20Resume.pdf';
        const canvas = document.getElementById('pdf-canvas');
        const loadingDiv = document.getElementById('pdf-loading');
        
        if (!canvas || !window.pdfjsLib) return;

        const ctx = canvas.getContext('2d');
        
        // Setup worker
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        try {
            pdfDoc = await window.pdfjsLib.getDocument(url).promise;
            const page = await pdfDoc.getPage(1); // Resume is 1 page

            // Calculate scale to fit drawer width securely 
            // We pad it slightly so it doesn't touch the exact edges
            const containerWidth = document.getElementById('pdf-container').clientWidth;
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            // Aim for 95% of container width on mobile, 100% on desktop
            const scale = (containerWidth * 0.95) / unscaledViewport.width; 
            
            const viewport = page.getViewport({ scale: scale });

            // Support high-DPI screens
            const outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            const transform = outputScale !== 1 
                ? [outputScale, 0, 0, outputScale, 0, 0] 
                : null;

            const renderContext = {
                canvasContext: ctx,
                transform: transform,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            
            // Show canvas, hide loading
            loadingDiv.style.display = 'none';
            canvas.style.display = 'block';
            pdfLoaded = true;

        } catch (error) {
            console.error('Error rendering PDF:', error);
            loadingDiv.textContent = 'Failed to load inline document.';
        }
    };

    // Open drawer
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('drawer-open');
            // Trigger render when drawer opens
            renderPDF();
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
