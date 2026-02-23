/* PERFORMANCE & ANIMATIONS */

/* Smooth Scroll */
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

// Sync Lenis with GSAP for butter-smooth performance
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* Theme Toggle */
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const themeIcon = themeToggle.querySelector('i');
const mobileThemeIcon = mobileThemeToggle.querySelector('i');

// Check for saved theme
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeIcon.className = 'ri-sun-line';
  if (mobileThemeIcon) mobileThemeIcon.className = 'ri-sun-line';
  if (mobileThemeToggle) mobileThemeToggle.innerHTML = '<i class="ri-sun-line"></i> Theme';
}

function executeThemeSwitch() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeIcon.className = 'ri-moon-line';
    if (mobileThemeIcon) mobileThemeIcon.className = 'ri-moon-line';
    if (mobileThemeToggle) mobileThemeToggle.innerHTML = '<i class="ri-moon-line"></i> Theme';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeIcon.className = 'ri-sun-line';
    if (mobileThemeIcon) mobileThemeIcon.className = 'ri-sun-line';
    if (mobileThemeToggle) mobileThemeToggle.innerHTML = '<i class="ri-sun-line"></i> Theme';
  }
}

function toggleTheme(e) {
  if (!document.startViewTransition) {
    executeThemeSwitch();
    return;
  }
  const x = e?.clientX ?? window.innerWidth / 2;
  const y = e?.clientY ?? window.innerHeight / 2;
  document.documentElement.style.setProperty('--x', `${x}px`);
  document.documentElement.style.setProperty('--y', `${y}px`);
  document.startViewTransition(() => {
    executeThemeSwitch();
  });
}

themeToggle.addEventListener('click', toggleTheme);
if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener('click', (e) => {
    toggleTheme(e);
    if (isMenuOpen) toggleMobileMenu();
  });
}

/* Navigation Styles */
const nav = document.getElementById("main-nav");
const navToggle = document.getElementById("nav-toggle");
const mobileOverlay = document.getElementById("mobile-nav-overlay");
const mobileLinks = document.querySelectorAll(".mobile-link span");
const mobileStatusSection = document.querySelector(".mobile-status-section");
let isMenuOpen = false;

const menuTl = gsap.timeline({ paused: true });
menuTl
  .to(mobileOverlay, { autoAlpha: 1, duration: 0.5, ease: "power4.inOut" })
  .fromTo(mobileLinks, { y: 100 }, { y: 0, duration: 0.8, stagger: 0.1, ease: "power4.out" }, "-=0.3")
  .fromTo(mobileStatusSection, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");

function toggleMobileMenu() {
  if (isMenuOpen) {
    menuTl.reverse();
    navToggle.classList.remove("active");
    gsap.to(navToggle, { scale: 1, duration: 0.4, ease: "power2.out" });
    document.body.style.overflow = "";
    isMenuOpen = false;
  } else {
    menuTl.play();
    navToggle.classList.add("active");
    gsap.fromTo(navToggle, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    document.body.style.overflow = "hidden";
    isMenuOpen = true;
  }
}

navToggle.addEventListener("click", toggleMobileMenu);
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => { if (isMenuOpen) toggleMobileMenu(); });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
  });
});

/* GSAP Animations */

function initScrollAnimations() {
  gsap.utils.toArray(".anim-fade-up").forEach((el, i) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      delay: el.closest(".hero") ? i * 0.12 : 0.05
    });
  });

  // Technical Scanner Animation
  const scannerWrap = document.querySelector(".about-image-wrapper");
  if (scannerWrap) {
    const locks = scannerWrap.querySelectorAll(".lock");
    const line = scannerWrap.querySelector(".scanner-line");
    gsap.timeline({ scrollTrigger: { trigger: scannerWrap, start: "top 80%" } })
      .to(locks, { opacity: 0.8, duration: 0.5 })
      .fromTo(locks, { inset: "40%" }, { inset: "1.5rem", duration: 1, ease: "power4.out" }, "<")
      .set(line, { display: "block" }, "-=0.2")
      .fromTo(line, { opacity: 0 }, { opacity: 0.3, duration: 1 }, "<");
  }
}

function initParallax() {
  document.querySelectorAll("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.getAttribute("data-parallax"));
    gsap.to(el, { y: 100 * speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });
}

async function updateDiscordStatus() {
  const footerStack = document.getElementById("discord-activity-stack");
  const mobileStack = document.getElementById("mobile-activity-stack");
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/778891636149026817`);
    const data = await response.json();
    if (!data.success) return;
    const activities = data.data.activities.filter(a => a.type !== 4);
    if (activities.length === 0) {
      const idleHTML = `<div class="idle-pill-minimal"><div class="status-dot-wrap"><div class="status-dot ${data.data.discord_status}"></div></div><div class="idle-info"><span class="idle-label">SYSTEM ${data.data.discord_status.toUpperCase()}</span><span class="idle-desc">Ready for new challenges</span></div></div>`;
      if (footerStack) footerStack.innerHTML = idleHTML;
      if (mobileStack) mobileStack.innerHTML = idleHTML;
      return;
    }
    let newHTML = '';
    activities.forEach(activity => {
      if (activity.name === 'Spotify') {
        newHTML += `<div class="spotify-pill"><div class="spotify-vinyl"><img src="${activity.assets.large_image.replace('spotify:', 'https://i.scdn.co/image/')}" alt="Album Art" class="vinyl-img"></div><div class="spotify-pill-info"><span class="spotify-pill-track">${activity.details}</span><span class="spotify-pill-artist">${activity.state}</span></div></div>`;
      } else {
        const imageUrl = activity.assets?.large_image ? (activity.assets.large_image.startsWith('mp:external') ? `https://media.discordapp.net/external/${activity.assets.large_image.split('https/')[1]}` : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`) : null;
        newHTML += `<div class="generic-activity-pill">${imageUrl ? `<div class="generic-activity-icon"><img src="${imageUrl}" alt="Activity"></div>` : ''}<div class="spotify-pill-info"><span class="spotify-pill-track">${activity.name}</span><span class="spotify-pill-artist">${activity.details || ''}</span></div></div>`;
      }
    });
    if (footerStack) footerStack.innerHTML = newHTML;
    if (mobileStack) mobileStack.innerHTML = newHTML;
  } catch (err) { console.warn("Lanyard fetch failed", err); }
}

setInterval(updateDiscordStatus, 10000);
updateDiscordStatus();

window.addEventListener("load", () => {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  requestAnimationFrame(() => { initScrollAnimations(); initParallax(); ScrollTrigger.refresh(); });
});

window.addEventListener("resize", () => { ScrollTrigger.refresh(); });
