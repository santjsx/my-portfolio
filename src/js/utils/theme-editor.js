/**
 * THEME LAB — Visual Design Editor
 * Allows live adjustment of accent gradient colors.
 */

export function initThemeEditor() {
    const lab = document.getElementById('theme-lab');
    const toggle = document.getElementById('theme-lab-toggle');
    const panel = document.getElementById('theme-lab-panel');
    const closeBtn = document.getElementById('theme-lab-close');
    const color1Input = document.getElementById('accent-color-1');
    const color2Input = document.getElementById('accent-color-2');
    const hex1Text = document.getElementById('hex-1');
    const hex2Text = document.getElementById('hex-2');
    const resetBtn = document.getElementById('theme-reset');
    const copyBtn = document.getElementById('theme-copy');
    const toast = document.getElementById('copy-toast');

    if (!lab || !toggle) return;

    // Default colors
    const DEFAULTS = {
        color1: '#3A1C71',
        color2: '#FFA07A'
    };

    // 1. Initialization
    const savedColor1 = localStorage.getItem('sm-theme-color-1') || DEFAULTS.color1;
    const savedColor2 = localStorage.getItem('sm-theme-color-2') || DEFAULTS.color2;

    applyColors(savedColor1, savedColor2);
    updateUI(savedColor1, savedColor2);

    // 2. Event Listeners
    toggle.addEventListener('click', () => {
        lab.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        lab.classList.remove('active');
    });

    // Close on click outside
    document.addEventListener('mousedown', (e) => {
        if (lab.classList.contains('active') && !lab.contains(e.target)) {
            lab.classList.remove('active');
        }
    });

    color1Input.addEventListener('input', (e) => {
        const c1 = e.target.value;
        const c2 = color2Input.value;
        applyColors(c1, c2);
        updateUI(c1, c2);
        saveColors(c1, c2);
    });

    color2Input.addEventListener('input', (e) => {
        const c1 = color1Input.value;
        const c2 = e.target.value;
        applyColors(c1, c2);
        updateUI(c1, c2);
        saveColors(c1, c2);
    });

    resetBtn.addEventListener('click', () => {
        applyColors(DEFAULTS.color1, DEFAULTS.color2);
        updateUI(DEFAULTS.color1, DEFAULTS.color2);
        saveColors(DEFAULTS.color1, DEFAULTS.color2);
    });

    copyBtn.addEventListener('click', () => {
        const c1 = color1Input.value;
        const c2 = color2Input.value;
        const css = `--accent-purple: ${c1};\n--accent-salmon: ${c2};`;
        
        navigator.clipboard.writeText(css).then(() => {
            showToast('CSS TOKENS COPIED');
        });
    });

    // 3. Helper Functions
    function applyColors(c1, c2) {
        document.documentElement.style.setProperty('--accent-purple', c1);
        document.documentElement.style.setProperty('--accent-salmon', c2);
        
        // Calculate midpoint for --accent-primary fallback
        const midpoint = blendColors(c1, c2, 0.5);
        document.documentElement.style.setProperty('--accent-primary', midpoint);
        
        // Trigger ripple grid update if possible
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { color1: c1, color2: c2 } }));
    }

    function updateUI(c1, c2) {
        color1Input.value = c1;
        color2Input.value = c2;
        hex1Text.textContent = c1;
        hex2Text.textContent = c2;
    }

    function saveColors(c1, c2) {
        localStorage.setItem('sm-theme-color-1', c1);
        localStorage.setItem('sm-theme-color-2', c2);
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 2500);
    }

    // Blend two hex colors
    function blendColors(c1, c2, p) {
        const f = parseInt(c1.slice(1), 16);
        const t = parseInt(c2.slice(1), 16);
        const R1 = f >> 16, G1 = (f >> 8) & 0x00FF, B1 = f & 0x0000FF;
        const R2 = t >> 16, G2 = (t >> 8) & 0x00FF, B2 = t & 0x0000FF;
        const R = Math.round(R1 + (R2 - R1) * p);
        const G = Math.round(G1 + (G2 - G1) * p);
        const B = Math.round(B1 + (B2 - B1) * p);
        return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1).toUpperCase();
    }
}
