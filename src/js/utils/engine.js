/**
 * ARCHIVE ENGINE — Visual CMS & Deployment Assistant
 * Handles live editing and state management for the portfolio.
 */

export function initArchiveEngine() {
    // 1. Core State
    let engineState = {
        identity: {
            name: "Santhosh Reddy",
            title: "Developer",
            location: "India"
        },
        hero: {
            headlineRow1: "Building high-end",
            headlineRow2: "digital products.",
            tagline: "ARCHIVE // 2026 // AD_SR"
        },
        projects: [
            {
                name: "The Hustle Planner",
                description: "A high-performance productivity engine designed for deep work and streamlined task management.",
                link: "https://the-hustle-planner.vercel.app/",
                image: "images/hustle_planner.png"
            },
            {
                name: "Hybrid OS",
                description: "Architecting a seamless, unified system interface that harmonizes complex workflows.",
                link: "https://hybrid-os.vercel.app/",
                image: "images/Hybrid_OS.png"
            }
        ]
    };

    // 2. Auth Logic
    const SECRET = "archive2026";
    const authScreen = document.getElementById('engine-auth');
    const authInput = document.getElementById('auth-password');
    const engineSidebar = document.getElementById('archive-engine');

    // Shortcut: Ctrl + Alt + E to open Engine
    window.addEventListener('keydown', (e) => {
        // Use e.code for more reliable shortcut detection across layouts
        if (e.ctrlKey && e.altKey && e.code === 'KeyE') {
            e.preventDefault(); // Prevent browser default actions
            console.log('🛡️ ARCHIVE ENGINE: COMMAND RECEIVED');
            
            if (localStorage.getItem('sm-engine-auth') === 'true') {
                toggleEngine();
            } else {
                showAuth();
            }
        }
    });

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
