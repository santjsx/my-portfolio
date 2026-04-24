import gsap from 'gsap';

/**
 * THE MUSIC ARCHIVE 4.0 — High-Performance Sonic Catalog
 * Optimized with session caching and shimmering skeleton loaders.
 */

const LASTFM_API_KEY = 'a403d71a4af1bacfddab789750be1c18';
const LASTFM_USER = 'santhoshh25';
const FETCH_LIMIT = 30;

const CACHE_KEY = 'music_archive_v6';
const CACHE_TTL = 30 * 60 * 1000; // 30 Minutes

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
            console.log('🔄 ARCHIVE: Cache empty, fetching fresh data');
            // Fetch Top Tracks (All-time for "Most Played")
            const topUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=${FETCH_LIMIT}&period=overall`;
            const topRes = await fetch(topUrl);
            const topData = await topRes.json();
            
            const tracksData = (topData && topData.toptracks && topData.toptracks.track) ? 
                               (Array.isArray(topData.toptracks.track) ? topData.toptracks.track : [topData.toptracks.track]) : [];
            
            // 2. Fetch High-Res Art for ALL tracks in parallel
            const trackPromises = tracksData.map(async (track) => {
                const name = track.name || 'Unknown Track';
                const artistName = (track.artist && track.artist.name) ? track.artist.name : (track.artist ? track.artist['#text'] : 'Unknown Artist');
                const count = track.playcount || '0';
                const albumName = extractAlbumFromTitle(name) || 'COLLECTION';
                
                // Try Last.fm image first
                let albumArt = track.image ? track.image[track.image.length - 1]['#text'] : null;
                
                // Force iTunes search for ALL tracks to ensure 600x600 high-res quality
                if (!albumArt || albumArt === '' || albumArt.includes('default_album_medium')) {
                    albumArt = await fetchiTunesAlbumArt(name, artistName);
                } else if (albumArt.includes('lastfm.freetls.fastly.net')) {
                    // Even if Last.fm has an image, iTunes is usually much higher resolution (600x600 vs Last.fm's small thumbnails)
                    // Let's try to upgrade it
                    const highResArt = await fetchiTunesAlbumArt(name, artistName);
                    if (highResArt) albumArt = highResArt;
                }

                return {
                    name: name,
                    artist: { name: artistName },
                    album: albumName,
                    playcount: count,
                    isLive: false,
                    album_art_url: albumArt
                };
            });

            finalTracks = await Promise.all(trackPromises);

            setCache(finalTracks);
        }

        // 3. Live Detection (Always run, even if list is cached)
        let isLive = false;
        let nowPlaying = null;
        
        try {
            // 1. Primary: Last.fm
            const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=2`;
            const recentRes = await fetch(recentUrl);
            const recentData = await recentRes.json();
            
            const tracks = (recentData && recentData.recenttracks && recentData.recenttracks.track) ? 
                           (Array.isArray(recentData.recenttracks.track) ? recentData.recenttracks.track : [recentData.recenttracks.track]) : [];
            
            nowPlaying = tracks[0] || null;
            isLive = nowPlaying && nowPlaying['@attr'] && nowPlaying['@attr'].nowplaying === 'true';

            // 2. Fallback: Lanyard (Real-time Spotify check)
            if (!isLive) {
                const lanyardRes = await fetch(`https://api.lanyard.rest/v1/users/1284925883240550552`);
                const lanyardData = await lanyardRes.json();
                
                if (lanyardData.success && lanyardData.data.listening_to_spotify && lanyardData.data.spotify) {
                    const spot = lanyardData.data.spotify;
                    isLive = true;
                    nowPlaying = {
                        name: spot.song,
                        artist: { '#text': spot.artist, name: spot.artist },
                        album: { '#text': spot.album },
                        '@attr': { nowplaying: 'true' }
                    };
                }
            }
        } catch (err) {
            console.warn('Now Playing sync failed:', err);
        }

        // Inject Live track if active
        if (isLive && nowPlaying) {
            const liveArtist = nowPlaying.artist['#text'] || (nowPlaying.artist ? nowPlaying.artist.name : 'Unknown Artist');
            let liveAlbumArt = nowPlaying.image ? nowPlaying.image[nowPlaying.image.length - 1]['#text'] : null;
            
            // Fallback to iTunes for Live track if Last.fm fails
            if (!liveAlbumArt || liveAlbumArt === '' || liveAlbumArt.includes('default_album_medium')) {
                liveAlbumArt = await fetchiTunesAlbumArt(nowPlaying.name, liveArtist);
            }

            const liveTrack = {
                name: nowPlaying.name,
                artist: { name: liveArtist },
                album: (nowPlaying.album && nowPlaying.album['#text']) ? nowPlaying.album['#text'] : 'NOW PLAYING',
                isLive: true,
                playcount: 'LIVE',
                album_art_url: liveAlbumArt
            };

            // Remove the same track from the list if it exists and inject at top
            finalTracks = [liveTrack, ...finalTracks.filter(t => 
                !(t.name.toLowerCase() === liveTrack.name.toLowerCase() && 
                  t.artist.name.toLowerCase() === liveTrack.artist.name.toLowerCase())
            )].slice(0, FETCH_LIMIT);
        }

        // 4. Render
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
                <span class="col-art"></span>
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

        const trackArt = track.album_art_url || 'https://www.transparenttextures.com/patterns/carbon-fibre.png';

        htmlContent += `
            <div class="track-row ${isLive ? 'is-live' : ''}">
                <div class="track-col col-index">${indexContent}</div>
                <div class="track-col col-art">
                    <div class="track-art-wrapper">
                        <img src="${trackArt}" alt="Art" class="archive-track-art" loading="lazy">
                    </div>
                </div>
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
                        <div class="skeleton" style="height: 14px; width: 20px; border-radius: 4px;"></div>
                        <div class="skeleton" style="height: 36px; width: 36px; border-radius: 6px;"></div>
                        <div class="skeleton" style="height: 16px; width: 100%; border-radius: 4px;"></div>
                        <div class="skeleton" style="height: 16px; width: 100%; border-radius: 4px;"></div>
                        <div class="skeleton" style="height: 16px; width: 40px; justify-self: end; border-radius: 4px;"></div>
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

/**
 * Fetches high-resolution album art from iTunes Search API with fallback
 */
async function fetchiTunesAlbumArt(song, artist) {
    const cleanSong = song.replace(/\(.*\)|- .*|feat\..*/gi, '').trim();
    const search = async (query) => {
        try {
            const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`);
            const json = await res.json();
            if (json.results && json.results.length > 0) {
                return json.results[0].artworkUrl100.replace(/100x100bb\.jpg|100x100\.jpg|100x100/g, '600x600bb.jpg');
            }
        } catch (e) {
            console.warn('iTunes search failed for query:', query, e);
        }
        return null;
    };
    let art = await search(`${cleanSong} ${artist}`);
    if (!art) art = await search(cleanSong);
    return art;
}
