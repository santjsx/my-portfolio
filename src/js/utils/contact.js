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
            
            // Decrypt Out To Copied
            glitchText(textNode, originalText, '// CONNECTION ESTABLISHED // (COPIED)', () => {
                // Wait 2.5s then revert
                setTimeout(() => {
                    glitchText(textNode, '// CONNECTION ESTABLISHED // (COPIED)', originalText, () => {
                        textNode.classList.remove('is-copying');
                        textNode.style.color = '';
                        btn.style.borderColor = '';
                    });
                }, 2500);
            });

        } catch (err) {
            console.error('Failed to copy', err);
        }
    });
}

function glitchText(element, fromText, toText, callback) {
    let iteration = 0;
    const maxIterations = Math.max(fromText.length, toText.length);
    let interval = null;

    clearInterval(interval);
    
    interval = setInterval(() => {
        element.innerText = toText
            .split('')
            .map((letter, index) => {
                if (index < iteration) {
                    return toText[index];
                }
                return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join('');
        
        if (iteration >= maxIterations) {
            clearInterval(interval);
            element.innerText = toText;
            if (callback) callback();
        }
        
        iteration += 1/3; // Speed of decryption
    }, 20);
}
