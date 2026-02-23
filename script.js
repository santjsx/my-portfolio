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
  mobileThemeIcon.className = 'ri-sun-line';
  mobileThemeToggle.innerHTML = '<i class="ri-sun-line"></i> Theme';
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
  // Fallback for browsers that don't support View Transitions API
  if (!document.startViewTransition) {
    executeThemeSwitch();
    return;
  }

  // Get the click position, or fallback to center of screen
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
    // Close menu after toggling on mobile
    if (typeof toggleMobileMenu === 'function' && isMenuOpen) {
      toggleMobileMenu();
    }
  });
}

/* Navigation Styles */
const nav = document.getElementById("main-nav");
const navToggle = document.getElementById("nav-toggle");
const mobileOverlay = document.getElementById("mobile-nav-overlay");
const mobileLinks = document.querySelectorAll(".mobile-link span");
const mobileStatusSection = document.querySelector(".mobile-status-section");
const mobileFooter = document.querySelector(".mobile-nav-footer");

let isMenuOpen = false;

// Create GSAP Timeline for the Menu
const menuTl = gsap.timeline({ paused: true });

menuTl
  .to(mobileOverlay, {
    autoAlpha: 1, // Handles visibility and opacity
    duration: 0.4,
    ease: "power2.inOut"
  })
  .to(mobileLinks, {
    y: "0%",
    duration: 0.8,
    stagger: 0.1,
    ease: "power4.out"
  }, "-=0.2")
  .to(mobileStatusSection, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.4")
  .to(mobileFooter, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.4");

// Navbar background on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 60) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

function toggleMobileMenu() {
  if (isMenuOpen) {
    // Close
    menuTl.reverse();
    navToggle.classList.remove("active");
    gsap.to(navToggle, { scale: 1, duration: 0.4, ease: "power2.out" });
    document.body.style.overflow = "";
    isMenuOpen = false;
  } else {
    // Open
    menuTl.play();
    navToggle.classList.add("active");
    gsap.fromTo(navToggle,
      { scale: 0.9 },
      { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
    );
    document.body.style.overflow = "hidden";
    isMenuOpen = true;
  }
}

// Mobile menu toggle click
navToggle.addEventListener("click", toggleMobileMenu);

// Close mobile menu on link click
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (isMenuOpen) toggleMobileMenu();
  });
});

// Smooth scroll to section via Lenis on nav link clicks
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      lenis.scrollTo(target, {
        offset: -80,
        duration: 1.4,
      });
    }
  });
});

/* GSAP Animations */

// Fade-in-up entrance for all .anim-fade-up elements
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll(".anim-fade-up");

  fadeElements.forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        end: "top 20%",
        toggleActions: "play none none none",
      },
      delay: el.closest(".hero") ? i * 0.12 : 0.05,
    });
  });
}

// Parallax effect on elements with data-parallax
function initParallax() {
  const parallaxElements = document.querySelectorAll("[data-parallax]");

  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;

    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    });
  });
}


/* Local Time */
function updateLocalTime() {
  const timeEl = document.getElementById("local-time");
  if (!timeEl) return;

  const now = new Date();
  // Formatting explicitly for India Standard Time as per user location logic/portfolio
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  };

  const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
  timeEl.textContent = timeString;
}

// Update time every second
setInterval(updateLocalTime, 1000);
updateLocalTime(); // Initial call

/* Live Spotify Status (Lanyard API) */
const DISCORD_ID = "1284925883240550552";

async function updateDiscordStatus() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}?t=${Date.now()}`);
    const resData = await response.json();

    if (!resData.success) return;

    const data = resData.data;
    const activities = data.activities || [];
    const footerStack = document.getElementById('discord-activity-stack');
    const mobileStack = document.getElementById('mobile-activity-stack');

    if (!footerStack && !mobileStack) return;

    const genericActivities = activities.filter(a => a.type === 0 && a.name !== "Spotify" && a.id !== "custom");

    // Always prefer the dedicated data.spotify object from Lanyard if available
    const spotifyData = data.spotify;

    let newHTML = '';

    // 1. Spotify Pill Generation
    if (spotifyData && spotifyData.album_art_url) {
      newHTML += `
          <a href="https://open.spotify.com/track/${spotifyData.track_id}" target="_blank" class="spotify-pill">
            <div class="spotify-vinyl">
              <img src="${spotifyData.album_art_url}" class="spotify-cover" alt="Album Art">
              <div class="vinyl-hole"></div>
            </div>
            <div class="spotify-pill-info">
              <span class="spotify-pill-track">${spotifyData.song}</span>
              <div class="spotify-pill-bottom">
                <span class="spotify-pill-artist">${spotifyData.artist}</span>
                <div class="spotify-equalizer">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <div class="spotify-pill-brand">
              <i class="ri-spotify-fill"></i>
            </div>
          </a>
        `;
    } else if (genericActivities.length === 0) {
      // 2. No Spotify, No Activities -> Technical Standby Fallback
      const status = data.discord_status || 'offline';
      const onDesktop = data.active_on_discord_desktop;
      const onMobile = data.active_on_discord_mobile;

      let statusLabel = "STANDBY";
      if (status === "online") {
        statusLabel = onDesktop ? "ONLINE" : (onMobile ? "MOBILE" : "ONLINE");
      } else if (status === "dnd") {
        statusLabel = "BUSY";
      } else if (status === "idle") {
        statusLabel = "IDLE";
      } else {
        statusLabel = "OFFLINE";
      }

      newHTML += `
        <div class="idle-pill-minimal">
          <div class="status-indicator">
            <div class="status-pulse ${status}"></div>
          </div>
          <div class="status-text">
            <span class="status-label">${statusLabel}</span>
          </div>
        </div>
      `;
    }

    // 2. Generic Activities (VS Code, etc)
    genericActivities.forEach(activity => {
      let imageUrl = '';
      if (activity.assets && activity.assets.large_image) {
        if (activity.assets.large_image.startsWith('mp:external/')) {
          imageUrl = activity.assets.large_image.replace('mp:external/', 'https://media.discordapp.net/external/');
        } else {
          imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
        }
      }

      const details = activity.details || activity.state || 'Active';

      newHTML += `
        <div class="spotify-pill generic-activity-pill">
          ${imageUrl ? `<div class="generic-activity-icon"><img src="${imageUrl}" alt="${activity.name}"></div>` : ''}
          <div class="spotify-pill-info">
            <span class="spotify-pill-track">${activity.name}</span>
            <div class="spotify-pill-bottom">
              <span class="spotify-pill-artist">${details}</span>
            </div>
          </div>
        </div>
      `;
    });

    if (footerStack) footerStack.innerHTML = newHTML;
    if (mobileStack) mobileStack.innerHTML = newHTML;

  } catch (error) {
    console.warn("Could not fetch Discord status from Lanyard:", error);
  }
}

// Check Discord status every 10 seconds
setInterval(updateDiscordStatus, 10000);
updateDiscordStatus(); // Initial call

/* Init */
window.addEventListener("load", () => {
  // Force scroll to top on reload
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  // Give CSS a moment to set initial states
  requestAnimationFrame(() => {
    initScrollAnimations();
    initParallax();

    // Refresh ScrollTrigger after everything is loaded
    ScrollTrigger.refresh();
  });
});

// Refresh ScrollTrigger on resize
window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});
