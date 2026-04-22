import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initGSAPAnimations() {
    // Media Query context for GSAP
    let mm = gsap.matchMedia();

    mm.add("(min-width: 901px)", () => {
        // Desktop Parallax and Scrubbed Animations
        
        // 1. Hero Parallax
        const heroSubBg = document.querySelector('.hero-premium-gradient');
        if (heroSubBg) {
            gsap.to(heroSubBg, {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        const heroGridBg = document.querySelector('.hero-grid-bg');
        if (heroGridBg) {
            gsap.to(heroGridBg, {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // 2. Mayhem Marquee Scrub Control
        const marquee = document.querySelector('.mayhem-marquee');
        if (marquee) {
            gsap.to(marquee, {
                xPercent: -30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".mayhem-works",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5 // Smooth scrubbing
                }
            });
        }

        // 3. About Section Parallax Background
        const aboutVector = document.querySelector('.about-vector-bg');
        if (aboutVector) {
            gsap.to(aboutVector, {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: ".about-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }

        // About Photo subtle zoom out on scroll
        const aboutPhoto = document.querySelector('.character-photo img');
        if (aboutPhoto) {
            gsap.to(aboutPhoto, {
                scale: 1.15,
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: ".character-band",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }
    });

    mm.add("(max-width: 900px)", () => {
        // Lighter mobile animations
        // Parallax is typically disabled for performance & usability here
    });

    // Magnetic Cursor interactions for specific buttons
    const magneticItems = document.querySelectorAll('.t-btn, .hero-cta-link, .nav-item, .contact-card');
    magneticItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const bound = item.getBoundingClientRect();
            const x = e.clientX - bound.left - bound.width / 2;
            const y = e.clientY - bound.top - bound.height / 2;
            
            // Limit magnetism effect strength
            gsap.to(item, {
                x: x * 0.15,
                y: y * 0.15,
                duration: 1,
                ease: "power3.out"
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                x: 0,
                y: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.4)" // Soft spring snapback
            });
        });
    });
}
