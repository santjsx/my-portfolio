import gsap from 'gsap';

const LASTFM_API_KEY = 'a403d71a4af1bacfddab789750be1c18';
const LASTFM_USER = 'santhoshh25';
const FETCH_LIMIT = 30;

/**
 * Initializes the music history (Recently Played) section.
 */
export function initMusicHistory() {
    const listContainer = document.getElementById('track-list');
    if (!listContainer) return;

    fetchRecentTracks();
    
    // Refresh every 2 minutes
    setInterval(fetchRecentTracks, 120000);
}

/**
 * Fetches recent tracks from Last.fm API.
 */
async function fetchRecentTracks() {
    const listContainer = document.getElementById('track-list');
    if (!listContainer) return;

    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=${FETCH_LIMIT}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.recenttracks && data.recenttracks.track) {
            const tracks = data.recenttracks.track;
            renderTracks(tracks);
        }
    } catch (error) {
        console.error('Failed to fetch Last.fm tracks:', error);
        listContainer.innerHTML = '<div class="frequency-loading">System Link Interrupted: Unable to fetch pulse.</div>';
    }
}

/**
 * Renders the track list into the container with GSAP animations.
 */
function renderTracks(tracks) {
    const listContainer = document.getElementById('track-list');
    
    // Convert to array if only one track is returned (Edge case)
    const trackList = Array.isArray(tracks) ? tracks : [tracks];
    
    let htmlContent = '';
    
    trackList.forEach(track => {
        const name = track.name;
        const artist = track.artist['#text'];
        const isNowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
        const dateText = isNowPlaying ? 'Now Playing' : formatDate(track.date ? track.date['#text'] : null);
        
        htmlContent += `
            <div class="track-row ${isNowPlaying ? 'is-now-playing' : ''}">
                <div class="track-info">
                    <span class="track-name">${escapeHTML(name)}</span>
                    <span class="track-artist">by ${escapeHTML(artist)}</span>
                </div>
                <div class="track-meta">
                    ${dateText}
                </div>
            </div>
        `;
    });

    // We check if content changed to avoid redundant re-renders
    if (listContainer.innerHTML === htmlContent) return;

    listContainer.innerHTML = htmlContent;

    // Cinematic Entrance Stagger
    const rows = listContainer.querySelectorAll('.track-row');
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(rows, 
            { opacity: 0, x: -20, filter: "blur(5px)" }, 
            { 
                opacity: 1, 
                x: 0, 
                filter: "blur(0px)",
                duration: 0.8, 
                stagger: 0.08, 
                ease: "power2.out",
                clearProps: "all"
            }
        );
    }
}

/**
 * Formats the Last.fm date string into a relative time.
 */
function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

/**
 * Escapes HTML to prevent XSS.
 */
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
