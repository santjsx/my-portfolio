import { gsap } from 'gsap';

/**
 * STAGGERED MENU — React Bits Port (Vanilla JS)
 * A premium, multi-layered navigation menu with GSAP animations.
 */

class StaggeredMenu {
  constructor(options = {}) {
    this.options = {
      position: options.position || 'right',
      colors: options.colors || ['#B497CF', '#5227FF'],
      items: options.items || [],
      socialItems: options.socialItems || [],
      displaySocials: options.displaySocials !== undefined ? options.displaySocials : true,
      displayItemNumbering: options.displayItemNumbering !== undefined ? options.displayItemNumbering : true,
      logoUrl: options.logoUrl || null,
      logoText: options.logoText || 'SR',
      menuButtonColor: options.menuButtonColor || '#fff',
      openMenuButtonColor: options.openMenuButtonColor || '#fff',
      accentColor: options.accentColor || '#5227FF',
      changeMenuColorOnOpen: options.changeMenuColorOnOpen !== undefined ? options.changeMenuColorOnOpen : true,
      closeOnClickAway: options.closeOnClickAway !== undefined ? options.closeOnClickAway : true,
      onMenuOpen: options.onMenuOpen || null,
      onMenuClose: options.onMenuClose || null,
    };

    this.isOpen = false;
    this.isBusy = false;
    this.textLines = ['Menu', 'Close'];
    
    // GSAP Timeline/Tween references
    this.openTl = null;
    this.closeTween = null;
    this.spinTween = null;
    this.textCycleAnim = null;
    this.colorTween = null;

    this.init();
  }

  init() {
    this.createElements();
    this.setupInitialState();
    this.bindEvents();
  }

  createElements() {
    const { position, colors, items, socialItems, displaySocials, displayItemNumbering, logoUrl, logoText, accentColor } = this.options;

    // 1. Wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'staggered-menu-wrapper fixed-wrapper';
    this.wrapper.setAttribute('data-position', position);
    if (accentColor) {
      this.wrapper.style.setProperty('--sm-accent', accentColor);
    }

    // 2. Prelayers
    const preLayersContainer = document.createElement('div');
    preLayersContainer.className = 'sm-prelayers';
    preLayersContainer.setAttribute('aria-hidden', 'true');
    
    const layerColors = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
    let arr = [...layerColors];
    if (arr.length >= 3) {
      const mid = Math.floor(arr.length / 2);
      arr.splice(mid, 1);
    }
    
    this.preLayerEls = arr.map(c => {
      const layer = document.createElement('div');
      layer.className = 'sm-prelayer';
      layer.style.background = c;
      preLayersContainer.appendChild(layer);
      return layer;
    });
    this.wrapper.appendChild(preLayersContainer);

    // 3. Header
    const header = document.createElement('header');
    header.className = 'staggered-menu-header';
    header.setAttribute('aria-label', 'Main navigation header');

    const logo = document.createElement('a');
    logo.className = 'sm-logo cinematic-logo';
    logo.href = 'index.html?skipLoader=true';
    logo.setAttribute('aria-label', 'Logo');
    
    if (logoUrl) {
      logo.innerHTML = `<img src="${logoUrl}" alt="Logo" class="sm-logo-img" draggable="false">`;
    } else {
      logo.innerHTML = logoText;
    }
    header.appendChild(logo);

    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'sm-toggle';
    this.toggleBtn.setAttribute('aria-label', 'Open menu');
    this.toggleBtn.setAttribute('type', 'button');
    
    this.textWrap = document.createElement('span');
    this.textWrap.className = 'sm-toggle-textWrap';
    this.textWrap.setAttribute('aria-hidden', 'true');
    
    this.textInner = document.createElement('span');
    this.textInner.className = 'sm-toggle-textInner';
    this.textWrap.appendChild(this.textInner);
    this.updateTextLines(['Menu', 'Close']); // Initial lines

    this.toggleBtn.appendChild(this.textWrap);

    this.icon = document.createElement('span');
    this.icon.className = 'sm-icon';
    this.icon.setAttribute('aria-hidden', 'true');
    this.plusH = document.createElement('span');
    this.plusH.className = 'sm-icon-line';
    this.plusV = document.createElement('span');
    this.plusV.className = 'sm-icon-line sm-icon-line-v';
    this.icon.appendChild(this.plusH);
    this.icon.appendChild(this.plusV);
    this.toggleBtn.appendChild(this.icon);

    header.appendChild(this.toggleBtn);
    this.wrapper.appendChild(header);

    // 4. Panel
    this.panel = document.createElement('aside');
    this.panel.id = 'staggered-menu-panel';
    this.panel.className = 'staggered-menu-panel';
    this.panel.setAttribute('aria-hidden', 'true');

    const panelInner = document.createElement('div');
    panelInner.className = 'sm-panel-inner';

    const list = document.createElement('ul');
    list.className = 'sm-panel-list';
    list.setAttribute('role', 'list');
    if (displayItemNumbering) list.setAttribute('data-numbering', 'true');

    if (items && items.length) {
      items.forEach((it, idx) => {
        const li = document.createElement('li');
        li.className = 'sm-panel-itemWrap';
        const a = document.createElement('a');
        a.className = 'sm-panel-item';
        a.href = it.link;
        if (it.ariaLabel) a.setAttribute('aria-label', it.ariaLabel);
        if (it.className) a.className += ' ' + it.className;
        a.setAttribute('data-index', idx + 1);
        a.innerHTML = `<span class="sm-panel-itemLabel">${it.label}</span>`;
        li.appendChild(a);
        list.appendChild(li);
      });
    }
    panelInner.appendChild(list);

    if (displaySocials && socialItems && socialItems.length) {
      const socials = document.createElement('div');
      socials.className = 'sm-socials';
      socials.setAttribute('aria-label', 'Social links');
      socials.innerHTML = `<h3 class="sm-socials-title">Socials</h3>`;
      
      const sList = document.createElement('ul');
      sList.className = 'sm-socials-list';
      sList.setAttribute('role', 'list');
      
      socialItems.forEach(s => {
        const sLi = document.createElement('li');
        sLi.className = 'sm-socials-item';
        sLi.innerHTML = `<a href="${s.link}" target="_blank" rel="noopener noreferrer" class="sm-socials-link">${s.label}</a>`;
        sList.appendChild(sLi);
      });
      socials.appendChild(sList);
      panelInner.appendChild(socials);
    }

    this.panel.appendChild(panelInner);
    this.wrapper.appendChild(this.panel);

    document.body.appendChild(this.wrapper);
  }

  updateTextLines(lines) {
    this.textInner.innerHTML = lines.map(l => `<span class="sm-toggle-line">${l}</span>`).join('');
  }

  setupInitialState() {
    const offscreen = this.options.position === 'left' ? -100 : 100;
    gsap.set([this.panel, ...this.preLayerEls], { xPercent: offscreen, opacity: 1 });
    gsap.set(this.plusH, { transformOrigin: '50% 50%', rotate: 0 });
    gsap.set(this.plusV, { transformOrigin: '50% 50%', rotate: 90 });
    gsap.set(this.icon, { rotate: 0, transformOrigin: '50% 50%' });
    gsap.set(this.textInner, { yPercent: 0 });
    gsap.set(this.toggleBtn, { color: this.options.menuButtonColor });
  }

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggle());

    if (this.options.closeOnClickAway) {
      document.addEventListener('mousedown', (e) => {
        if (this.isOpen && !this.panel.contains(e.target) && !this.toggleBtn.contains(e.target)) {
          this.close();
        }
      });
    }

    // Handle internal links (close on click)
    this.panel.addEventListener('click', (e) => {
        const link = e.target.closest('.sm-panel-item');
        if (link) {
            const href = link.getAttribute('href');
            const hasTrigger = link.classList.contains('js-open-vibe-portal') || link.classList.contains('js-open-resume');
            
            if ((href && href.startsWith('#')) || hasTrigger) {
                this.close();
            }
        }
    });
  }

  toggle() {
    if (this.isBusy) return;
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.isOpen || this.isBusy) return;
    this.isOpen = true;
    this.wrapper.setAttribute('data-open', 'true');
    this.toggleBtn.setAttribute('aria-expanded', 'true');
    this.panel.setAttribute('aria-hidden', 'false');
    
    if (this.options.onMenuOpen) this.options.onMenuOpen();
    
    this.playOpenAnimation();
    this.animateIcon(true);
    this.animateColor(true);
    this.animateText(true);
  }

  close() {
    if (!this.isOpen || this.isBusy) return;
    this.isOpen = false;
    this.wrapper.removeAttribute('data-open');
    this.toggleBtn.setAttribute('aria-expanded', 'false');
    this.panel.setAttribute('aria-hidden', 'true');

    if (this.options.onMenuClose) this.options.onMenuClose();

    this.playCloseAnimation();
    this.animateIcon(false);
    this.animateColor(false);
    this.animateText(false);
  }

  playOpenAnimation() {
    this.isBusy = true;
    this.openTl?.kill();
    this.closeTween?.kill();

    const offscreen = this.options.position === 'left' ? -100 : 100;
    const itemEls = Array.from(this.panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(this.panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = this.panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(this.panel.querySelectorAll('.sm-socials-link'));

    gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    gsap.set(numberEls, { '--sm-num-opacity': 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({
        onComplete: () => { this.isBusy = false; }
    });

    this.preLayerEls.forEach((el, i) => {
      tl.fromTo(el, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = this.preLayerEls.length ? (this.preLayerEls.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (this.preLayerEls.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(this.panel, { xPercent: offscreen }, { xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime);

    const itemsStart = panelInsertTime + panelDuration * 0.15;
    tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, itemsStart);
    tl.to(numberEls, { '--sm-num-opacity': 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, itemsStart + 0.1);

    const socialsStart = panelInsertTime + panelDuration * 0.4;
    if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5 }, socialsStart);
    tl.to(socialLinks, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.08 }, socialsStart + 0.04);

    this.openTl = tl;
  }

  playCloseAnimation() {
    this.isBusy = true;
    this.openTl?.kill();
    this.closeTween?.kill();

    const offscreen = this.options.position === 'left' ? -100 : 100;
    const all = [...this.preLayerEls, this.panel];

    this.closeTween = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      onComplete: () => {
        this.isBusy = false;
        // Reset internal states
        gsap.set(this.panel.querySelectorAll('.sm-panel-itemLabel'), { yPercent: 140, rotate: 10 });
      }
    });
  }

  animateIcon(opening) {
    this.spinTween?.kill();
    if (opening) {
      this.spinTween = gsap.to(this.icon, { rotate: 225, duration: 0.8, ease: 'power4.out' });
    } else {
      this.spinTween = gsap.to(this.icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut' });
    }
  }

  animateColor(opening) {
    if (!this.options.changeMenuColorOnOpen) return;
    this.colorTween?.kill();
    const targetColor = opening ? this.options.openMenuButtonColor : this.options.menuButtonColor;
    this.colorTween = gsap.to(this.toggleBtn, { color: targetColor, delay: 0.18, duration: 0.3 });
  }

  animateText(opening) {
    this.textCycleAnim?.kill();
    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    
    this.updateTextLines(seq);
    gsap.set(this.textInner, { yPercent: 0 });
    
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    this.textCycleAnim = gsap.to(this.textInner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    if (newOptions.accentColor) {
      this.wrapper.style.setProperty('--sm-accent', newOptions.accentColor);
      // Synchronize the first staggered layer with the new accent color
      if (this.preLayerEls && this.preLayerEls.length > 0) {
        this.preLayerEls[0].style.background = newOptions.accentColor;
      }
    }
  }
}

export function initStaggeredMenu(options) {
  return new StaggeredMenu(options);
}
