import gsap from 'gsap';

/**
 * THE MUSIC ARCHIVE 4.0 — High-Performance Sonic Catalog
 * Optimized with session caching and shimmering skeleton loaders.
 */

const LASTFM_API_KEY = 'a403d71a4af1bacfddab789750be1c18';
const LASTFM_USER = 'santhoshh25';
const FETCH_LIMIT = 30;

const CACHE_KEY = 'lastfm_top_tracks_v5';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Initializes the music history.
 */
export function initMusicHistory() {
    const tracksContainer = document.getElementById('track-list');
    if (!tracksContainer) return;

    fetchMediaLog();
}

/**
 * Orchestrates fetching with caching and skeleton states.
 */
async function fetchMediaLog() {
    const tracksContainer = document.getElementById('track-list');
    if (!tracksContainer) return;

    try {
        // 1. Show Skeletons Immediately
        injectSkeletons(tracksContainer);

        // 2. Check Cache
        let finalTracks = getCache();

        if (!finalTracks) {
            // Fetch Top Tracks
            const topUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=${FETCH_LIMIT}&period=7day`;
            const topRes = await fetch(topUrl);
            const topData = await topRes.json();
            console.log('🎵 TOP TRACKS RESPONSE:', topData);

            // Check for Now Playing (Isolated)
            let isLive = false;
            let nowPlaying = null;
            try {
                const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
                const recentRes = await fetch(recentUrl);
                const recentData = await recentRes.json();
                console.log('📻 RECENT TRACKS RESPONSE:', recentData);
                
                nowPlaying = (recentData && recentData.recenttracks && recentData.recenttracks.track) ? 
                             (Array.isArray(recentData.recenttracks.track) ? recentData.recenttracks.track[0] : recentData.recenttracks.track) : null;
                isLive = nowPlaying && nowPlaying['@attr'] && nowPlaying['@attr'].nowplaying === 'true';
            } catch (err) {
                console.warn('Now Playing fetch failed:', err);
            }

            const tracksData = (topData && topData.toptracks && topData.toptracks.track) ? 
                               (Array.isArray(topData.toptracks.track) ? topData.toptracks.track : [topData.toptracks.track]) : [];
            
            finalTracks = tracksData.map((track) => {
                const name = track.name || 'Unknown Track';
                const artist = (track.artist && track.artist.name) ? track.artist.name : (track.artist ? track.artist['#text'] : 'Unknown Artist');
                const albumName = extractAlbumFromTitle(name) || 'COLLECTION';
                
                return {
                    name: name,
                    artist: { name: artist },
                    album: albumName,
                    playcount: track.playcount || '0',
                    isLive: false
                };
            });

            // Inject Live track if active
            if (isLive && nowPlaying) {
                const liveTrack = {
                    name: nowPlaying.name,
                    artist: { name: nowPlaying.artist['#text'] || (nowPlaying.artist ? nowPlaying.artist.name : 'Unknown Artist') },
                    album: (nowPlaying.album && nowPlaying.album['#text']) ? nowPlaying.album['#text'] : 'NOW PLAYING',
                    isLive: true,
                    playcount: 'LIVE'
                };
                finalTracks = [liveTrack, ...finalTracks.filter(t => 
                    !(t.name.toLowerCase() === nowPlaying.name.toLowerCase())
                )].slice(0, FETCH_LIMIT);
            }

            setCache(finalTracks);
        }

        // 3. Render
        renderMusicGrid(tracksContainer, finalTracks);

    } catch (error) {
        console.error('Music Archive Sync Failed:', error);
        tracksContainer.innerHTML = '<div class="frequency-loading">ARCHIVE TEMPORARILY OFFLINE</div>';
    }
}

/**
 * Renders the music data into the grid.
 */
function renderMusicGrid(container, tracks) {
    if (!tracks || tracks.length === 0) {
        container.innerHTML = '<div class="frequency-loading">NO RECENT HISTORY FOUND</div>';
        return;
    }

    let htmlContent = `
        <div class="spotify-playlist fade-up" style="opacity: 0;">
            <div class="playlist-header">
                <span class="col-index">#</span>
                <span class="col-title">TITLE</span>
                <span class="col-album">ALBUM</span>
                <span class="col-plays">PLAYS</span>
            </div>
            <div class="playlist-rows">
    `;

    tracks.forEach((track, index) => {
        const isLive = track.isLive;
        const indexContent = isLive 
            ? '<div class="live-eq"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></div>' 
            : (index + 1);
        
        // Safety checks for rendering
        const trackName = track.name || 'Unknown Track';
        const artistName = (track.artist && track.artist.name) ? track.artist.name : 'Unknown Artist';
        const albumName = track.album || 'COLLECTION';
        
        // Format playcount with commas
        let playcountDisplay = '0';
        if (track.playcount) {
            const count = parseInt(track.playcount, 10);
            playcountDisplay = !isNaN(count) ? count.toLocaleString() : track.playcount;
        }

        htmlContent += `
            <div class="track-row ${isLive ? 'is-live' : ''}">
                <div class="track-col col-index">${indexContent}</div>
                <div class="track-col col-title">
                    <div class="track-info">
                        <span class="track-name">${escapeHTML(trackName)}</span>
                        <span class="track-artist">${escapeHTML(artistName)}</span>
                    </div>
                </div>
                <div class="track-col col-album">${escapeHTML(albumName)}</div>
                <div class="track-col col-plays">
                    ${isLive ? '<span class="live-tag">LIVE</span>' : playcountDisplay}
                </div>
            </div>
        `;
    });

    htmlContent += `</div></div>`;
    container.innerHTML = htmlContent;

    // Trigger Entrance Animation
    gsap.to(container.querySelector('.spotify-playlist'), {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
    });
}

/**
 * Skeleton Loader Injection
 */
function injectSkeletons(container) {
    container.innerHTML = `
        <div class="playlist-container">
            <div class="playlist-header">
                <span class="col-index">#</span>
                <span class="col-title">TITLE</span>
                <span class="col-album">ALBUM</span>
                <span class="col-plays">PLAYS</span>
            </div>
            <div class="playlist-rows">
                ${Array(12).fill(0).map(() => `
                    <div class="skeleton-row">
                        <div class="skeleton" style="height: 16px; width: 20px;"></div>
                        <div class="skeleton" style="height: 16px; width: 100%;"></div>
                        <div class="skeleton" style="height: 16px; width: 100%;"></div>
                        <div class="skeleton" style="height: 16px; width: 40px; justify-self: end;"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Cache Management
 */
function getCache() {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    return (Date.now() - timestamp > CACHE_TTL) ? null : data;
}

function setCache(data) {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

/**
 * Utility: Extract album name from title (e.g. from "Song Name (From Movie Name)")
 */
function extractAlbumFromTitle(title) {
    if (!title) return null;
    const fromMatch = title.match(/(?:From|from|Movie)\s+["']?([^"'\)]+)["']?/i);
    return fromMatch ? fromMatch[1].trim().toUpperCase() : null;
}

/**
 * Utility: Escape HTML
 */
function escapeHTML(str) {
    if (!str) return "";
    const p = document.createElement("p");
    p.textContent = str;
    return p.innerHTML;
}
