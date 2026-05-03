/**
 * ProfileCard - Vanilla JS Implementation of the React Bits ProfileCard
 */

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const ANIMATION_CONFIG = {
    INITIAL_DURATION: 1200,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
    ENTER_TRANSITION_MS: 180,
    MOBILE_THRESHOLD: 768
};

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

export class ProfileCard {
    constructor(container, options = {}) {
        this.container = container;
        this.props = {
            avatarUrl: options.avatarUrl || '',
            iconUrl: options.iconUrl || '',
            grainUrl: options.grainUrl || '',
            innerGradient: options.innerGradient || DEFAULT_INNER_GRADIENT,
            behindGlowEnabled: options.behindGlowEnabled !== false,
            behindGlowColor: options.behindGlowColor || 'rgba(125, 190, 255, 0.67)',
            behindGlowSize: options.behindGlowSize || '50%',
            className: options.className || '',
            enableTilt: options.enableTilt !== false,
            enableMobileTilt: !!options.enableMobileTilt,
            mobileTiltSensitivity: options.mobileTiltSensitivity || 5,
            miniAvatarUrl: options.miniAvatarUrl || options.avatarUrl,
            name: options.name || 'Javi A. Torres',
            title: options.title || 'Software Engineer',
            handle: options.handle || 'javicodes',
            status: options.status || 'Online',
            contactText: options.contactText || 'Contact',
            showUserInfo: options.showUserInfo !== false,
            onContactClick: options.onContactClick || null
        };

        this.refs = {
            wrap: null,
            shell: null,
            avatar: null,
            miniAvatar: null,
            contactBtn: null
        };

        this.tiltEngine = null;
        this.enterTimer = null;
        this.leaveRaf = null;

        this.render();
        this.initTiltEngine();
        this.bindEvents();
        this.startInitialAnimation();
    }

    render() {
        const {
            className,
            behindGlowEnabled,
            avatarUrl,
            name,
            showUserInfo,
            miniAvatarUrl,
            handle,
            status,
            contactText,
            title,
            iconUrl,
            grainUrl,
            innerGradient,
            behindGlowColor,
            behindGlowSize
        } = this.props;

        this.container.innerHTML = `
            <div class="pc-card-wrapper ${className}" style="
                --behind-glow-color: ${behindGlowColor};
                --behind-glow-size: ${behindGlowSize};
                --inner-gradient: ${innerGradient};
                --icon: ${iconUrl ? `url(${iconUrl})` : 'none'};
                --grain: ${grainUrl ? `url(${grainUrl})` : 'none'};
            ">
                ${behindGlowEnabled ? '<div class="pc-behind"></div>' : ''}
                <div class="pc-card-shell">
                    <section class="pc-card">
                        <div class="pc-inside">
                            <div class="pc-shine"></div>
                            <div class="pc-glare"></div>
                            <div class="pc-content pc-avatar-content">
                                <img class="avatar" src="${avatarUrl}" alt="${name} avatar" loading="lazy">
                                ${showUserInfo ? `
                                    <div class="pc-user-info">
                                        <div class="pc-user-details">
                                            <div class="pc-mini-avatar">
                                                <img src="${miniAvatarUrl}" alt="${name} mini avatar" loading="lazy">
                                            </div>
                                            <div class="pc-user-text">
                                                <div class="pc-handle">@${handle}</div>
                                                <div class="pc-status">${status}</div>
                                            </div>
                                        </div>
                                        <button class="pc-contact-btn" type="button" aria-label="Contact ${name}">
                                            ${contactText}
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="pc-content">
                                <div class="pc-details">
                                    <h3>${name}</h3>
                                    <p>${title}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;

        this.refs.wrap = this.container.querySelector('.pc-card-wrapper');
        this.refs.shell = this.container.querySelector('.pc-card-shell');
        this.refs.avatar = this.container.querySelector('.avatar');
        this.refs.contactBtn = this.container.querySelector('.pc-contact-btn');

        if (this.refs.avatar) {
            this.refs.avatar.onerror = (e) => { e.target.style.display = 'none'; };
        }
    }

    initTiltEngine() {
        if (!this.props.enableTilt) return;

        let rafId = null;
        let running = false;
        let lastTs = 0;

        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;

        const isMobile = window.innerWidth <= ANIMATION_CONFIG.MOBILE_THRESHOLD;
        const DEFAULT_TAU = isMobile ? 0.25 : 0.14; // Smoother on mobile
        const INITIAL_TAU = 0.6;
        let initialUntil = 0;

        const setVarsFromXY = (x, y) => {
            const shell = this.refs.shell;
            const wrap = this.refs.wrap;
            if (!shell || !wrap) return;

            const width = shell.clientWidth || 1;
            const height = shell.clientHeight || 1;

            const percentX = clamp((100 / width) * x);
            const percentY = clamp((100 / height) * y);

            const centerX = percentX - 50;
            const centerY = percentY - 50;

            const properties = {
                '--pointer-x': `${percentX}%`,
                '--pointer-y': `${percentY}%`,
                '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
                '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
                '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
                '--pointer-from-top': `${percentY / 100}`,
                '--pointer-from-left': `${percentX / 100}`,
                '--rotate-x': `${round(-(centerX / 5))}deg`,
                '--rotate-y': `${round(centerY / 4)}deg`
            };

            // Throttle updates on mobile if needed, or just apply
            for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v);
        };

        const step = ts => {
            if (!running) return;
            if (lastTs === 0) lastTs = ts;
            const dt = (ts - lastTs) / 1000;
            lastTs = ts;

            const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
            const k = 1 - Math.exp(-dt / tau);

            currentX += (targetX - currentX) * k;
            currentY += (targetY - currentY) * k;

            setVarsFromXY(currentX, currentY);

            const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

            if (stillFar || document.hasFocus()) {
                rafId = requestAnimationFrame(step);
            } else {
                running = false;
                lastTs = 0;
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }
        };

        const start = () => {
            if (running) return;
            running = true;
            lastTs = 0;
            rafId = requestAnimationFrame(step);
        };

        this.tiltEngine = {
            setImmediate: (x, y) => {
                currentX = x;
                currentY = y;
                setVarsFromXY(currentX, currentY);
            },
            setTarget: (x, y) => {
                targetX = x;
                targetY = y;
                start();
            },
            toCenter: () => {
                const shell = this.refs.shell;
                if (!shell) return;
                this.tiltEngine.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
            },
            beginInitial: (durationMs) => {
                initialUntil = performance.now() + durationMs;
                start();
            },
            getCurrent: () => {
                return { x: currentX, y: currentY, tx: targetX, ty: targetY };
            },
            cancel: () => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                running = false;
                lastTs = 0;
            }
        };
    }

    getOffsets(evt, el) {
        const rect = el.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    bindEvents() {
        const shell = this.refs.shell;
        if (!shell || !this.tiltEngine) return;

        shell.addEventListener('pointerenter', (e) => {
            shell.classList.add('active');
            shell.classList.add('entering');
            if (this.enterTimer) clearTimeout(this.enterTimer);
            this.enterTimer = setTimeout(() => {
                shell.classList.remove('entering');
            }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

            const { x, y } = this.getOffsets(e, shell);
            this.tiltEngine.setTarget(x, y);
        });

        shell.addEventListener('pointermove', (e) => {
            const { x, y } = this.getOffsets(e, shell);
            this.tiltEngine.setTarget(x, y);
        });

        shell.addEventListener('pointerleave', () => {
            this.tiltEngine.toCenter();

            const checkSettle = () => {
                const { x, y, tx, ty } = this.tiltEngine.getCurrent();
                const settled = Math.hypot(tx - x, ty - y) < 0.6;
                if (settled) {
                    shell.classList.remove('active');
                    this.leaveRaf = null;
                } else {
                    this.leaveRaf = requestAnimationFrame(checkSettle);
                }
            };
            if (this.leaveRaf) cancelAnimationFrame(this.leaveRaf);
            this.leaveRaf = requestAnimationFrame(checkSettle);
        });

        if (this.refs.contactBtn && this.props.onContactClick) {
            this.refs.contactBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.props.onContactClick();
            });
        }

        // Mobile orientation handling
        if (this.props.enableMobileTilt || isMobile) {
            const handleOrientation = (event) => {
                const { beta, gamma } = event;
                if (beta == null || gamma == null) return;

                const centerX = shell.clientWidth / 2;
                const centerY = shell.clientHeight / 2;
                
                // Reduce sensitivity on mobile for stability
                const sensitivity = isMobile ? this.props.mobileTiltSensitivity * 0.6 : this.props.mobileTiltSensitivity;
                
                const x = clamp(centerX + gamma * sensitivity, 0, shell.clientWidth);
                const y = clamp(
                    centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * sensitivity,
                    0,
                    shell.clientHeight
                );

                this.tiltEngine.setTarget(x, y);
            };

            // On mobile, we might want to start orientation automatically or on first touch
            if (isMobile) {
                window.addEventListener('deviceorientation', handleOrientation);
                
                // Pause tilt on scroll to save battery and improve FPS
                let scrollTimeout;
                window.addEventListener('scroll', () => {
                    this.tiltEngine.cancel();
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        this.tiltEngine.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
                    }, 150);
                }, { passive: true });
            }

            shell.addEventListener('click', () => {
                if (location.protocol !== 'https:') return;
                const anyMotion = window.DeviceMotionEvent;
                if (anyMotion && typeof anyMotion.requestPermission === 'function') {
                    anyMotion.requestPermission()
                        .then(state => {
                            if (state === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation);
                            }
                        })
                        .catch(console.error);
                }
            });
        }
    }

    startInitialAnimation() {
        if (!this.tiltEngine) return;
        const shell = this.refs.shell;
        const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
        const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
        this.tiltEngine.setImmediate(initialX, initialY);
        this.tiltEngine.toCenter();
        this.tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);
    }

    destroy() {
        if (this.enterTimer) clearTimeout(this.enterTimer);
        if (this.leaveRaf) cancelAnimationFrame(this.leaveRaf);
        if (this.tiltEngine) this.tiltEngine.cancel();
    }
}
