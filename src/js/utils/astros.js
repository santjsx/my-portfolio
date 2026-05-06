/**
 * ORBIT WATCH — Humans in Space Tracker
 * Robust integration with multi-source fallback and failsafe data.
 */

const ASTROS_API_PRIMARY = 'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json';
const ASTROS_API_SECONDARY = 'https://api.open-notify.org/astros.json'; // Backup
const CACHE_KEY = 'archive_astros_cache';
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours (Doesn't change often)
const FAILSAFE_COUNT = 10; // High-probability minimum as final fallback

export async function initAstrosWidget() {
    const targets = [
        document.getElementById('stat-iss'),
        document.getElementById('iss-count'),
        document.getElementById('astros-count')
    ].filter(Boolean);

    if (targets.length === 0) return;

    try {
        // 1. Try Cache
        let data = getCache();

        if (!data) {
            data = await fetchWithFallback();
            if (data) setCache(data);
        }

        const count = data?.number || data?.people?.length || FAILSAFE_COUNT;
        
        // 2. Render to all targets
        targets.forEach(el => {
            el.style.opacity = '0';
            setTimeout(() => {
                // Determine if it's the hero stat or the widget
                if (el.id === 'stat-iss') {
                    el.textContent = count;
                } else if (el.id === 'iss-count') {
                    el.textContent = count;
                } else {
                    el.innerHTML = `
                        <div class="astros-badge" title="There are currently ${count} people in orbit.">
                            <span class="astros-icon"></span>
                            ${count} PEOPLE
                        </div>
                    `;
                }
                el.style.opacity = '1';
            }, 300);
        });

    } catch (err) {
        console.warn('Orbital Uplink Error, using failsafe:', err);
        targets.forEach(el => {
            if (el.id === 'stat-iss' || el.id === 'iss-count') {
                el.textContent = FAILSAFE_COUNT;
            } else {
                el.textContent = `${FAILSAFE_COUNT} PEOPLE`;
            }
        });
    }
}

async function fetchWithFallback() {
    // Try Primary
    try {
        const res = await fetch(ASTROS_API_PRIMARY);
        if (res.ok) return await res.json();
    } catch (e) { console.warn('Primary orbital API failed'); }

    // Try Secondary (might fail due to Mixed Content if site is HTTPS, but good to have)
    try {
        const res = await fetch(ASTROS_API_SECONDARY);
        if (res.ok) return await res.json();
    } catch (e) { console.warn('Secondary orbital API failed'); }

    return null;
}

function getCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        return (Date.now() - timestamp > CACHE_TTL) ? null : data;
    } catch (e) { return null; }
}

function setCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {}
}
