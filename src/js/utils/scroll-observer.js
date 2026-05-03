import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollObserver() {
    // We clear typical initial CSS opacity/transform rules from main.css 
    // to put GSAP in control of these scroll reveals. 

    // 1. Generic .fade-up Elements Batch Reveal (CTAs, Headers, etc.)
    gsap.set(".fade-up", { y: 40, opacity: 0 });

    ScrollTrigger.batch(".fade-up", {
        interval: 0.15, // time window to batch items entering at once
        batchMax: 6,   // maximum items to apply stagger to at once
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true,
            clearProps: "transform"
        }),
        start: "top 90%", // Trigger slightly before it comes fully into view
    });

    // 2. Skill Items (Arsenal Grid) Stagger
    gsap.set(".skill-item", { y: 20, opacity: 0 });
    
    ScrollTrigger.batch(".skill-item", {
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.7,
            ease: "power2.out",
            overwrite: true,
            clearProps: "transform"
        }),
        start: "top 90%"
    });

    // 3. Project Cards (Mayhem Grid) Sequence Reveal
    gsap.set(".mayhem-target", { y: 40, opacity: 0, scale: 0.98 });
    
    ScrollTrigger.batch(".mayhem-target", {
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: {
                each: 0.15,
                grid: [1, 2] // Grid format staggering (approx)
            },
            duration: 0.8,
            ease: "power3.out",
            clearProps: "scale", // Cleanup scaling transforms so hover animations work perfectly
            overwrite: true
        }),
        start: "top 85%"
    });

    // 4. Phase Cards (Cinema Chapter Cards) Sequence Reveal
    // Slight 3D rotation reveal
    gsap.set(".phase-card", { y: 30, opacity: 0, rotationX: 5, transformPerspective: 800 });
    
    ScrollTrigger.batch(".phase-card", {
        onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            stagger: 0.2,
            duration: 0.9,
            ease: "power3.out",
            clearProps: "transformPerspective,rotationX,transform", 
            overwrite: true
        }),
        start: "top 85%"
    });
}
