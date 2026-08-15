# India's 80th Independence Day 2026 Personalized Wishing Web App 🇮🇳

[![Independence Day](https://img.shields.io/badge/15%20August%202026-80th%20Independence%20Day-FF9933?style=for-the-badge&logo=india&logoColor=white)](https://github.com/omprasad-007/80th_Independence_day)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](LICENSE)

A modern, emotional, interactive, and highly shareable personalized wishing web application celebrating **India's 80th Independence Day (15 August 2026)**. Built with high-performance Vanilla JavaScript, CSS3 Glassmorphism, Web Audio API soundscapes, and an interactive particle/floating hearts engine.

Created with ❤️ and Code by **Omprasad Bhaskar Padwalkar**.

---

## 🌟 Key Features

- 🇮🇳 **Personalized Greetings Engine**:
  - **Quick Wish**: Enter the recipient's name for instant customized greetings.
  - **Send Personal Wish**: Sender & Receiver customization with custom signature cards (`?name=` & `?sender=`).
- ❤️ **Interactive Floating Hearts & Tricolor Particles Canvas**:
  - Continuous floating glowing hearts and tricolor particle physics rendered on HTML5 Canvas.
- 🎵 **Dual Patriotic Audio System**:
  - HTML5 Audio Player streaming *Vande Mataram* with auto-play fallbacks and tab-visibility handling.
  - Web Audio API harmonic sound synthesizer with live animated audio equalizer visualizer controls.
- 🎆 **Cinematic FX & Firecracker Celebrations**:
  - Multi-stage SVG Ashoka Chakra opening overlay with glowing ambient light aura.
  - Multi-stage tricolor firecracker bursts powered by `canvas-confetti` and synthesized audio explosions.
- 📱 **Instant Social Sharing & Export Suite**:
  - **WhatsApp One-Click Sharing**: Pre-filled patriotic message containing personalized link.
  - **Web Share API**: Native device sharing for mobile browsers.
  - **Download Wish as Image (PNG)**: Renders high-resolution printable wish card images via `html2canvas`.
  - **Copy to Clipboard**: One-tap wish copying with custom toast notifications.
- 🕊️ **Freedom Fighters Quote Carousel**:
  - Interactive quote carousel featuring revolutionary words from Bhagat Singh, Netaji Subhas Chandra Bose, Mahatma Gandhi, Rabindranath Tagore, Dr. A.P.J. Abdul Kalam, and Sardar Vallabhbhai Patel.
- ✋ **Interactive Patriotic Pledge Wall**:
  - Choose and commit to a pledge (Green India, Unity, Innovation, Empowering Youth) with active pledge tracking.
- 🛡️ **Client Security Engine**:
  - Built-in Anti-XSS sanitizer, JWT visitor session generator (`ID2026_JWT`), secure cookies (`SameSite=Strict`), strict CSP meta headers, and anti-flood submission rate limiter.
- 📱 **Glassmorphism Responsive UI**:
  - 3D tilt effects, smooth keyframe animations, typography from Google Fonts (`Outfit`, `Cinzel`, `Playfair Display`, `Fira Code`), optimized for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack & Dependencies

- **Build Tool & Bundler**: [Vite](https://vitejs.dev/)
- **Core Technologies**: Vanilla HTML5, Modern CSS3 (Variables, Glassmorphism, Keyframes), JavaScript (ES Modules)
- **Key Libraries**:
  - [`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti) - Tricolor sparkle & firework explosions
  - [`html2canvas`](https://www.npmjs.com/package/html2canvas) - PNG wish card image rendering
  - [`lucide`](https://lucide.dev/) - Modern UI icons
  - [`@emailjs/browser`](https://www.emailjs.com/) - Browser email integration support
- **Audio & Visuals**: Web Audio API, HTML5 Canvas API, Inline SVG Ashoka Chakra

---

## 📁 Project Structure

```
80th_Independence_day/
├── public/
│   ├── favicon.ico
│   └── music/
│       └── vandemataram.mp3       # Audio track for ambient background player
├── src/
│   ├── main.js                    # Core app engine: security, canvas particles, audio, export & UI logic
│   └── style.css                  # Custom Glassmorphism design system, theme variables & animations
├── index.html                     # Semantic HTML5 document, CSP headers & OpenGraph metadata
├── package.json                   # Dependencies, project metadata & npm scripts
├── vite.config.js                 # Vite bundler configuration
├── vercel.json                    # Vercel deployment rewrites configuration
└── README.md                      # Comprehensive project documentation
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/omprasad-007/80th_Independence_day.git
   cd 80th_Independence_day
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` (or the URL shown in terminal).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   The production build will be generated in the `dist/` directory.

5. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment Options

### ⚡ Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository `80th_Independence_day`.
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. Vercel will host your website with automatic HTTPS!

---

### 💧 Deploy to Netlify
1. Log into [Netlify](https://www.netlify.com/).
2. Select **Add new site** > **Import an existing project** (or drag & drop the `dist/` folder).
3. Set Build Command: `npm run build`
4. Set Publish Directory: `dist`
5. Click **Deploy Site**.

---

### 🐙 Deploy to GitHub Pages
1. In `vite.config.js`, set `base: '/80th_Independence_day/'` if hosting on GitHub Pages subpath.
2. Install `gh-pages`:
   ```bash
   npm install -D gh-pages
   ```
3. Add a deploy script to `package.json`:
   ```json
   "deploy": "vite build && gh-pages -d dist"
   ```
4. Run:
   ```bash
   npm run deploy
   ```

---

## 👨‍💻 Author & Credits

Designed & Developed by **Omprasad Bhaskar Padwalkar**  

- **GitHub**: [@omprasad-007](https://github.com/omprasad-007)

*15 August 2026 🇮🇳 | India's 80th Independence Day*  
*With Love & Best Wishes — Omprasad Bhaskar Padwalkar ❤️🇮🇳*

