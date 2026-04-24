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
        // 1. Fetch Top Tracks (The 30 most played)
        const topUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=${FETCH_LIMIT}&period=overall`;
        const topRes = await fetch(topUrl);
        const topData = await topRes.json();
        const topTracks = topData.toptracks.track || [];

        // 2. Fetch Now Playing (To check for Live status)
        const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        const recentRes = await fetch(recentUrl);
        const recentData = await recentRes.json();
        const nowPlaying = recentData.recenttracks.track[0] || null;
        const isLive = nowPlaying && nowPlaying['@attr'] && nowPlaying['@attr'].nowplaying === 'true';

        // 3. Parallel fetch for Album Info (Last.fm toptracks doesn't include albums)
        // We limit this to Top 15 for performance, or fetch all if really needed.
        // Let's try to get albums for all 30.
        const tracksWithAlbums = await Promise.all(topTracks.map(async (track) => {
            try {
                const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(track.artist.name)}&track=${encodeURIComponent(track.name)}&user=${LASTFM_USER}&format=json`;
                const infoRes = await fetch(infoUrl);
                const infoData = await infoRes.json();
                return {
                    name: track.name,
                    artist: { name: track.artist.name },
                    album: (infoData.track && infoData.track.album) ? infoData.track.album.title : extractAlbumFromTitle(track.name),
                    playcount: track.playcount,
                    isLive: false
                };
            } catch (e) {
                return { ...track, album: extractAlbumFromTitle(track.name), isLive: false };
            }
        }));

        // 4. Handle Live Track (Inject at the top if active)
        let finalTracks = tracksWithAlbums;
        if (isLive) {
            const liveTrack = {
                name: nowPlaying.name,
                artist: { name: nowPlaying.artist['#text'] },
                album: nowPlaying.album['#text'] || 'NOW PLAYING',
                isLive: true,
                playcount: 'LIVE'
            };
            // Remove duplicates of the live track from the top list
            finalTracks = [liveTrack, ...tracksWithAlbums.filter(t => 
                !(t.name.toLowerCase() === nowPlaying.name.toLowerCase() && 
                  t.artist.name.toLowerCase() === nowPlaying.artist['#text'].toLowerCase())
            )].slice(0, 30);
        }

        renderMediaLog(finalTracks);
    } catch (error) {
        console.error('Media log sync failed:', error);
    }
}

/**
 * Renders the unified media log into a vector grid.
 */
function renderMediaLog(tracks) {
    const listContainer = document.getElementById('track-list');
    
    let htmlContent = `
        <div class="spotify-playlist">
            <div class="playlist-header">
                <span class="col-index">#</span>
                <span class="col-title">TITLE</span>
                <span class="col-album">ALBUM</span>
                <span class="col-plays">PLAYS</span>
            </div>
            <div class="playlist-rows">
    `;

    tracks.forEach((track, index) => {
        const name = track.name;
        const artist = track.artist.name;
        const album = track.album || 'COLLECTION';
        const isNowPlaying = track.isLive;
        const playCount = track.playcount || '-';
        
        const indexContent = isNowPlaying 
            ? '<div class="live-eq"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></div>' 
            : (index + 1);
        
        htmlContent += `
            <div class="track-row ${isNowPlaying ? 'is-live' : ''}">
                <div class="track-col col-index">${indexContent}</div>
                <div class="track-col col-title">
                    <div class="track-info">
                        <span class="track-name">${escapeHTML(name)}</span>
                        <span class="track-artist">${escapeHTML(artist)}</span>
                    </div>
                </div>
                <div class="track-col col-album">${escapeHTML(album)}</div>
                <div class="track-col col-plays">
                    ${isNowPlaying ? '<span class="live-tag">LIVE</span>' : playCount}
                </div>
            </div>
        `;
    });

    htmlContent += `
            </div>
        </div>
    `;

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
function extractAlbumFromTitle(title) {
    if (!title) return '—';
    // Improved regex to handle "(From Movie)", "- From Movie", "from Movie", etc.
    const fromMatch = title.match(/(?:From|from|Movie)\s+["']?([^"'\)]+)["']?/i);
    if (fromMatch && fromMatch[1]) {
        return fromMatch[1].trim().toUpperCase();
    }
    return '—';
}

function escapeHTML(str) {
    if (!str) return "";
    const p = document.createElement("p");
    p.textContent = str;
    return p.innerHTML;
}
