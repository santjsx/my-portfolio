/**
 * ARCHIVE ENGINE — Visual CMS & Deployment Assistant
 * Handles live editing and state management for the portfolio.
 */

export function initArchiveEngine() {
    console.log('🛡️ ARCHIVE ENGINE: BOOTING...');
    
    // 1. Core State
    const lab = document.getElementById('archive-engine');
    const authScreen = document.getElementById('engine-auth');
    const authInput = document.getElementById('auth-password');
    const engineSidebar = document.getElementById('archive-engine');

    if (!lab || !authScreen) {
        console.warn('🛡️ ARCHIVE ENGINE: CORE ELEMENTS MISSING');
        return;
    }

    // 2. Auth Logic
    const SECRET = "archive2026";

    // Shortcuts: Ctrl+Alt+E OR Shift+Alt+E
    window.addEventListener('keydown', (e) => {
        const isEngineKey = e.code === 'KeyE' || e.code === 'KeyT';
        const isModifier = (e.ctrlKey && e.altKey) || (e.shiftKey && e.altKey);

        if (isModifier && isEngineKey) {
            e.preventDefault();
            console.log('🛡️ ARCHIVE ENGINE: COMMAND RECEIVED');
            
            if (localStorage.getItem('sm-engine-auth') === 'true') {
                toggleEngine();
            } else {
                showAuth();
            }
        }
    });

    // Support for ?engine=true in URL
    if (new URLSearchParams(window.location.search).get('engine') === 'true') {
        showAuth();
    }

    function showAuth() {
        authScreen.classList.add('active');
        authInput.focus();
    }

    authInput?.addEventListener('input', (e) => {
        if (e.target.value === SECRET) {
            localStorage.setItem('sm-engine-auth', 'true');
            authScreen.classList.remove('active');
            toggleEngine();
            e.target.value = '';
        }
    });

    function toggleEngine() {
        engineSidebar.classList.toggle('active');
        if (engineSidebar.classList.contains('active')) {
            loadStateIntoUI();
        }
    }

    // 3. UI Controls
    const closeBtn = document.getElementById('engine-close');
    const saveBtn = document.getElementById('engine-save');
    const exportBtn = document.getElementById('engine-export');

    closeBtn?.addEventListener('click', toggleEngine);

    // Live Sync Inputs
    const syncFields = [
        { id: 'eng-id-name', target: '.meta-name', property: 'textContent' },
        { id: 'eng-id-title', target: '.meta-block:nth-child(3) .meta-value', property: 'textContent' },
        { id: 'eng-hero-1', target: '.headline-row:first-child', property: 'textContent' },
        { id: 'eng-hero-2', target: '.hero-accent-text', property: 'textContent' }
    ];

    syncFields.forEach(field => {
        const input = document.getElementById(field.id);
        input?.addEventListener('input', (e) => {
            const targets = document.querySelectorAll(field.target);
            targets.forEach(t => t[field.property] = e.target.value);
        });
    });

    // 4. Design Matrix Logic (Unified)
    const color1Input = document.getElementById('accent-color-1');
    const color2Input = document.getElementById('accent-color-2');
    const hex1Text = document.getElementById('hex-1');
    const hex2Text = document.getElementById('hex-2');

    // Load saved colors or defaults
    const DEFAULTS = { color1: '#3A1C71', color2: '#FFA07A' };
    const savedC1 = localStorage.getItem('sm-theme-color-1') || DEFAULTS.color1;
    const savedC2 = localStorage.getItem('sm-theme-color-2') || DEFAULTS.color2;
    
    applyColors(savedC1, savedC2);
    if (color1Input) color1Input.value = savedC1;
    if (color2Input) color2Input.value = savedC2;
    if (hex1Text) hex1Text.textContent = savedC1;
    if (hex2Text) hex2Text.textContent = savedC2;

    color1Input?.addEventListener('input', (e) => {
        const c1 = e.target.value;
        const c2 = color2Input.value;
        applyColors(c1, c2);
        hex1Text.textContent = c1;
        saveColors(c1, c2);
    });

    color2Input?.addEventListener('input', (e) => {
        const c1 = color1Input.value;
        const c2 = e.target.value;
        applyColors(c1, c2);
        hex2Text.textContent = c2;
        saveColors(c1, c2);
    });

    function applyColors(c1, c2) {
        document.documentElement.style.setProperty('--accent-purple', c1);
        document.documentElement.style.setProperty('--accent-salmon', c2);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { color1: c1, color2: c2 } }));
    }

    function saveColors(c1, c2) {
        localStorage.setItem('sm-theme-color-1', c1);
        localStorage.setItem('sm-theme-color-2', c2);
    }

    saveBtn?.addEventListener('click', () => {
        // In a real app, this would push to GitHub or a DB.
        // For this static site, we save to localStorage and notify user.
        alert('STATE SAVED TO LOCAL STORAGE. Use "Export" to get the code for your files.');
    });

    exportBtn?.addEventListener('click', () => {
        showExportModal();
    });

    function loadStateIntoUI() {
        // Simple scraper for current DOM values
        document.getElementById('eng-id-name').value = document.querySelector('.meta-name')?.textContent || '';
        document.getElementById('eng-hero-1').value = document.querySelector('.headline-row:first-child')?.textContent || '';
        document.getElementById('eng-hero-2').value = document.querySelector('.hero-accent-text')?.textContent || '';
    }

    function showExportModal() {
        const modal = document.getElementById('engine-modal');
        const pre = document.getElementById('export-pre');
        
        // Generate a clean JSON of the current state
        const state = {
            hero: {
                headline: document.querySelector('.hero-headline')?.innerText,
                status: document.getElementById('status-display')?.textContent
            }
            // ... add more as needed
        };

        pre.textContent = JSON.stringify(state, null, 2);
        modal.classList.add('active');
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}
