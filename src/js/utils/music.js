/**
 * THE MEDIA LOG 3.0 — The Vector Grid
 * A high-speed icon-driven catalog of sonic and cinematic rotations.
 */

const LASTFM_API_KEY = 'a403d71a4af1bacfddab789750be1c18';
const LASTFM_USER = 'santhoshh25';
const FETCH_LIMIT = 30;

const ICONS = {
    music: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>`,
    movie: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M3 7h4" /><path d="M3 12h4" /><path d="M3 17h4" /><path d="M17 7h4" /><path d="M17 12h4" /><path d="M17 17h4" /></svg>`
};

/**
 * Initializes the media log.
 */
export function initMusicHistory() {
    const listContainer = document.getElementById('track-list');
    if (!listContainer) return;

    fetchMediaLog();
    // Refresh every 5 minutes (lower frequency for static-ish grid)
    setInterval(fetchMediaLog, 300000);
}

/**
 * Orchestrates fetching from media sources.
 */
async function fetchMediaLog() {
    try {
        // Parallel fetch for speed
        const [recentData, topData] = await Promise.all([
            fetchNowPlaying(),
            fetchTopTracks()
        ]);

        const mergedTracks = mergeMusicLogs(recentData, topData);
        renderMediaLog(mergedTracks);
    } catch (error) {
        console.error('Media log sync failed:', error);
    }
}

/**
 * Fetches the most recent track to check for Live status.
 */
async function fetchNowPlaying() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.recenttracks.track[0] || null;
}

/**
 * Fetches top tracks from a specified period (overall).
 */
async function fetchTopTracks() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=${FETCH_LIMIT}&period=overall`;
    const response = await fetch(url);
    const data = await response.json();
    return data.toptracks.track || [];
}

/**
 * Merges Now Playing status with Top 30 list, avoiding duplicates.
 */
function mergeMusicLogs(nowPlaying, topTracks) {
    const isLive = nowPlaying && nowPlaying['@attr'] && nowPlaying['@attr'].nowplaying === 'true';
    
    if (!isLive) return topTracks.map(t => ({ ...t, isLive: false }));

    // If live, clean the top list of the live track if it exists there to avoid doubles
    const filteredTop = topTracks.filter(t => 
        !(t.name.toLowerCase() === nowPlaying.name.toLowerCase() && 
          t.artist.name.toLowerCase() === nowPlaying.artist['#text'].toLowerCase())
    );

    // Standardize nowPlaying to match topTrack schema for easier rendering
    const standardizedLive = {
        name: nowPlaying.name,
        artist: { name: nowPlaying.artist['#text'] },
        album: nowPlaying.album['#text'],
        isLive: true
    };

    return [standardizedLive, ...filteredTop].slice(0, 31);
}

/**
 * Renders the unified media log into a vector grid.
 */
function renderMediaLog(tracks) {
    const listContainer = document.getElementById('track-list');
    
    let htmlContent = `<div class="media-log-grid">`;

    tracks.forEach((track) => {
        const name = track.name;
        const artist = track.artist.name;
        const album = track.album || 'COLLECTION';
        const isNowPlaying = track.isLive;
        const playCount = track.playcount;
        
        const metaText = isNowPlaying 
            ? '<span class="live-tag">LIVE</span>' 
            : `<span class="play-count">${playCount} PLAYS</span>`;
        
        htmlContent += `
            <div class="media-card ${isNowPlaying ? 'is-live' : ''}">
                <div class="card-icon-header">
                    ${ICONS.music}
                </div>
                <div class="card-details">
                    <h4 class="card-title">${escapeHTML(name)}</h4>
                    <p class="card-creator">by ${escapeHTML(artist)}</p>
                    
                    <div class="card-meta-box">
                        <div class="card-meta-item">
                            <span class="card-meta-label">STATUS:</span>
                            ${metaText}
                        </div>
                        <div class="card-meta-item">
                            <span class="card-meta-label">SOURCE:</span>
                            ${escapeHTML(album)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    htmlContent += '</div>';

    // Hash check for efficient updating
    const currentHash = btoa(unescape(encodeURIComponent(htmlContent))).slice(0, 32);
    if (listContainer.dataset.lastHash === currentHash) return;
    listContainer.dataset.lastHash = currentHash;

    listContainer.innerHTML = htmlContent;

    // Grid Entrance
    const cards = listContainer.querySelectorAll('.media-card');
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(cards, 
            { opacity: 0, y: 30, scale: 0.98 }, 
            { 
                opacity: 1, 
                y: 0, 
                scale: 1, 
                duration: 0.6, 
                stagger: 0.03, 
                ease: "power2.out",
                clearProps: "all"
            }
        );
    }
}

/**
 * Formats the Last.fm date string into a clean uppercase log format.
 */
function formatDate(dateStr) {
    if (!dateStr) return 'STATION_ID';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'NOW';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

/**
 * Sanitizes HTML.
 */
function escapeHTML(str) {
    if (!str) return "";
    const p = document.createElement("p");
    p.textContent = str;
    return p.innerHTML;
}
