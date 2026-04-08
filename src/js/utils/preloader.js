// src/js/utils/preloader.js

export function initPreloader() {
    return new Promise((resolve) => {
        const loader = document.getElementById('premium-preloader');
        const percentEl = document.getElementById('loader-percent');
        
        // Only execute on mobile where the loader is visible
        if (!loader || window.getComputedStyle(loader).display === 'none') {
            resolve();
            return;
        }

    // Lock body scroll while loading
    document.body.style.overflow = 'hidden';

    let loadProgress = 0;
    let targetProgress = 0;
    
    // Dynamic Text Logic — Fight Club themed
    const dynamicTextEl = document.getElementById('loader-dynamic-text');
    const titles = ['First Rule', 'Second Rule', 'You Do Not Talk About It', 'Santhosh Reddy'];
    let titleIndex = 0;
    let textInterval = null;

    if (dynamicTextEl) {
        textInterval = setInterval(() => {
            // Fade out
            dynamicTextEl.classList.add('fade-out');
            
            setTimeout(() => {
                // Change text while invisible
                titleIndex = (titleIndex + 1) % titles.length;
                dynamicTextEl.textContent = titles[titleIndex];
                
                // Fade back in
                dynamicTextEl.classList.remove('fade-out');
            }, 300);
        }, 800);
    }

    // Smooth counter animation
    let hasLoaded = false;
    const updateCounter = () => {
        if (loadProgress < targetProgress) {
            loadProgress++;
            percentEl.textContent = loadProgress.toString().padStart(2, '0');
        }

        if (loadProgress < 100) {
            requestAnimationFrame(updateCounter);
        } else if (loadProgress >= 100 && !hasLoaded) {
            hasLoaded = true;
            
            // Clean up text interval
            if (textInterval) clearInterval(textInterval);

            // Unveil the website
            loader.classList.add('loaded');
            setTimeout(() => {
                document.body.style.overflow = '';
                resolve();
                setTimeout(() => loader.remove(), 1200);
            }, 500);
        }
    };
    
    // Start animation loop
    requestAnimationFrame(updateCounter);

    // Initial bumps
    setTimeout(() => { targetProgress = Math.max(targetProgress, 35); }, 100);
    setTimeout(() => { targetProgress = Math.max(targetProgress, 60); }, 500);
    setTimeout(() => { targetProgress = Math.max(targetProgress, 85); }, 1200);

    // Promise 1: Fetch the PDF to cache it natively
    fetch('/Santhosh%20Reddy%20Resume.pdf').catch(() => null);

    // Promise 2: Await Window Load
    const windowLoad = new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve, { once: true });
        }
    });

    // Failsafe: Maximum 2.5 seconds wait
    const absoluteFailsafe = new Promise(resolve => setTimeout(resolve, 2500));

    // Resolve when Window loads OR 2.5 seconds pass
    Promise.race([windowLoad, absoluteFailsafe]).then(() => {
        targetProgress = 100;
    });
    });
}
