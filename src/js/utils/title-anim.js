// src/js/utils/title-anim.js
export function initTitleAnimation() {
    const roles = [
        "Santhosh Reddy",
        "Code Architect",
        "UI Destructor",
        "System Builder"
    ];

    let rollIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function play() {
        const currentText = roles[rollIndex];

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        const display = currentText.substring(0, charIndex);
        const cursor = isDeleting ? "" : " _"; // Monospace cursor

        document.title = display + (charIndex === currentText.length ? "" : cursor);

        let speed = isDeleting ? 40 : 120;

        if (!isDeleting && charIndex === currentText.length) {
            speed = 3000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            rollIndex = (rollIndex + 1) % roles.length;
            speed = 500;
        }

        setTimeout(play, speed);
    }

    // Initial delay before first animation
    setTimeout(play, 1500);
}
