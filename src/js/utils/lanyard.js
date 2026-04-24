import gsap from 'gsap';

const DiscordID = '1284925883240550552';
const API_URL = `https://api.lanyard.rest/v1/users/${DiscordID}`;
const LANYARD_API_KEY = 'bc6ba6a2b964e5c0610729a5c973b1d6'; // Used for KV management/auth
const TMDB_API_KEY = '15511e43224695bd75148dab05bc81fb'; // Add your TMDb API Key here
const LASTFM_API_KEY = 'a403d71a4af1bacfddab789750be1c18';
const LASTFM_USER = 'santhoshh25';
let lastMovieId = null;

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
            // Defer data fetch until after animation for smoothness
            const fetchAfter = () => {
                fetchLanyardData();
                updatePhoneClock();
                // Ensure close button is visible for next time
                const closeBtnEl = toggleBtn.querySelector('.lanyard-close-minimal');
                if (closeBtnEl) gsap.set(closeBtnEl, { clearProps: "all" });
            };

            // Read the CSS-computed target size (respects media queries)
            const computed = getComputedStyle(toggleBtn);
            const targetW = parseFloat(computed.width);
            const targetH = parseFloat(computed.height);
            const targetR = parseFloat(computed.borderRadius) || 44;

            gsap.fromTo(toggleBtn, 
                { height: 68, width: 68, padding: 6, borderRadius: 22 }, 
                { 
                    height: targetH, width: targetW, padding: 0, borderRadius: targetR, 
                    duration: 0.5, ease: "power4.inOut", 
                    force3D: true,
                    onStart: () => toggleBtn.classList.add('lanyard-animating'),
                    onComplete: () => {
                        toggleBtn.classList.remove('lanyard-animating');
                        gsap.set(toggleBtn, { clearProps: "width,height,padding,borderRadius,inset,top,left,right,bottom,transform" });
                        fetchAfter();
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
                duration: 0.6,
                ease: "power4.inOut",
                force3D: true
            });
        } else {
            const content = toggleBtn.querySelector('.island-content');
            const closeBtnEl = toggleBtn.querySelector('.lanyard-close-minimal');
            
            // Instantly hide close button for a cleaner "collapse" start
            if (closeBtnEl) {
                gsap.to(closeBtnEl, { opacity: 0, scale: 0.8, duration: 0.15, ease: "power2.in" });
            }
            
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
                    duration: 0.5, 
                    ease: "power4.inOut", 
                    force3D: true,
                    onStart: () => toggleBtn.classList.add('lanyard-animating'),
                    onComplete: () => {
                        toggleBtn.classList.remove('lanyard-animating');
                        toggleBtn.classList.remove('active');
                        gsap.set(toggleBtn, { clearProps: "all" });
                        gsap.set(content, { clearProps: "all" });
                        const closeBtnEl = toggleBtn.querySelector('.lanyard-close-minimal');
                        if (closeBtnEl) gsap.set(closeBtnEl, { clearProps: "all" });
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
                    ease: "power4.inOut", 
                    force3D: true,
                    onComplete: () => {
                        toggleBtn.classList.remove('active');
                        gsap.set(toggleBtn, { clearProps: "all" });
                        gsap.set(content, { clearProps: "all" });
                        const closeBtnEl = toggleBtn.querySelector('.lanyard-close-minimal');
                        if (closeBtnEl) gsap.set(closeBtnEl, { clearProps: "all" });
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

    // Realistic Status Bar Dynamics
    initStatusBarDynamics();
}

async function fetchLanyardData() {
    try {
        // Fetch Lanyard and Last.fm concurrently for maximum performance
        const [lanyardRes, lastfmRes] = await Promise.all([
            fetch(API_URL),
            fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`)
        ]);

        const lanyardJson = await lanyardRes.json();
        const lastfmJson = await lastfmRes.json();
        
        if (lanyardJson.success && lanyardJson.data) {
            // Check Last.fm for Now Playing
            let lastfmTrack = null;
            if (lastfmJson && lastfmJson.recenttracks && lastfmJson.recenttracks.track) {
                const track = Array.isArray(lastfmJson.recenttracks.track) ? lastfmJson.recenttracks.track[0] : lastfmJson.recenttracks.track;
                if (track && track['@attr'] && track['@attr'].nowplaying === 'true') {
                    lastfmTrack = {
                        song: track.name,
                        artist: track.artist['#text'] || track.artist.name,
                        album: track.album['#text'],
                        album_art_url: track.image ? track.image[track.image.length - 1]['#text'] : null
                    };
                }
            }

            updateWidgetUI(lanyardJson.data, lastfmTrack);
            updateHeroQuote(lanyardJson.data.kv);
            updateCustomColors(lanyardJson.data.kv);
            updateAboutPhoto(lanyardJson.data.kv);
            updateSkills(lanyardJson.data.kv);
        }
    } catch (error) {
        console.error('Failed to sync Lanyard/Last.fm:', error);
    }
}

function updateWidgetUI(data, lastfmTrack) {
    const island = document.getElementById('lanyard-toggle');
    const statusText = document.getElementById('lanyard-status-text');
    const activitiesContainer = document.getElementById('lanyard-activities');
    const watchingSection = document.getElementById('lanyard-watching');
    const watchingContent = document.getElementById('watching-content');
    
    let mood = data.kv ? data.kv.mood : null;
    if (mood) mood = mood.replace(/^"|"$/g, '');

    const activities = data.activities || [];
    const isSpotify = data.listening_to_spotify;
    const hasLiveMusic = isSpotify || !!lastfmTrack;

    // Determine resolved status
    let status = data.discord_status;
    const kvTMDBId = data.kv ? data.kv.tmdb_id : null;
    const kvTMDBTitle = data.kv ? data.kv.tmdb_title : null;

    if (!mood && activities.length === 0 && !hasLiveMusic && !kvTMDBId && !kvTMDBTitle) {
        status = 'inactive';
    }
    
    // Handle Watching integration (Manual KV trigger only)
    if (watchingSection && watchingContent) {
        if (kvTMDBId || kvTMDBTitle) {
            handleWatchingIntegration(kvTMDBId || kvTMDBTitle, watchingSection, watchingContent);
        } else {
            watchingSection.style.display = 'none';
            lastMovieId = null;
        }
    }

    // My Vibe Module (Favorites, Watchlist & Music)
    handleVibeIntegration();
    
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
        
        if (activities.length === 0 && !hasLiveMusic) {
            activitiesContainer.innerHTML = `
                <div class="lanyard-offline-message">
                    Currently offline. Engaged in deep work or away from the desk.
                </div>
            `;
            return;
        }
        
        let htmlContent = '';
        
        // Handle Spotify/Last.fm Music
        if (hasLiveMusic) {
             const track = isSpotify ? data.spotify : lastfmTrack;
             const albumArt = track.album_art_url || 'https://www.transparenttextures.com/patterns/carbon-fibre.png';
             
             htmlContent += `
             <div class="lanyard-activity music-active">
                 <div class="activity-icon-wrapper">
                     <img src="${albumArt}" alt="Album Art" class="activity-icon">
                 </div>
                 <div class="activity-info">
                     <span class="activity-name">${escapeHTML(track.song || track.name)}</span>
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

async function handleWatchingIntegration(query, section, content) {
    if (!query || query === lastMovieId) return;
    
    // If query looks like an ID, it's an ID. Otherwise, it's a title.
    const isId = /^\d+$/.test(query);
    
    // If no API key, we can't do much but show the text
    if (!TMDB_API_KEY) {
        section.style.display = 'block';
        content.innerHTML = `
            <div class="movie-card">
                <div class="movie-info">
                    <span class="movie-title">${escapeHTML(query)}</span>
                    <span class="movie-meta">TMDb API Key Required</span>
                </div>
            </div>
        `;
        return;
    }

    try {
        let movieData = null;
        
        if (isId) {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${query}?api_key=${TMDB_API_KEY}`);
            movieData = await res.json();
            // If movie not found, try TV
            if (movieData.status_code === 34) {
                const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${query}?api_key=${TMDB_API_KEY}`);
                movieData = await tvRes.json();
            }
        } else {
            // Search by title
            const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
            const searchResults = await res.json();
            if (searchResults.results && searchResults.results.length > 0) {
                movieData = searchResults.results[0];
            }
        }

        if (movieData && !movieData.status_message) {
            lastMovieId = query;
            section.style.display = 'block';
            
            const title = movieData.title || movieData.name;
            const year = (movieData.release_date || movieData.first_air_date || '').split('-')[0];
            const poster = movieData.poster_path ? `https://image.tmdb.org/t/p/w200${movieData.poster_path}` : 'https://via.placeholder.com/60x90?text=No+Poster';
            const rating = movieData.vote_average ? `★ ${movieData.vote_average.toFixed(1)}` : '';

            content.innerHTML = `
                <div class="movie-card">
                    <div class="movie-poster-wrapper">
                        <img src="${poster}" alt="${escapeHTML(title)}" class="movie-poster">
                    </div>
                    <div class="movie-info">
                        <span class="movie-title">${escapeHTML(title)}</span>
                        <div class="movie-meta">
                            <span>${year}</span>
                            ${rating ? `<span style="margin-left: 8px; color: #ffca28;">${rating}</span>` : ''}
                        </div>
                        <p class="movie-overview">${escapeHTML(movieData.overview || '')}</p>
                    </div>
                </div>
            `;
        } else {
            section.style.display = 'none';
        }
    } catch (err) {
        console.error('TMDb Fetch Error:', err);
        section.style.display = 'none';
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

/**
 * Realistic Status Bar Dynamics: Battery, Signal, Charging
 */
let batteryState = {
    percent: Math.floor(Math.random() * (98 - 65 + 1)) + 65,
    isCharging: Math.random() > 0.8 // 20% chance of charging
};

function initStatusBarDynamics() {
    updateStatusBarUI();
    
    // Periodically jitter signal bars (4 to 5 bars)
    setInterval(() => {
        const signalContainer = document.getElementById('phone-signal');
        if (signalContainer) {
            const level = Math.random() > 0.1 ? 4 : 3;
            signalContainer.className = `signal-bars signal-${level}`;
        }
    }, 8000);

    // Slowly drain battery or stay static
    setInterval(() => {
        if (batteryState.isCharging) {
            if (batteryState.percent < 100) batteryState.percent++;
        } else {
            // Very slow drain
            if (Math.random() > 0.95 && batteryState.percent > 5) {
                batteryState.percent--;
            }
        }
        updateStatusBarUI();
    }, 60000); // Check every minute
}

function updateStatusBarUI() {
    const percentEl = document.getElementById('battery-percent');
    const levelEl = document.getElementById('battery-level');
    const chargingIcon = document.getElementById('charging-icon');

    if (percentEl) percentEl.textContent = `${batteryState.percent}%`;
    if (levelEl) {
        levelEl.style.width = `${batteryState.percent}%`;
        levelEl.classList.toggle('low', batteryState.percent <= 20);
        levelEl.classList.toggle('charging', batteryState.isCharging);
    }
    if (chargingIcon) {
        chargingIcon.style.display = batteryState.isCharging ? 'block' : 'none';
    }
}

/**
 * My Vibe Module: Cinema & Audio Hub
 */
let vibeDataLoaded = false;

async function handleVibeIntegration() {
    initCinemaTabs();
    if (vibeDataLoaded) return; 
    
    const vibeSection = document.getElementById('lanyard-vibe');
    const musicList = document.getElementById('curated-music-list');
    
    // Page-specific elements
    const fullFavsReel = document.getElementById('favorites-reel-full');
    const fullWatchlistGrid = document.getElementById('watchlist-grid');
    const fullSeriesFavGrid = document.getElementById('series-fav-grid');
    const fullSeriesWatchlistGrid = document.getElementById('series-watchlist-grid');
    
    if (!TMDB_API_KEY) return;
    if (!vibeSection && !fullFavsReel && !fullWatchlistGrid && !fullSeriesFavGrid && !fullSeriesWatchlistGrid) return;

    // ── CACHE CONSTANTS ──
    const CACHE_KEY_PREFIX = 'tmdb_list_';
    const CACHE_TTL = 15 * 60 * 1000; // 15 Minutes

    const getCache = (id) => {
        const cached = sessionStorage.getItem(CACHE_KEY_PREFIX + id);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL) return null;
        return data;
    };

    const setCache = (id, data) => {
        sessionStorage.setItem(CACHE_KEY_PREFIX + id, JSON.stringify({ data, timestamp: Date.now() }));
    };

    const injectSkeletons = (container) => {
        if (!container) return;
        container.innerHTML = Array(12).fill(0).map(() => `
            <div class="fav-movie-card-full">
                <div class="fav-poster-wrapper-full skeleton skeleton-card"></div>
                <div class="skeleton skeleton-text" style="width: 70%"></div>
            </div>
        `).join('');
    };

    try {
        const lists = [
            { id: '8647764', container: fullFavsReel },
            { id: '8647767', container: fullWatchlistGrid },
            { id: '8647783', container: fullSeriesFavGrid },
            { id: '8647784', container: fullSeriesWatchlistGrid }
        ];

        // 1. Show Skeletons Immediately
        lists.forEach(list => injectSkeletons(list.container));

        await Promise.all(lists.map(async (list) => {
            if (!list.container) return;
            
            try {
                // Check Cache First
                let allItems = getCache(list.id);
                
                if (!allItems) {
                    allItems = [];
                    let currentPage = 1;
                    
                    do {
                        const res = await fetch(`https://api.themoviedb.org/3/list/${list.id}?api_key=${TMDB_API_KEY}&page=${currentPage}`);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const data = await res.json();
                        const items = data.items || data.results || [];
                        allItems = [...allItems, ...items];
                        
                        if (data.item_count > allItems.length && items.length > 0) {
                            currentPage++;
                        } else {
                            break;
                        }
                    } while (currentPage <= 5);

                    // Sort items: Oldest First
                    allItems.sort((a, b) => {
                        const dateA = a.release_date || a.first_air_date || '9999-99-99';
                        const dateB = b.release_date || b.first_air_date || '9999-99-99';
                        return dateA.localeCompare(dateB);
                    });

                    setCache(list.id, allItems);
                }

                if (allItems.length > 0) {
                    list.container.innerHTML = allItems.map(item => {
                        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '';
                        const rating = (item.vote_average && item.vote_average > 0) ? item.vote_average.toFixed(1) : null;
                        const ratingHTML = rating ? `<div class="fav-rating-badge">★ ${rating}</div>` : '';
                        const title = item.title || item.name || 'Untitled'; 
                        
                        return `
                            <div class="fav-movie-card-full">
                                <div class="fav-poster-wrapper-full">
                                    <img src="${poster}" alt="${escapeHTML(title)}" class="fav-poster-full" loading="lazy" decoding="async" onload="this.classList.add('loaded')">
                                    ${ratingHTML}
                                </div>
                                <div class="fav-info-full">
                                    <h3 class="fav-title-full">${escapeHTML(title)}</h3>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    list.container.innerHTML = '<div class="reel-loading">NO ITEMS FOUND</div>';
                }
            } catch (err) {
                console.error(`Failed to fetch list ${list.id}:`, err);
                list.container.innerHTML = '<div class="reel-loading">FAILED TO LOAD</div>';
            }
        }));

        if (vibeSection) vibeSection.style.display = 'block';
        vibeDataLoaded = true;
    } catch (err) {
        console.error('Vibe Fetch Error:', err);
    }
}

function initCinemaTabs() {
    const tabs = document.querySelectorAll('.archive-tab');
    const panels = document.querySelectorAll('.archive-panel');
    
    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Update Active Tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update Panels
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `panel-${target}`) {
                    panel.classList.add('active');
                }
            });
        });
    });
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
