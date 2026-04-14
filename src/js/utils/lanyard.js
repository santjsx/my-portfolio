// src/js/utils/lanyard.js

const DiscordID = '1284925883240550552';
const API_URL = `https://api.lanyard.rest/v1/users/${DiscordID}`;

export function initLanyardWidget() {
    const toggleBtn = document.getElementById('lanyard-toggle');
    
    if (!toggleBtn) return;

    // Toggle dynamic island expansion
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBtn.classList.toggle('active');
        if (toggleBtn.classList.contains('active')) {
            fetchLanyardData(); // Refresh data when opened
        }
    });

    // Handle close button specifically
    const closeBtn = document.getElementById('lanyard-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBtn.classList.remove('active');
        });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!toggleBtn.contains(e.target)) {
            toggleBtn.classList.remove('active');
        }
    });

    // Close when scrolling
    window.addEventListener('scroll', () => {
        if (toggleBtn.classList.contains('active')) {
            toggleBtn.classList.remove('active');
        }
    }, { passive: true });

    // Initial fetch to set color indicator on the floating button
    fetchLanyardData();
    
    // Poll every 30 seconds
    setInterval(fetchLanyardData, 30000);
}

async function fetchLanyardData() {
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        
        if (json.success && json.data) {
            updateWidgetUI(json.data);
        }
    } catch (error) {
        console.error('Failed to fetch Lanyard data:', error);
    }
}

function updateWidgetUI(data) {
    const island = document.getElementById('lanyard-toggle');
    const statusText = document.getElementById('lanyard-status-text');
    const activitiesContainer = document.getElementById('lanyard-activities');
    
    // Update basic status (online, idle, dnd, offline)
    const status = data.discord_status;
    
    // Reset classes
    island.classList.remove('status-online', 'status-idle', 'status-dnd', 'status-offline');
    
    // Apply new status
    island.classList.add(`status-${status}`);
    if (statusText) {
        statusText.textContent = status.toUpperCase();
    }
    
    // Render activities
    if (activitiesContainer) {
        const activities = data.activities || [];
        const isSpotify = data.listening_to_spotify;
        
        if (activities.length === 0 && !isSpotify) {
            activitiesContainer.innerHTML = `
                <div class="lanyard-offline-message">
                    Not currently engaged in any active tasks. Probably grabbing a coffee or AFK.
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
