import { gsap } from 'gsap';

// SplitText Mock to handle "new SplitText" syntax
class SplitText {
  constructor(element, options) {
    this.elements = [element];
    this.chars = [];
    
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach(char => {
      const span = document.createElement('div');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      element.appendChild(span);
      this.chars.push(span);
    });
  }
}

export function initNavigationV2() {
  // DOM Elements
  const navToggle = document.getElementById('nav-toggle');
  const menuLabel = document.querySelector('.menu-label');
  const closeLabel = document.querySelector('.close-label');
  const menuOverlay = document.getElementById('menu');
  const svgPath = document.getElementById('svg-path');
  const menuSvg = document.getElementById('menu-svg');
  const menuLogo = document.querySelector('.menu-logo');
  const navLinks = document.querySelectorAll('.nav-link');
  const infoItems = document.querySelectorAll('.menu-column-info > *');

  if (!navToggle || !menuOverlay || !svgPath || !menuSvg) return;

  // SVG Dimensions
  const svgWidth = menuSvg.viewBox.baseVal.width || 1000;
  const svgHeight = menuSvg.viewBox.baseVal.height || 1000;
  const centerX = svgWidth / 2;

  // SVG Path States
  const paths = {
    openHidden: `M 0 0 L ${svgWidth} 0 L ${svgWidth} 0 Q ${centerX} 0 0 0 Z`, 
    openBulge: `M 0 0 L ${svgWidth} 0 L ${svgWidth} 200 Q ${centerX} 600 0 200 Z`, 
    openFull: `M 0 0 L ${svgWidth} 0 L ${svgWidth} ${svgHeight} Q ${centerX} ${svgHeight} 0 ${svgHeight} Z`,
    closeStart: `M 0 0 L ${svgWidth} 0 L ${svgWidth} ${svgHeight} Q ${centerX} ${svgHeight} 0 ${svgHeight} Z`,
    closeBulge: `M 0 ${svgHeight} L ${svgWidth} ${svgHeight} L ${svgWidth} ${svgHeight - 200} Q ${centerX} ${svgHeight - 600} 0 ${svgHeight - 200} Z`,
    closeHidden: `M 0 ${svgHeight} L ${svgWidth} ${svgHeight} L ${svgWidth} ${svgHeight} Q ${centerX} ${svgHeight} 0 ${svgHeight} Z`
  };

  // Initial States
  gsap.set(svgPath, { attr: { d: paths.openHidden } });
  gsap.set(infoItems, { opacity: 0, y: 50 });
  gsap.set(menuLogo, { opacity: 0 });

  // Setup SplitText
  let splits = [];
  navLinks.forEach(link => {
    const split = new SplitText(link, { type: "chars" });
    splits.push(split);
    // Push characters way off right and hide them
    gsap.set(split.chars, { x: 200, opacity: 0 }); 
  });

  // State variables
  let isOpen = false;
  let isAnimating = false;

  // Event Listener
  navToggle.addEventListener('click', () => {
    if (isAnimating) return; // Prevent breaking mid-animation
    isAnimating = true;
    isOpen = !isOpen;
    
    if (isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  // Close on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen && !isAnimating) {
        isAnimating = true;
        isOpen = false;
        closeMenu();
      }
    });
  });

  function openMenu() {
    menuOverlay.classList.add('is-open');
    
    // Label Swap (Independent of timeline)
    gsap.to(menuLabel, { opacity: 0, y: -10, duration: 0.3 });
    gsap.to(closeLabel, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 });

    const tl = gsap.timeline({
      onComplete: () => { isAnimating = false; }
    });

    // Background Shape Sequence
    tl.to(svgPath, { attr: { d: paths.openBulge }, ease: "power2.in", duration: 0.4 })
      .to(svgPath, { attr: { d: paths.openFull }, ease: "power2.out", duration: 0.4 });

    // Menu Logo (Fades in while shape is animating)
    tl.to(menuLogo, { opacity: 1, duration: 0.5 }, "-=0.75");

    // Info Column Stagger
    tl.to(infoItems, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }, "-=0.75");

    // Flatten character arrays
    const allChars = splits.flatMap(split => split.chars);

    // Links Character parallel tweens (elastic bounce + smooth fade)
    tl.to(allChars, { x: 0, ease: "elastic.out(1, 0.5)", duration: 1, stagger: 0.02 }, 0.5);
    tl.to(allChars, { opacity: 1, ease: "power2.out", duration: 0.5, stagger: 0.02 }, 0.5);
  }

  function closeMenu() {
    // Snap shape to fulfilled top state instantly
    gsap.set(svgPath, { attr: { d: paths.closeStart } });

    // Label Swap
    gsap.to(closeLabel, { opacity: 0, y: 10, duration: 0.3 });
    gsap.to(menuLabel, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 });

    const tl = gsap.timeline({
      onComplete: () => {
        // Crucial cleanup reset
        menuOverlay.classList.remove('is-open');
        gsap.set(svgPath, { attr: { d: paths.openHidden } });
        const allChars = splits.flatMap(split => split.chars);
        gsap.set(allChars, { x: 200, opacity: 0 });
        gsap.set(infoItems, { opacity: 0, y: 50 });
        gsap.set(menuLogo, { opacity: 0 });
        isAnimating = false;
      }
    });

    // Animate content out simultaneously
    const allChars = splits.flatMap(split => split.chars);
    tl.to([menuLogo, ...allChars, ...infoItems], { opacity: 0, duration: 0.3 }, "<");

    // Background Shape Close Sequence
    tl.to(svgPath, { attr: { d: paths.closeBulge }, ease: "power2.in", duration: 0.4 }, "<")
      .to(svgPath, { attr: { d: paths.closeHidden }, ease: "power2.out", duration: 0.4 });
  }
}
