<div align="center">

# Santhosh Reddy — Digital Archive 2.0

**A high-performance, cinematic developer portfolio built with Neo-Minimalist aesthetics, butter-smooth motion, and real-time Discord reactivity.**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)](#)
[![GSAP](https://img.shields.io/badge/Animation-GSAP-88CE02?logo=greensock&logoColor=white)](#)
[![JS](https://img.shields.io/badge/Logic-Vanilla_JS-F7DF1E?logo=javascript&logoColor=black)](#)

</div>

---

## 📽️ The Cinematic Experience
Designed for **Zero Lag** and **Maximum Intent**, this portfolio focuses on typography, speed, and premium micro-interactions.

- **Fluid Motion**: Powered by **GSAP** and **Lenis** for an effortless, weighted scroll experience.
- **Typographic Precision**: A rigorous focus on editorial layout, high-end indices, and technical dossiers.
- **Zero Asset Latency**: The "Media Log" uses embedded vector architecture (SVGs) for instantaneous loads without network lag.

---

## 📡 Live Logic (Lanyard Integration)

The site’s soul is connected to Discord. You can update your brand identity in real-time via **Lanyard KV** commands (`.set <key> <value>`):

| Command Key | Example Action | Visual Result |
| :--- | :--- | :--- |
| `mood` | `.set mood Focus Mode` | Updates the "Mood Island" status text. |
| `hero_quote` | `.set hero_quote "Need, not want"` | Swaps the cinematic quote in the Hero section. |
| `accent_color` | `.set accent_color #ff0000` | Shifts the global accent color across the entire site. |
| `about_photo_url` | `.set about_photo_url https://...` | Live-swaps your portrait (with automatic failsafe). |
| `skills` | `.set skills GSAP:Advanced` | Additive "Arsenal" system. Appends new credits instantly. |

---

## 📼 Featured Systems

### **1. The Media Log**
A standalone, high-density **Vector Grid** that archives your listening history (Spotify) and cinema logs (Letterboxd). 
- **Typographic Focus**: We scrapped heavy images for instant performance, relying purely on aesthetic vector grids.
- **Real-Time Context**: Leverages Last.fm and Deezer APIs for metadata depth.

### **2. Intelligent Nav**
Precision **ScrollSpy** across the main index. The cinematic red underline dynamically follows your focus, whether you are scrolling through projects or exploring standalone media logs.

---

## 🛠️ Tech Stack

<details>
<summary>View Architecture Details</summary>

- **Core**: Vanilla HTML5, Vanilla CSS, Vanilla JavaScript (ES6+).
- **Build Tool**: Vite (for local dev server, module bundling, and optimized builds).
- **APIs**: Lanyard (Discord Presence/KV), Last.fm (Music), Deezer (Metadata).
- **Animation & Scroll**: GSAP (GreenSock), ScrollTrigger, Lenis Smooth Scroll.
</details>

---

## 🚀 Setup & Generation

To run this archive locally, ensure you have **Node.js** installed.

```bash
# 1. Clone the repository
git clone https://github.com/santjsx/my-portfolio.git

# 2. Navigate into the directory
cd my-portfolio

# 3. Install NPM dependencies
npm install

# 4. Start local Vite server
npm run dev

# 5. Build for production (outputs to /dist)
npm run build
```

---

<div align="center">
  <p>Architected with precision by <a href="https://github.com/santjsx">Santhosh Reddy</a>.</p>
</div>
