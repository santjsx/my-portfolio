import gsap from 'gsap';

/**
 * Handles the "striking off" of 'want' and pointing an arrow towards 'need'
 * with a premium, cinematic timing.
 */
export function initHeroCorrection() {
    const strikeTarget = document.querySelector('.hero-strike-target');
    const pointTarget = document.querySelector('.hero-point-target');
    if (!strikeTarget || !pointTarget) return;

    // Create a timeline that starts after the main hero entrance
    const tl = gsap.timeline({
        delay: 2.2, // Time for hero-headline fade-up to complete
        defaults: { ease: "power3.out" }
    });

    // 1. Strike through 'want'
    tl.to(strikeTarget, {
        onStart: () => strikeTarget.classList.add('active'),
        duration: 0.1 // Just a trigger for the CSS transition
    })
    
    // 2. Highlight 'need' as the final payoff
    .to(pointTarget, {
        scale: 1.1,
        color: "var(--accent-primary)",
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
    }, "-=0.2")
    
    .to(pointTarget, {
        scale: 1,
        duration: 0.4
    });
}
