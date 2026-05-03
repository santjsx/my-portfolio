// src/js/utils/preloader.js
// Ultra-Premium Cinematic Title Sequence
// Built with GSAP for high-fidelity motion control

import gsap from 'gsap';

export function initPreloader() {
    return new Promise((resolve) => {
        const loader = document.getElementById('premium-preloader');
        
        // ── SKIP LOADER IF REQUESTED ──
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('skipLoader') === 'true') {
            if (loader) loader.remove();
            document.body.style.overflow = '';
            resolve();
            return;
        }

        if (!loader) {
            resolve();
            return;
        }

        const percentEl = document.getElementById('loader-percent');
        const nameEls = loader.querySelectorAll('.loader-name');
        const topMeta = loader.querySelector('.loader-top-meta');
        const bottomMeta = loader.querySelector('.loader-bottom-meta');
        const panels = loader.querySelectorAll('.loader-panel');
        const letterboxes = loader.querySelectorAll('.loader-letterbox');

        // Lock Body Scroll
        document.body.style.overflow = 'hidden';

        // ── 1. Preparation ──
        gsap.set([topMeta, bottomMeta], { opacity: 0 });
        gsap.set(nameEls, { y: '110%', opacity: 0, filter: 'blur(20px)' });

        // ── 2. Entrance Sequence ──
        const entranceTl = gsap.timeline({
            defaults: { ease: "power4.out", duration: 1.2 }
        });

        entranceTl
            .to(topMeta, { opacity: 1, y: 0, duration: 1 }, "+=0.2")
            .to(bottomMeta, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4") // Show counter earlier
            .to(nameEls, {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                stagger: 0.2,
                ease: "expo.out",
                onStart: () => {
                    // Start the counter precisely when the name reveal begins
                    startCounterCrawl();
                }
            }, "-=0.6");

        // ── 3. Loading Logic (Smooth GSAP Counter) ──
        let isFullyLoaded = false;
        const counterObj = { value: 0 };
        let counterTl;

        function startCounterCrawl() {
            console.log('🔢 LOADER: Starting counter crawl');
            counterTl = gsap.to(counterObj, {
                value: 90,
                duration: 2.5, // Faster crawl
                ease: "none", 
                onUpdate: () => {
                    if (percentEl) {
                        percentEl.textContent = Math.floor(counterObj.value).toString().padStart(2, '0');
                    }
                }
            });
        }

        const triggerExit = () => {
            if (isFullyLoaded) return;
            isFullyLoaded = true;
            
            // Finish the counter to 100 smoothly
            if (counterTl) counterTl.kill();
            gsap.to(counterObj, {
                value: 100,
                duration: 0.6, // Faster zip to 100
                ease: "power2.out",
                onUpdate: () => {
                    if (percentEl) {
                        percentEl.textContent = Math.floor(counterObj.value).toString().padStart(2, '0');
                    }
                },
                onComplete: () => {
                    triggerExitSequence();
                }
            });
        };

        // Window Load Promise
        const windowLoad = new Promise(res => {
            if (document.readyState === 'complete') res();
            else window.addEventListener('load', res, { once: true });
        });

        // Failsafe: Continue anyway after 4s
        const failsafe = new Promise(res => setTimeout(res, 4000));
        
        fetch('/Santhosh%20Reddy%20Resume.pdf').catch(() => null);

        Promise.race([windowLoad, failsafe]).then((res) => {
            console.log('🎬 LOADER: Window load or failsafe triggered');
            // Once loaded, we wait a beat for the entrance to finish, then hit 100
            setTimeout(triggerExit, 400); // Shorter delay
        });

        // ── 4. Exit Sequence (The "Wow" Moment) ──
        function triggerExitSequence() {
            console.log('🚀 LOADER: Starting exit sequence');
            const exitTl = gsap.timeline({
                onComplete: () => {
                    console.log('✅ LOADER: Exit sequence complete');
                    document.body.style.overflow = '';
                    loader.classList.add('loaded');
                    setTimeout(() => loader.remove(), 1000);
                    resolve();
                }
            });

            exitTl
                .to(nameEls, {
                    scale: 1.02,
                    letterSpacing: "0.05em",
                    duration: 0.8,
                    ease: "power2.inOut"
                })
                .to([topMeta, bottomMeta, nameEls], {
                    opacity: 0,
                    y: -20,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power4.in"
                })
                .to(letterboxes, {
                    scaleY: 0,
                    opacity: 0,
                    duration: 0.6,
                    ease: "expo.in"
                }, "-=0.2")
                .to(panels[0], { // Top Panel
                    yPercent: -101,
                    duration: 1.2,
                    ease: "power4.inOut"
                }, "-=0.3")
                .to(panels[1], { // Bottom Panel
                    yPercent: 101,
                    duration: 1.2,
                    ease: "power4.inOut"
                }, "<");
        }
    });
}

/**
 * Emergency Failsafe: Forcefully removes the preloader if it hangs.
 */
export function forceHidePreloader() {
    const loader = document.getElementById('premium-preloader');
    if (loader) {
        console.warn('⚠️ LOADER: Emergency removal triggered');
        loader.style.transition = 'opacity 0.8s ease';
        loader.style.opacity = '0';
        document.body.style.overflow = '';
        setTimeout(() => loader.remove(), 800);
    }
}
