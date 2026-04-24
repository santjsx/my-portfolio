import gsap from 'gsap';

const DiscordID = '1284925883240550552';
const API_URL = `https://api.lanyard.rest/v1/users/${DiscordID}`;
const LANYARD_API_KEY = 'bc6ba6a2b964e5c0610729a5c973b1d6'; // Used for KV management/auth

export function initLanyardWidget() {
    const toggleBtn = document.getElementById('lanyard-toggle');
    if (!toggleBtn) return;

    let isAnimating = false;
    let hintShown = false;
    let hintDismissed = false;
    const hintBubble = document.querySelector('.lanyard-hint');

    // Toggle dynamic island expansion with GSAP physics
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAnimating) return;

        const isOpening = !toggleBtn.classList.contains('active');
        isAnimating = true;

        if (isOpening) {
            toggleBtn.classList.add('active');
            if (hintBubble && !hintDismissed) {
                hintDismissed = true;
                gsap.to(hintBubble, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => hintBubble.style.visibility = 'hidden' });
            }
            fetchLanyardData(); // Refresh data
            updatePhoneClock(); // Set live clock

            // Read the CSS-computed target size (respects media queries)
            const computed = getComputedStyle(toggleBtn);
            const targetW = parseFloat(computed.width);
            const targetH = parseFloat(computed.height);
            const targetR = parseFloat(computed.borderRadius) || 44;

            gsap.fromTo(toggleBtn, 
                { height: 68, width: 68, padding: 6, borderRadius: 22 }, 
                { 
                    height: targetH, width: targetW, padding: 0, borderRadius: targetR, 
                    duration: 0.8, ease: "expo.out", 
                    onComplete: () => {
                        gsap.set(toggleBtn, { clearProps: "width,height,padding,borderRadius,inset,top,left,right,bottom,transform" });
                        isAnimating = false;
                    }
                }
            );

            const avatarWrapper = toggleBtn.querySelector('.island-avatar-wrapper');
            const expandedTop = getComputedStyle(toggleBtn).getPropertyValue('--expanded-avatar-top').trim() || "36px";
            const expandedLeft = getComputedStyle(toggleBtn).getPropertyValue('--expanded-avatar-left').trim() || "16px";

            gsap.to(avatarWrapper, {
                top: expandedTop,
                left: expandedLeft,
                width: 32,
                height: 32,
                borderRadius: 10,
                duration: 0.8,
                ease: "expo.out"
            });
        } else {
            const content = toggleBtn.querySelector('.island-content');
            gsap.to(content, { opacity: 0, y: -10, duration: 0.2, ease: "power2.in" });
            
            const avatarWrapper = toggleBtn.querySelector('.island-avatar-wrapper');
            gsap.to(avatarWrapper, {
                top: 6,
                left: 6,
                width: 54,
                height: 54,
                borderRadius: 16,
                duration: 0.5,
                ease: "expo.out",
                clearProps: "all"
            });

            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Measure the target corner position
                toggleBtn.classList.remove('active');
                const targetRect = toggleBtn.getBoundingClientRect();
                toggleBtn.classList.add('active'); // Put it back to animate from center
                
                gsap.to(toggleBtn, {
                    top: targetRect.top,
                    left: targetRect.left,
                    transform: "translate(0, 0)", // Neutralize centering
                    height: 68, 
                    width: 68, 
                    padding: 6,
                    borderRadius: 22, 
                    duration: 0.7, 
                    ease: "expo.inOut", 
                    onComplete: () => {
                        toggleBtn.classList.remove('active');
                        gsap.set(toggleBtn, { clearProps: "all" });
                        gsap.set(content, { clearProps: "all" });
                        isAnimating = false;
                    }
                });
            } else {
                // Standard desktop shrink in place
                gsap.to(toggleBtn, {
                    height: 68, 
                    width: 68, 
                    padding: 6,
                    borderRadius: 22, 
                    duration: 0.5, 
                    ease: "expo.out", 
                    onComplete: () => {
                        toggleBtn.classList.remove('active');
                        gsap.set(toggleBtn, { clearProps: "all" });
                        gsap.set(content, { clearProps: "all" });
                        isAnimating = false;
                    }
                });
            }
        }
    });
    
    // Hint bubble logic: show only after scroll and hide permanently once used
    if (hintBubble) {
        // Hide initially
        gsap.set(hintBubble, { opacity: 0, scale: 0.8, visibility: 'hidden' });

        const showHint = () => {
            if (hintDismissed || hintShown || toggleBtn.classList.contains('active')) return;
            hintShown = true;
            gsap.to(hintBubble, { 
                opacity: 1, 
                scale: 1, 
                visibility: 'visible',
                duration: 0.6, 
                ease: "back.out(1.7)" 
            });
        };

        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                showHint();
            }
        }, { passive: true });

        hintBubble.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!hintDismissed) {
                hintDismissed = true;
                gsap.to(hintBubble, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => hintBubble.style.visibility = 'hidden' });
            }
            if (!toggleBtn.classList.contains('active')) {
                toggleBtn.click();
            }
        });
    }

    // Handle close button specifically
    const closeBtn = document.getElementById('lanyard-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(toggleBtn.classList.contains('active')) toggleBtn.click();
        });
    }

    // Contact button inside the widget
    const contactBtn = document.getElementById('lanyard-contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            if(toggleBtn.classList.contains('active')) toggleBtn.click();
        });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!toggleBtn.contains(e.target) && toggleBtn.classList.contains('active')) {
            toggleBtn.click();
        }
    });

    // Close when scrolling
    window.addEventListener('scroll', () => {
        if (toggleBtn.classList.contains('active') && !isAnimating) {
            toggleBtn.click();
        }
    }, { passive: true });

    // Initial fetch to set color indicator on the floating button
    fetchLanyardData();
    
    // Poll every 30 seconds
    setInterval(fetchLanyardData, 30000);

    // Keep phone clock updated every minute
    updatePhoneClock();
    setInterval(updatePhoneClock, 30000);
}

async function fetchLanyardData() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        
        if (json.success && json.data) {
            updateWidgetUI(json.data);
            updateHeroQuote(json.data.kv);
            updateCustomColors(json.data.kv);
            updateAboutPhoto(json.data.kv);
            updateSkills(json.data.kv);
        }
    } catch (error) {
        console.error('Failed to fetch Lanyard data:', error);
    }
}

function updateWidgetUI(data) {
    const island = document.getElementById('lanyard-toggle');
    const statusText = document.getElementById('lanyard-status-text');
    const activitiesContainer = document.getElementById('lanyard-activities');
    
    let mood = data.kv ? data.kv.mood : null;
    if (mood) mood = mood.replace(/^"|"$/g, '');

    const activities = data.activities || [];
    const isSpotify = data.listening_to_spotify;

    // Determine resolved status
    let status = data.discord_status;
    if (!mood && activities.length === 0 && !isSpotify) {
        status = 'inactive';
    }
    
    // Reset classes
    island.classList.remove('status-online', 'status-idle', 'status-dnd', 'status-offline', 'status-inactive');
    
    // Apply new status
    island.classList.add(`status-${status}`);
    
    if (statusText) {
        const displayStatus = status === 'inactive' ? 'OFFLINE' : status.toUpperCase();
        statusText.innerHTML = mood 
            ? `<span class="status-prefix">CURRENT MOOD:</span> <span class="status-value">${escapeHTML(mood)}</span>` 
            : `<span class="status-prefix">STATUS:</span> <span class="status-value">${displayStatus}</span>`;
    }
    
    // Render activities
    if (activitiesContainer) {
        
        if (activities.length === 0 && !isSpotify) {
            activitiesContainer.innerHTML = `
                <div class="lanyard-offline-message">
                    Currently offline. Engaged in deep work or away from the desk.
                </div>
            `;
            return;
        }
        
        let htmlContent = '';
        
        // Handle Spotify exclusively if active natively
        if (isSpotify && data.spotify) {
             const track = data.spotify;
             htmlContent += `
             <div class="lanyard-activity">
                 <div class="activity-icon-wrapper">
                     <img src="${track.album_art_url}" alt="Album Art" class="activity-icon">
                 </div>
                 <div class="activity-info">
                     <span class="activity-name">${escapeHTML(track.song)}</span>
                     <span class="activity-state">from ${escapeHTML(track.album)}</span>
                     <div class="spotify-eq">
                         <div class="eq-bar"></div>
                         <div class="eq-bar"></div>
                         <div class="eq-bar"></div>
                         <div class="eq-bar"></div>
                     </div>
                 </div>
             </div>
             `;
             // Add divider if there are other activities
             if (activities.length > 0 && !activities.every(a => a.name === "Spotify")) {
                 htmlContent += `<div class="activity-divider"></div>`;
             }
        }

        // Handle other activities
        activities.forEach((act, index) => {
            if (act.name === 'Spotify') return; // Handled above beautifully
            
            const isCustomStatus = act.id === 'custom' || act.type === 4;
            
            if (isCustomStatus) {
                const emoji = act.emoji && act.emoji.name ? act.emoji.name : '💬';
                const text = act.state || 'Just chilling';
                htmlContent += `
                    <div class="activity-custom-status">
                        <span class="activity-custom-emoji">${escapeHTML(emoji)}</span>
                        <span class="activity-custom-text">${escapeHTML(text)}</span>
                    </div>
                `;
            } else {
                // Try to resolve icons for standard activities
                let iconUrl = '';
                if (act.assets && act.assets.large_image) {
                    const appId = act.application_id;
                    const assetId = act.assets.large_image;
                    // Lanyard specific format for discord assets
                    if (assetId.startsWith('mp:external')) {
                        // External assets are complex, fallback to standard or placeholder
                        iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(act.name)}&background=f1f5f9&color=64748b&rounded=true`;
                    } else {
                        iconUrl = `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
                    }
                } else {
                    iconUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(act.name)}&background=f1f5f9&color=64748b&rounded=true`;
                }

                htmlContent += `
                    <div class="lanyard-activity">
                        <div class="activity-icon-wrapper">
                            <img src="${iconUrl}" alt="${escapeHTML(act.name)}" class="activity-icon" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(act.name)}&background=f1f5f9&color=64748b&rounded=true'">
                        </div>
                        <div class="activity-info">
                            <span class="activity-name">${escapeHTML(act.name)}</span>
                            ${act.details ? `<span class="activity-details">${escapeHTML(act.details)}</span>` : ''}
                            ${act.state ? `<span class="activity-state">${escapeHTML(act.state)}</span>` : ''}
                        </div>
                    </div>
                `;
            }
            
            if (index < activities.length - 1 && document.querySelectorAll('.lanyard-activity').length > 0) {
                htmlContent += `<div class="activity-divider"></div>`;
            }
        });
        
        activitiesContainer.innerHTML = htmlContent;
    }
}

/**
 * Updates the custom mood display using Lanyard KV data
 * @param {Object} kv - Key-value pairs from Lanyard
 */
/**
 * Updates the hero section quote using Lanyard KV data
 * @param {Object} kv - Key-value pairs from Lanyard
 */
function updateHeroQuote(kv) {
    const quoteEl = document.getElementById('hero-quote');
    if (!quoteEl) return;

    const newQuote = kv ? kv.hero_quote : null;

    // Only update if we have a new quote and it's different from the fallback/current
    // We check against textContent which strips entities, so we handle both.
    if (newQuote) {
        const escaped = escapeHTML(newQuote);
        const formattedHTML = `&ldquo;${escaped}&rdquo;`;
        
        // Simple check to avoid redundant animations if nothing changed
        // Create a temp div to compare innerHTML if needed, or just compare text
        const temp = document.createElement('div');
        temp.innerHTML = formattedHTML;
        if (quoteEl.textContent === temp.textContent) return;

        if (typeof gsap !== 'undefined') {
            gsap.to(quoteEl, {
                opacity: 0,
                x: 10,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    quoteEl.innerHTML = formattedHTML;
                    gsap.to(quoteEl, {
                        opacity: 0.9,
                        x: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            });
        } else {
            quoteEl.innerHTML = formattedHTML;
        }
    }
}


/**
 * Updates the site's accent colors using Lanyard KV data
 * @param {Object} kv - Key-value pairs from Lanyard
 */
function updateCustomColors(kv) {
    const accentColor = kv ? kv.accent_color : null;
    if (!accentColor) return;

    const root = document.documentElement;
    
    // Simple check to avoid redundant updates
    // We store the last applied color to a property to compare easily
    if (root.dataset.lastAccent === accentColor) return;
    root.dataset.lastAccent = accentColor;

    if (typeof gsap !== 'undefined') {
        // Smoothly transition the primary accent variables
        // We use a proxy object to animate the color string
        const colorTarget = { color: getComputedStyle(root).getPropertyValue('--accent-primary').trim() };
        
        gsap.to(colorTarget, {
            color: accentColor,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
                root.style.setProperty('--accent-primary', colorTarget.color);
                root.style.setProperty('--skill-accent', colorTarget.color);
                root.style.setProperty('--border-hover', `color-mix(in srgb, ${colorTarget.color}, transparent 60%)`);
            }
        });
    } else {
        root.style.setProperty('--accent-primary', accentColor);
        root.style.setProperty('--skill-accent', accentColor);
        root.style.setProperty('--border-hover', `color-mix(in srgb, ${accentColor}, transparent 60%)`);
    }
}

/**
 * Updates the about and widget portraits using Lanyard KV data
 * @param {Object} kv - Key-value pairs from Lanyard
 */
function updateAboutPhoto(kv) {
    const mainImg = document.getElementById('about-image');
    const lanyardImg = document.getElementById('lanyard-avatar-img');
    const imagesToUpdate = [mainImg, lanyardImg].filter(Boolean);
    
    if (imagesToUpdate.length === 0) return;

    const originalSrc = 'images/santhoshh.webp';
    const newSrc = kv ? kv.about_photo_url : null;
    
    // Choose the target source
    const targetSrc = (newSrc && newSrc.trim() !== '') ? newSrc : originalSrc;

    // Use the first available image to check for transition redundancy
    const refImg = imagesToUpdate[0];
    if (refImg.dataset.currentSrc === targetSrc) return;

    // Check if the source is actually different (ignoring path prefixes for local files)
    const currentPath = refImg.src.split('/').pop();
    const targetPath = targetSrc.split('/').pop();
    if (currentPath === targetPath && !targetSrc.startsWith('http')) {
        imagesToUpdate.forEach(img => img.dataset.currentSrc = targetSrc);
        return;
    }

    // Preload to ensure smooth GSAP transition
    const tempImg = new Image();
    tempImg.onload = () => {
        imagesToUpdate.forEach(img => transitionImage(img, targetSrc));
    };
    tempImg.onerror = () => {
        if (targetSrc !== originalSrc) {
            console.warn('Dynamic image failed to load, reverting to default.');
            updateAboutPhoto(null); // Force revert
        }
    };
    tempImg.src = targetSrc;
}

/**
 * Executes the cross-fade animation for the About image
 */
function transitionImage(imgEl, src) {
    if (typeof gsap !== 'undefined') {
        gsap.to(imgEl, {
            opacity: 0,
            scale: 1.05,
            duration: 0.8,
            ease: "power2.in",
            onComplete: () => {
                imgEl.src = src;
                imgEl.dataset.currentSrc = src;
                gsap.to(imgEl, {
                    opacity: 1,
                    scale: 1,
                    duration: 1.2,
                    ease: "power2.out"
                });
            }
        });
    } else {
        imgEl.src = src;
        imgEl.dataset.currentSrc = src;
    }
}

/**
 * Updates the arsenal (skills) section based on Lanyard KV data
 * @param {Object} kv - Key-value pairs from Lanyard
 */
function updateSkills(kv) {
    const listContainer = document.getElementById('arsenal-list');
    if (!listContainer) return;

    const skillsStr = kv ? kv.skills : null;
    const titleHTML = `<h3 class="arsenal-title">THE ARSENAL_</h3>`;
    
    const originalSkillsHTML = `
        <div class="arsenal-row"><span class="arsenal-name">HTML / CSS</span><span class="arsenal-line"></span><span class="arsenal-level">EXPERT</span></div>
        <div class="arsenal-row"><span class="arsenal-name">JAVASCRIPT</span><span class="arsenal-line"></span><span class="arsenal-level">ADVANCED</span></div>
        <div class="arsenal-row"><span class="arsenal-name">REACT.JS</span><span class="arsenal-line"></span><span class="arsenal-level">ADVANCED</span></div>
        <div class="arsenal-row"><span class="arsenal-name">TAILWIND</span><span class="arsenal-line"></span><span class="arsenal-level">EXPERT</span></div>
        <div class="arsenal-row"><span class="arsenal-name">GIT</span><span class="arsenal-line"></span><span class="arsenal-level">PROFICIENT</span></div>
    `;

    let dynamicSkillsHTML = '';

    if (skillsStr && skillsStr.trim() !== '') {
        const items = skillsStr.split(',').map(s => s.trim()).filter(s => s !== '');
        items.forEach(item => {
            const [name, level] = item.split(':').map(part => part.trim());
            if (name) {
                dynamicSkillsHTML += `
                    <div class="arsenal-row">
                        <span class="arsenal-name">${escapeHTML(name)}</span>
                        <span class="arsenal-line"></span>
                        <span class="arsenal-level">${escapeHTML(level || 'PRO')}</span>
                    </div>
                `;
            }
        });
    }

    // Always include original skills, then add dynamic ones
    const targetHTML = originalSkillsHTML + dynamicSkillsHTML;

    // Comparison for redundancy
    const currentRowsRaw = listContainer.innerHTML.replace(titleHTML, '').trim();
    if (currentRowsRaw === targetHTML.trim()) return;

    const oldRows = listContainer.querySelectorAll('.arsenal-row');

    if (typeof gsap !== 'undefined' && oldRows.length > 0) {
        // If we are just adding/subtracting, a full fade-out might be jarring, 
        // but for now, we'll use the cinematic transition logic.
        gsap.to(oldRows, {
            opacity: 0,
            x: -20,
            duration: 0.3,
            stagger: 0.03,
            ease: "power2.in",
            onComplete: () => {
                listContainer.innerHTML = titleHTML + targetHTML;
                const newRows = listContainer.querySelectorAll('.arsenal-row');
                gsap.fromTo(newRows, 
                    { opacity: 0, x: -30 },
                    { 
                        opacity: 1, 
                        x: 0, 
                        duration: 0.5, 
                        stagger: 0.05, 
                        ease: "power2.out"
                    }
                );
            }
        });
    } else {
        listContainer.innerHTML = titleHTML + targetHTML;
    }
}

function updatePhoneClock() {
    const el = document.getElementById('phone-time');
    if (!el) return;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    el.textContent = `${h}:${m}`;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}
