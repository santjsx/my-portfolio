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

        // 2. Project Grid Entrance
        const projects = document.querySelectorAll('.project-card');
        if (projects.length > 0) {
            gsap.from(projects, {
                opacity: 0,
                y: 60,
                stagger: 0.15,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".projects-grid",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
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

        // About Photo subtle zoom out on scroll - Disabled for ProfileCard compatibility
        /*
        const aboutPhoto = document.querySelector('.character-photo img');
        if (aboutPhoto) {
            gsap.to(aboutPhoto, {
                scale: 1.15,
                yPercent: 0, 
                ease: "none",
                scrollTrigger: {
                    trigger: ".character-band",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }
        */
    });

    mm.add("(max-width: 900px)", () => {
        // Lighter mobile animations
        // Parallax is typically disabled for performance & usability here
    });

    // Magnetic Cursor interactions for specific buttons
    const magneticItems = document.querySelectorAll('.t-btn, .hero-cta-link, .nav-item, .contact-card, .gallery-cta');
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
    
    // ── PAGE ENTRANCE ANIMATIONS ──
    const fadeUps = document.querySelectorAll('.fade-up');
    if (fadeUps.length > 0) {
        gsap.fromTo(fadeUps, 
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.1,
                clearProps: "all"
            }
        );
    }

    // ── SCROLL REVEAL (For deep-page elements like Footer) ──
    const scrollReveals = document.querySelectorAll('.scroll-reveal');
    scrollReveals.forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%", // Trigger early
                    toggleActions: "play none none none" // Only play once
                }
            }
        );
    });
}
