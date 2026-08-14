# India's 80th Independence Day 2026 Personalized Wishing Website 🇮🇳

A beautiful, emotional, modern, and highly shareable personalized wishing web application celebrating **India's 80th Independence Day (15 August 2026)**.

Created with ❤️ and Code by **Omprasad Bhaskar Padwalkar, Developer & Creator**.

---

## ✨ Features

- 🇮🇳 **Personalized Wishes**: Enter your name to generate a custom greeting addressed to you.
- ❤️ **Continuous Flowing Hearts Engine**: Canvas animation of floating glowing hearts & tricolor particles floating upward across the screen.
- 🎵 **Patriotic Background Music**: Ambient Web Audio API soundscape with equalizer bars and ON/OFF floating toggle.
- 📱 **WhatsApp One-Click Sharing**: Pre-formatted share link with recipient's name and full wish message.
- 📋 **Copy Wish to Clipboard**: Copy formatted text with instant toast notifications.
- 🖼️ **Download Wish as Image (PNG)**: Renders a crisp high-resolution wish card PNG image for easy sharing on social media.
- 🔗 **Direct URL Share**: Shared links (`?name=Rahul`) automatically load the personalized card for recipient.
- 🕊️ **Freedom Fighters Quote Carousel**: Inspirational quotes from India's freedom heroes.
- ✋ **Interactive Pledge Wall**: Take a pledge for a better India with saved counters.
- 📱 **Fully Responsive**: Mobile-first glassmorphism design optimized for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

- **Framework**: Vite + Vanilla HTML5/CSS3/JavaScript (Zero framework bloat, fast load time)
- **Styling**: Glassmorphism CSS design system with custom CSS variables & keyframe micro-animations
- **Libraries**:
  - `canvas-confetti` - Tricolor sparkle burst on wish generation
  - `html2canvas` - High-resolution wish card PNG renderer
- **Audio**: Web Audio API synthesized harmonic patriotic soundscape

---

## 🚀 Local Development Setup

1. **Clone or navigate to the repository**:
   ```bash
   cd "d:/Projects/Independence day"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled assets will be placed in the `dist/` directory.

---

## 🌐 Deployment Instructions

### ⚡ Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**. Vercel will automatically host your website with a free HTTPS URL!

---

### 💧 Deploy to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/).
2. Drag and drop the `dist/` folder after running `npm run build`, or connect your GitHub repository.
3. Build Command: `npm run build`
4. Publish Directory: `dist`
5. Click **Deploy Site**.

---

### 🐙 Deploy to GitHub Pages

1. In `vite.config.js`, set `base: '/repo-name/'` if deploying to a subpath.
2. Install `gh-pages`:
   ```bash
   npm install -D gh-pages
   ```
3. Add script in `package.json`:
   ```json
   "deploy": "vite build && gh-pages -d dist"
   ```
4. Run `npm run deploy` to publish live!

---

## 👨‍💻 Author & Credits

**Omprasad Bhaskar Padwalkar**  
*Developer & Creator 🇮🇳*  

*15 August 2026 🇮🇳 | India's 80th Independence Day*  
*With Love & Best Wishes — Omprasad Bhaskar Padwalkar ❤️🇮🇳*
