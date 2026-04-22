// src/js/utils/contact.js
// Cinematic dossier copy-to-clipboard interactions

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#_';

export function initContactSection() {
    // Dynamic year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Secure Comms Copy Button
    const btn = document.getElementById('secure-comms-btn');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const emailToCopy = btn.getAttribute('data-copy');
        const textNode = btn.querySelector('.card-value');
        const originalText = textNode.getAttribute('data-text');
        
        if (textNode.classList.contains('is-copying')) return;

        try {
            await navigator.clipboard.writeText(emailToCopy);
            
            // Trigger feedback
            textNode.classList.add('is-copying');
            textNode.style.color = 'var(--accent-primary)';
            btn.style.borderColor = 'var(--accent-primary)';
            
            // Simple, professional feedback swap
            textNode.textContent = 'Email copied to clipboard';
            
            setTimeout(() => {
                textNode.textContent = originalText;
                textNode.classList.remove('is-copying');
                textNode.style.color = '';
                btn.style.borderColor = '';
            }, 2000);

        } catch (err) {
            console.error('Failed to copy', err);
        }
    });
}


