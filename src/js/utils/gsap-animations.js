import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true, nullTargetWarn: false });

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
                    scrub: true,
                    fastScrollEnd: true
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
                    scrub: true,
                    fastScrollEnd: true
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
                    scrub: 1,
                    fastScrollEnd: true
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
    const magneticItems = document.querySelectorAll('.t-btn, .hero-cta-link, .nav-item, .contact-card, .gallery-cta, .pill-card');
    magneticItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const bound = item.getBoundingClientRect();
            const x = e.clientX - bound.left - bound.width / 2;
            const y = e.clientY - bound.top - bound.height / 2;
            
            gsap.to(item, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.8,
                ease: "power2.out"
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                x: 0,
                y: 0,
                duration: 1.2,
                ease: "elastic.out(1, 0.3)" 
            });
        });
    });
    
    // ── PAGE ENTRANCE ANIMATIONS ──
    const fadeUps = document.querySelectorAll('.fade-up');
    if (fadeUps.length > 0) {
        gsap.fromTo(fadeUps, 
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: {
                    amount: 0.5,
                    ease: "power2.inOut"
                },
                ease: "expo.out",
                delay: 0.2,
                clearProps: "all"
            }
        );
    }

    // ── GLOBAL SECTION SMOOTHNESS ──
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 15,
            duration: 1.0, // Faster duration
            ease: "expo.out",
            scrollTrigger: {
                trigger: section,
                start: "top 95%", // Trigger earlier
                toggleActions: "play none none none",
                fastScrollEnd: true
            }
        });
    });

    // ── SCROLL REVEAL (For specific elements) ──
    const scrollReveals = document.querySelectorAll('.scroll-reveal');
    scrollReveals.forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%",
                    toggleActions: "play none none none",
                    fastScrollEnd: true
                }
            }
        );
    });
}
