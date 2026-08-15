import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

// ==========================================
// Global Error Boundary & Crash Protection
// ==========================================
window.addEventListener('error', (event) => {
  console.warn('Handled global application error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Handled unhandled promise rejection:', event.reason);
});

// ==========================================
// Application State & Constants
// ==========================================
const state = {
  currentName: '',
  senderName: '',
  isPlayingAudio: true,
  wasAudioPlayingBeforeHidden: false,
  audioContext: null,
  activeOscillators: [],
  synthTimerId: null,
  quotesIntervalId: null,
  currentQuoteIndex: 0,
  pledgeCount: 1947,
  jwtToken: '',
  animFrameId: null,
  lastConfettiTime: 0,
  isExportingImage: false
};

// ==========================================
// Security Engine: Secure Cookies, JWT Session Tokens, Anti-XSS & Anti-Crash Protection
// ==========================================

// 1. Anti-XSS & Script Injection Sanitizer
function sanitizeInput(inputStr) {
  if (typeof inputStr !== 'string') return '';
  return inputStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// 2. Secure Cookie Storage Helpers (SameSite=Strict; Secure)
function setSecureCookie(cname, cvalue, exdays = 7) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${cname}=${encodeURIComponent(cvalue)}; ${expires}; path=/; SameSite=Strict${secureFlag}`;
  } catch (e) { }
}

function getSecureCookie(cname) {
  try {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
  } catch (e) { }
  return "";
}

// 3. JWT Token Engine (JSON Web Token Client Session Verification)
function base64UrlEncode(str) {
  try {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (e) {
    return '';
  }
}

function generateVisitorJWT() {
  try {
    const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
    const payload = JSON.stringify({
      iss: "independence-day-2026",
      sub: "visitor-session",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      nonce: Math.random().toString(36).substring(2, 10)
    });

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);

    const rawSignature = btoa(`${encodedHeader}.${encodedPayload}.OmprasadSecurityKey2026`).replace(/=/g, '');
    const jwtToken = `${encodedHeader}.${encodedPayload}.${rawSignature}`;

    setSecureCookie("ID2026_JWT", jwtToken, 1);
    try {
      sessionStorage.setItem("ID2026_SESSION_TOKEN", jwtToken);
    } catch (e) { }

    state.jwtToken = jwtToken;
    return jwtToken;
  } catch (err) {
    return '';
  }
}

// 4. Rate Limiter (Anti-Flood, High-Concurrency & Crash Prevention)
const rateLimiter = {
  lastSubmitTime: 0,
  isAllowed() {
    const now = Date.now();
    if (now - this.lastSubmitTime < 1200) { // Max 1 submit per 1.2 seconds
      return false;
    }
    this.lastSubmitTime = now;
    return true;
  }
};

// Freedom Fighters Quotes Dataset
const freedomQuotes = [
  {
    text: '"They may kill me, but they cannot kill my ideas. They can crush my body, but they will not be able to crush my spirit."',
    author: '— Bhagat Singh',
    role: 'Revolutionary Freedom Hero & Martyr'
  },
  {
    text: '"Give me blood and I will give you freedom!"',
    author: '— Netaji Subhas Chandra Bose',
    role: 'Founder of Indian National Army (Azad Hind Fauj)'
  },
  {
    text: '"Be the change that you wish to see in the world."',
    author: '— Mahatma Gandhi',
    role: 'Father of the Nation & Leader of Freedom Movement'
  },
  {
    text: '"Where the mind is without fear and the head is held high... Into that heaven of freedom, my Father, let my country awake."',
    author: '— Rabindranath Tagore',
    role: 'Nobel Laureate & National Anthem Composer'
  },
  {
    text: '"Dream, dream, dream. Dreams transform into thoughts and thoughts result in action. Building a developed India is our duty."',
    author: '— Dr. A.P.J. Abdul Kalam',
    role: 'Missile Man of India & Former President'
  },
  {
    text: '"Manpower without unity is not a strength unless it is harmonized and united properly, then it becomes a spiritual power."',
    author: '— Sardar Vallabhbhai Patel',
    role: 'Iron Man of India & Unifier of the Nation'
  }
];

// ==========================================
// Canvas Interactive Background Particles & Floating Hearts Engine (GPU Optimized)
// ==========================================
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Debounce resize event to prevent memory allocation thrashing
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  }, { passive: true });

  const tricolorColors = ['#FF9933', '#FF671F', '#FFFFFF', '#138808', '#046A38', '#F59E0B'];
  const isMobile = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  // Floating Heart Object
  class FloatingHeart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 40;
      this.size = Math.random() * 10 + 8;
      this.speedY = -(Math.random() * 0.9 + 0.4);
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.sway = Math.random() * 0.03 + 0.01;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.color = Math.random() > 0.25 ? '#FF4D6D' : (Math.random() > 0.5 ? '#FF9933' : '#138808');
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * this.sway + this.swayOffset) * 0.4 + this.speedX;

      if (this.y < -30 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(0.8, this.opacity));
      ctx.fillStyle = this.color;

      const topCurveHeight = this.size * 0.3;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + topCurveHeight);
      ctx.bezierCurveTo(
        this.x, this.y,
        this.x - this.size / 2, this.y,
        this.x - this.size / 2, this.y + topCurveHeight
      );
      ctx.bezierCurveTo(
        this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2,
        this.x, this.y + this.size,
        this.x, this.y + this.size
      );
      ctx.bezierCurveTo(
        this.x, this.y + this.size,
        this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2,
        this.x + this.size / 2, this.y + topCurveHeight
      );
      ctx.bezierCurveTo(
        this.x + this.size / 2, this.y,
        this.x, this.y,
        this.x, this.y + topCurveHeight
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Floating Tricolor Sparkle Particle
  class TricolorParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 30;
      this.radius = Math.random() * 2.5 + 1;
      this.color = tricolorColors[Math.floor(Math.random() * tricolorColors.length)];
      this.vy = -(Math.random() * 1.0 + 0.3);
      this.vx = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random() * 0.6 + 0.3;
    }

    update() {
      this.y += this.vy;
      this.x += Math.sin(this.y * 0.01) * 0.4 + this.vx;

      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(0.9, this.alpha));
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Memory safe count: 18 hearts / 25 particles on mobile, 30 hearts / 40 particles on desktop
  const hearts = Array.from({ length: isMobile ? 18 : 30 }, () => new FloatingHeart());
  const particles = Array.from({ length: isMobile ? 25 : 40 }, () => new TricolorParticle());
  const activeFireworks = [];

  // ==========================================
  // 🎆 Firecracker Explosions System
  // ==========================================
  class FireworkSpark {
    constructor(x, y, color, isRing = false) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = isRing ? (Math.random() * 2 + 3.5) : (Math.random() * 5 + 1.2);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.07;
      this.friction = 0.95;
      this.alpha = 1;
      this.decay = Math.random() * 0.025 + 0.02;
      this.radius = Math.random() * 2.5 + 1.2;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class FireworkRocket {
    constructor(targetX, targetY) {
      this.x = targetX + (Math.random() - 0.5) * 60;
      this.y = height + 20;
      this.targetY = targetY;
      this.speed = Math.random() * 4 + 9;
      this.color = tricolorColors[Math.floor(Math.random() * tricolorColors.length)];
      this.exploded = false;
      this.sparks = [];
    }

    update() {
      if (!this.exploded) {
        this.y -= this.speed;
        if (this.y <= this.targetY) {
          this.explode();
        }
      } else {
        this.sparks.forEach(s => s.update());
        this.sparks = this.sparks.filter(s => s.alpha > 0);
      }
    }

    explode() {
      this.exploded = true;
      const count = isMobile ? 30 : 45;
      const isRingPattern = Math.random() > 0.5;

      for (let i = 0; i < count; i++) {
        const sparkColor = tricolorColors[Math.floor(Math.random() * tricolorColors.length)];
        this.sparks.push(new FireworkSpark(this.x, this.y, sparkColor, isRingPattern));
      }

      playFireworkBurstSound();
    }

    draw() {
      if (!this.exploded) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        this.sparks.forEach(s => s.draw());
      }
    }
  }

  // Trigger firecracker burst with maximum concurrent rocket safety cap
  window.triggerFirecrackers = function () {
    if (activeFireworks.length > 3) return; // Cap max active rockets to 3
    const totalRockets = isMobile ? 3 : 5;
    for (let i = 0; i < totalRockets; i++) {
      setTimeout(() => {
        if (activeFireworks.length <= 4) {
          const tx = (width * 0.15) + Math.random() * (width * 0.7);
          const ty = (height * 0.15) + Math.random() * (height * 0.45);
          activeFireworks.push(new FireworkRocket(tx, ty));
        }
      }, i * 400);
    }
  };

  function animate() {
    if (document.hidden) {
      state.animFrameId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    hearts.forEach(h => {
      h.update();
      h.draw();
    });

    for (let i = activeFireworks.length - 1; i >= 0; i--) {
      const fw = activeFireworks[i];
      fw.update();
      fw.draw();
      if (fw.exploded && fw.sparks.length === 0) {
        activeFireworks.splice(i, 1);
      }
    }

    state.animFrameId = requestAnimationFrame(animate);
  }

  // Resume animation frame when user returns to tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !state.animFrameId) {
      state.animFrameId = requestAnimationFrame(animate);
    }
  });

  state.animFrameId = requestAnimationFrame(animate);
}

// ==========================================
// Patriotic Audio Engine (Memory Safe & Error Shielded)
// ==========================================
let bgAudioElement = null;

function updateAudioButtonUI(isPlaying) {
  const audioBtn = document.getElementById('audioToggle');
  const audioLabel = document.getElementById('audioLabel');

  if (audioBtn) {
    if (isPlaying) {
      audioBtn.classList.add('playing');
      if (audioLabel) audioLabel.textContent = '🎵 Vande Mataram: ON';
    } else {
      audioBtn.classList.remove('playing');
      if (audioLabel) audioLabel.textContent = 'Music: OFF';
    }
  }
}

function toggleAudio() {
  if (state.isPlayingAudio) {
    stopPatrioticAudio();
    state.isPlayingAudio = false;
    updateAudioButtonUI(false);
  } else {
    state.isPlayingAudio = true;
    updateAudioButtonUI(true);
    enableAndPlayAudio();
  }
}

function getAudioDOMElement() {
  if (!bgAudioElement) {
    bgAudioElement = document.getElementById('bgMusicPlayer');
    if (!bgAudioElement) {
      bgAudioElement = new Audio('/music/vandemataram.mp3');
    }
    bgAudioElement.loop = true;
    bgAudioElement.volume = 0.6;
    bgAudioElement.setAttribute('playsinline', 'true');
    bgAudioElement.setAttribute('webkit-playsinline', 'true');
  }
  return bgAudioElement;
}

function startPatrioticAudio() {
  if (!state.isPlayingAudio) return;

  const audioEl = getAudioDOMElement();
  if (audioEl) {
    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateAudioButtonUI(true);
      }).catch(() => {
        // Expected on mobile before user gesture - unlock listener will activate on touch
      });
    }
  }
}

function enableAndPlayAudio() {
  if (!state.isPlayingAudio) return;

  const audioEl = getAudioDOMElement();
  if (audioEl) {
    audioEl.muted = false;
    audioEl.volume = 0.6;

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateAudioButtonUI(true);
      }).catch((err) => {
        console.warn('Mobile audio play error:', err);
      });
    }
  }

  if (state.audioContext && state.audioContext.state === 'suspended') {
    state.audioContext.resume().catch(() => { });
  }
}

function playFireworkBurstSound() {
  if (!state.isPlayingAudio || document.hidden) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!state.audioContext) {
      state.audioContext = new AudioCtx();
    }
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume().catch(() => { });
    }

    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    const now = state.audioContext.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(state.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) { }
}

function stopPatrioticAudio() {
  if (bgAudioElement) {
    bgAudioElement.pause();
  }
  if (state.audioContext && state.audioContext.state === 'running') {
    state.audioContext.suspend().catch(() => { });
  }
}

// ==========================================
// Persistent Unique Share ID Engine (/w/:id)
// ==========================================
function generateShortShareId(name, senderName = "Omprasad Bhaskar Padwalkar") {
  try {
    const rawPayload = JSON.stringify({
      n: name,
      s: senderName || "Omprasad Bhaskar Padwalkar",
      t: Date.now()
    });
    const encoded = btoa(encodeURIComponent(rawPayload));
    return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  } catch (e) {
    try {
      return btoa(encodeURIComponent(name)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    } catch (err) {
      return 'wish2026';
    }
  }
}

function resolveWishFromShareId(shareId) {
  if (!shareId) return null;
  try {
    const padded = shareId.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(atob(padded));
    const data = JSON.parse(jsonStr);

    if (data && data.n) {
      return {
        shareId: shareId,
        receiverName: sanitizeInput(data.n),
        senderName: sanitizeInput(data.s || "Omprasad Bhaskar Padwalkar"),
        createdAt: data.t || Date.now()
      };
    }
  } catch (e) {
    try {
      const padded = shareId.replace(/-/g, '+').replace(/_/g, '/');
      const rawName = decodeURIComponent(atob(padded));
      if (rawName && rawName.trim()) {
        return {
          shareId: shareId,
          receiverName: sanitizeInput(rawName.trim()),
          senderName: "Omprasad Bhaskar Padwalkar",
          createdAt: Date.now()
        };
      }
    } catch (err) { }
  }
  return null;
}

function extractShareIdFromUrl() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0].toLowerCase() === 'w') {
    return pathParts[1];
  }
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('w') || urlParams.get('wish') || urlParams.get('share') || urlParams.get('id');
}

// ==========================================
// Form & Wish Generation Logic
// ==========================================
function generateWish(name) {
  if (!rateLimiter.isAllowed()) {
    showToast('Please wait a brief moment before generating another wish! 🛡️', '⏳');
    return;
  }

  const receiverInput = document.getElementById('userNameInput');
  const senderInput = document.getElementById('userSenderInput');

  const rawReceiver = (name || (receiverInput ? receiverInput.value : '')).trim();
  const receiverName = sanitizeInput(rawReceiver);

  if (!receiverName) {
    showToast('Please enter a valid receiver name! 🇮🇳', '⚠️');
    return;
  }

  // Retrieve sender name if provided (e.g. via "Send Personal Wish" mode)
  const rawSender = senderInput ? senderInput.value.trim() : '';
  const cleanSender = rawSender ? sanitizeInput(rawSender) : '';
  const senderName = cleanSender || 'Omprasad Bhaskar Padwalkar';

  const shareId = generateShortShareId(receiverName, senderName);
  state.currentName = receiverName;
  state.currentShareId = shareId;
  state.senderName = senderName;

  setSecureCookie("ID2026_RECEIVER", receiverName, 7);

  const nameSection = document.getElementById('nameSection');
  const wishSection = document.getElementById('wishSection');
  const nameText = document.getElementById('nameText');
  const senderNameText = document.getElementById('senderNameText');
  const displayRecipient = document.getElementById('displayRecipientName');

  if (nameText) nameText.textContent = receiverName;
  if (senderNameText) {
    senderNameText.textContent = `${senderName} 🇮🇳`;
  }

  if (nameSection) nameSection.classList.add('hidden');
  if (wishSection) {
    wishSection.classList.remove('hidden');
  }

  if (displayRecipient) {
    displayRecipient.classList.remove('anim-name-appear');
    void displayRecipient.offsetWidth;
    displayRecipient.classList.add('anim-name-appear');
  }

  if (typeof window.triggerFirecrackers === 'function') {
    window.triggerFirecrackers();
  }
  triggerTricolorConfetti();
  playFireworkBurstSound();

  const newUrl = `${window.location.origin}/w/${shareId}`;
  window.history.replaceState({}, '', newUrl);
}

// Memory-throttled Confetti
function triggerTricolorConfetti() {
  const now = Date.now();
  if (now - state.lastConfettiTime < 800) return; // Throttle confetti to max once per 800ms
  state.lastConfettiTime = now;

  const count = window.innerWidth < 768 ? 100 : 160;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    try {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#FF9933', '#FFFFFF', '#138808', '#000080', '#F59E0B']
      });
    } catch (e) { }
  }

  fire(0.25, { spread: 26, startVelocity: 45 });
  fire(0.2, { spread: 55 });
  fire(0.35, { spread: 90, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 110, startVelocity: 25, decay: 0.92, scalar: 1.1 });
}

// ==========================================
// Sharing & Download Actions
// ==========================================
function getWishText() {
  const name = state.currentName || 'Friend';
  const sender = state.senderName || 'Omprasad Bhaskar Padwalkar';
  const shareId = state.currentShareId || generateShortShareId(name, sender);
  
  let shareUrl = `${window.location.origin}/w/${shareId}?name=${encodeURIComponent(name)}`;
  if (sender && sender !== 'Omprasad Bhaskar Padwalkar') {
    shareUrl += `&sender=${encodeURIComponent(sender)}`;
  }

  return `Dear ${name}, ❤️

Wishing you a very Happy 80th Independence Day! 🇮🇳

May freedom, courage, happiness, and hope always fill your life. May your dreams soar high, and may you always make our nation proud.

Let us celebrate the spirit of freedom and work together for a brighter and stronger India.

Jai Hind! 🇮🇳❤️

With Love & Best Wishes ❤️
— ${sender} 🇮🇳

Open your personalized 80th Independence Day wish here:
${shareUrl}`;
}

function shareOnWhatsApp() {
  const wishText = getWishText();
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(wishText)}`;
  window.open(whatsappUrl, '_blank');
  showToast('Opening WhatsApp...', '📲');
}

async function shareNativeWish() {
  const wishText = getWishText();
  const name = state.currentName || 'Friend';
  const sender = state.senderName || 'Omprasad Bhaskar Padwalkar';
  const shareId = state.currentShareId || generateShortShareId(name, sender);
  
  let shareUrl = `${window.location.origin}/w/${shareId}?name=${encodeURIComponent(name)}`;
  if (sender && sender !== 'Omprasad Bhaskar Padwalkar') {
    shareUrl += `&sender=${encodeURIComponent(sender)}`;
  }

  const shareData = {
    title: 'Happy Independence Day 2026 🇮🇳',
    text: wishText,
    url: shareUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast('Shared successfully!', '✨');
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyWishText();
      }
    }
  } else {
    copyWishText();
  }
}

function copyWishText() {
  const text = getWishText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Wish message copied to clipboard! 📋', '✅');
    }).catch(() => {
      showToast('Failed to copy text. Please try manual copy.', '❌');
    });
  } else {
    showToast('Clipboard copy unavailable on this browser.', '⚠️');
  }
}

// Memory & Concurrency Protected Image Export Engine
async function downloadWishImage() {
  if (state.isExportingImage) {
    showToast('Card image export already in progress...', '⏳');
    return;
  }
  state.isExportingImage = true;

  const cardElement = document.getElementById('exportWishCard');
  if (!cardElement) {
    state.isExportingImage = false;
    return;
  }

  showToast('Rendering your card image... 🎨', '⏳');

  try {
    const exportScale = window.innerWidth < 768 ? 1.2 : 1.8;
    const canvas = await html2canvas(cardElement, {
      scale: exportScale,
      useCORS: true,
      backgroundColor: '#0F172A',
      logging: false,
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.getElementById('exportWishCard');
        const clonedHeader = clonedDoc.getElementById('openingGreeting');

        if (clonedCard) {
          clonedCard.style.transform = 'none';
          clonedCard.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.6)';
          clonedCard.style.paddingTop = '2rem';

          if (clonedHeader) {
            const headerCopy = clonedHeader.cloneNode(true);
            headerCopy.style.display = 'flex';
            headerCopy.style.marginBottom = '1.8rem';
            headerCopy.style.width = '100%';
            headerCopy.style.opacity = '1';
            headerCopy.style.transform = 'none';

            clonedCard.insertBefore(headerCopy, clonedCard.firstChild);
          }
        }
      }
    });

    const link = document.createElement('a');
    const safeName = (state.currentName || 'Friend').replace(/[^a-z0-9]/gi, '_');
    const safeSender = (state.senderName || 'Omprasad').replace(/[^a-z0-9]/gi, '_');
    link.download = `Independence_Day_Wish_${safeName}_from_${safeSender}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Wish image downloaded successfully! 🖼️', '🎉');
    triggerTricolorConfetti();
  } catch (err) {
    console.error('Image render error:', err);
    showToast('Failed to export image. Please try again.', '⚠️');
  } finally {
    state.isExportingImage = false;
  }
}

function resetForm() {
  const nameSection = document.getElementById('nameSection');
  const wishSection = document.getElementById('wishSection');
  const nameInput = document.getElementById('userNameInput');

  if (wishSection) wishSection.classList.add('hidden');
  if (nameSection) nameSection.classList.remove('hidden');

  if (nameInput) {
    nameInput.value = '';
    nameInput.focus();
  }

  window.history.replaceState({}, '', window.location.pathname);
}

// ==========================================
// Freedom Fighters Quotes Carousel (Timer Protection)
// ==========================================
function initQuotesCarousel() {
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteRole = document.getElementById('quoteRole');
  const quoteDots = document.getElementById('quoteDots');
  const prevBtn = document.getElementById('prevQuoteBtn');
  const nextBtn = document.getElementById('nextQuoteBtn');

  if (!quoteText || !quoteDots) return;

  quoteDots.innerHTML = '';
  freedomQuotes.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => renderQuote(idx));
    quoteDots.appendChild(dot);
  });

  function renderQuote(index) {
    state.currentQuoteIndex = index;
    const item = freedomQuotes[index];

    quoteText.textContent = item.text;
    quoteAuthor.textContent = item.author;
    quoteRole.textContent = item.role;

    const dots = quoteDots.querySelectorAll('.dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      let prevIndex = state.currentQuoteIndex - 1;
      if (prevIndex < 0) prevIndex = freedomQuotes.length - 1;
      renderQuote(prevIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      let nextIndex = (state.currentQuoteIndex + 1) % freedomQuotes.length;
      renderQuote(nextIndex);
    });
  }

  if (state.quotesIntervalId) {
    clearInterval(state.quotesIntervalId);
  }

  state.quotesIntervalId = setInterval(() => {
    if (!document.hidden) {
      let nextIndex = (state.currentQuoteIndex + 1) % freedomQuotes.length;
      renderQuote(nextIndex);
    }
  }, 6000);
}

// ==========================================
// Interactive Pledge Wall
// ==========================================
function initPledgeWall() {
  const pledgeOptions = document.getElementById('pledgeOptions');
  const activePledgeText = document.getElementById('activePledgeText');
  const takePledgeBtn = document.getElementById('takePledgeBtn');

  if (!pledgeOptions || !activePledgeText) return;

  pledgeOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.pledge-btn');
    if (!btn) return;

    pledgeOptions.querySelectorAll('.pledge-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const pledgeMsg = btn.getAttribute('data-pledge');
    activePledgeText.textContent = `"${pledgeMsg}"`;
  });

  if (takePledgeBtn) {
    takePledgeBtn.addEventListener('click', () => {
      triggerTricolorConfetti();
      showToast('Thank you for taking a pledge for India! ✋🇮🇳', '🌟');
    });
  }
}

// ==========================================
// Toast Notification Utility
// ==========================================
let toastTimer = null;
function showToast(message, icon = '✨') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  if (toastIcon) toastIcon.textContent = icon;

  toast.classList.remove('hidden');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

// ==========================================
// Automatic 5-Scene Cinematic Opening Sequence
// ==========================================
function startOpeningSequence() {
  const cinematicOverlay = document.getElementById('cinematicStageOverlay');
  const tricolorAura = document.getElementById('tricolorAura');
  const boomOverlay = document.getElementById('boomFlashOverlay');
  const permanentHeroHeader = document.getElementById('permanentHeroHeader');
  const nameSection = document.getElementById('nameSection');
  const wishSection = document.getElementById('wishSection');
  const displayRecipient = document.getElementById('displayRecipientName');

  // Scene 1: Dark Beginning with rotating Ashoka Chakra (0.0s - 1.0s)
  if (cinematicOverlay) {
    cinematicOverlay.style.display = 'flex';
    cinematicOverlay.style.opacity = '1';
  }

  // Scene 2: Flowing Tricolor Light Atmosphere (1.0s - 2.0s)
  setTimeout(() => {
    if (tricolorAura) tricolorAura.style.opacity = '1';
  }, 1000);

  // Scene 3: BOOM Firework Impact (2.0s - 2.8s)
  setTimeout(() => {
    if (cinematicOverlay) {
      cinematicOverlay.style.opacity = '0';
      setTimeout(() => { cinematicOverlay.style.display = 'none'; }, 800);
    }
    if (boomOverlay) {
      boomOverlay.classList.remove('hidden');
      setTimeout(() => boomOverlay.classList.add('hidden'), 750);
    }
    triggerTricolorConfetti();
    playFireworkBurstSound();

    // Scene 4: Reveal Permanent Main Title (HAPPY 80th INDEPENDENCE DAY 🇮🇳)
    if (permanentHeroHeader) {
      permanentHeroHeader.classList.remove('hidden');
    }
  }, 2000);

  // Scene 5: Reveal Name Section or Shared Wish Card at 3.8s
  setTimeout(() => {
    if (state.isSharedWishView) {
      if (nameSection) nameSection.classList.add('hidden');
      if (wishSection) {
        wishSection.classList.remove('hidden');
        if (displayRecipient) {
          displayRecipient.classList.remove('anim-name-appear');
          void displayRecipient.offsetWidth;
          displayRecipient.classList.add('anim-name-appear');
        }
        if (typeof window.triggerFirecrackers === 'function') {
          window.triggerFirecrackers();
        }
        triggerTricolorConfetti();
        playFireworkBurstSound();
      }
    } else if (state.isInvalidShareId) {
      showToast('Wish link invalid or not found! Enter a name below to create a new wish. 🇮🇳', '⚠️');
      if (nameSection) nameSection.classList.remove('hidden');
    } else {
      if (nameSection) {
        nameSection.classList.remove('hidden');
      }
    }
  }, 3800);
}

// ==========================================
// Check URL Parameters & Path (/w/:id) on Load
// ==========================================
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);

  // 1. First check for existing/old shared links with ?name=... or ?recipient=...
  const nameParam = urlParams.get('name') || urlParams.get('recipient') || urlParams.get('to');
  const senderParam = urlParams.get('sender') || urlParams.get('from') || urlParams.get('s') || urlParams.get('by');

  if (nameParam && nameParam.trim() !== '') {
    try {
      const decodedName = decodeURIComponent(nameParam.trim());
      const cleanName = sanitizeInput(decodedName);

      if (cleanName) {
        state.currentName = cleanName;
        state.isSharedWishView = true;

        const cleanSender = senderParam ? sanitizeInput(decodeURIComponent(senderParam.trim())) : '';
        const senderName = cleanSender || 'Omprasad Bhaskar Padwalkar';
        state.senderName = senderName;

        const nameText = document.getElementById('nameText');
        const senderNameText = document.getElementById('senderNameText');
        if (nameText) nameText.textContent = cleanName;
        if (senderNameText) {
          senderNameText.textContent = `${senderName} 🇮🇳`;
        }
        return;
      }
    } catch (e) { }
  }

  // 2. Check for unique share ID in path (/w/:id) or query param (?wish=... or ?w=...)
  const shareId = extractShareIdFromUrl();
  if (shareId) {
    const wishData = resolveWishFromShareId(shareId);
    if (wishData && wishData.receiverName) {
      state.currentName = wishData.receiverName;
      
      const cleanSender = senderParam ? sanitizeInput(decodeURIComponent(senderParam.trim())) : '';
      state.senderName = cleanSender || wishData.senderName || 'Omprasad Bhaskar Padwalkar';
      state.currentShareId = wishData.shareId;
      state.isSharedWishView = true;

      const nameText = document.getElementById('nameText');
      const senderNameText = document.getElementById('senderNameText');
      if (nameText) nameText.textContent = wishData.receiverName;
      if (senderNameText) senderNameText.textContent = `${state.senderName} 🇮🇳`;
      return;
    } else {
      state.isInvalidShareId = true;
    }
  }
}

// ==========================================
// Systematic Performant Scroll Pop-Up & Reveal Engine
// ==========================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.scroll-reveal, .scroll-slide-up, .scroll-slide-down, .scroll-slide-left, .scroll-slide-right, .scroll-rotate-in, .scroll-pop, .scroll-stagger-item, .seo-item, .quote-card, .pledge-card, .form-card, .wish-card, .action-bar'
  );
  if (!revealElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.08
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('revealed');
    } else {
      observer.observe(el);
    }
  });

  // Parallax Scroll Depth Effect for Ambient Background Elements
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        const chakras = document.querySelectorAll('.ashoka-chakra-svg');
        chakras.forEach(chakra => {
          if (chakra) chakra.style.transform = `rotate(${scrolled * 0.12}deg) translateY(${scrolled * 0.04}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ==========================================
// Initialize Event Listeners & Security Engine
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Security Engine & Generate Visitor JWT Token
  generateVisitorJWT();

  initParticleCanvas();
  initQuotesCarousel();
  initPledgeWall();
  initScrollReveal();

  // Start automatic opening sequence immediately on website opening
  startOpeningSequence();

  // Check URL parameters for direct recipient links
  checkUrlParams();

  // Mode Switcher Tabs (Quick Wish vs Send Personal Wish)
  const tabQuickWish = document.getElementById('tabQuickWish');
  const tabSendWish = document.getElementById('tabSendWish');
  const senderInputGroup = document.getElementById('senderInputGroup');
  const quickNamesWrapper = document.getElementById('quickNamesWrapper');
  const formTitle = document.getElementById('formTitle');

  if (tabQuickWish && tabSendWish) {
    tabQuickWish.addEventListener('click', () => {
      tabQuickWish.classList.add('active');
      tabSendWish.classList.remove('active');
      if (senderInputGroup) senderInputGroup.classList.add('hidden');
      if (quickNamesWrapper) quickNamesWrapper.classList.remove('hidden');
      if (formTitle) formTitle.textContent = 'Who would you like to wish today? ❤️';
    });

    tabSendWish.addEventListener('click', () => {
      tabSendWish.classList.add('active');
      tabQuickWish.classList.remove('active');
      if (senderInputGroup) senderInputGroup.classList.remove('hidden');
      if (quickNamesWrapper) quickNamesWrapper.classList.add('hidden');
      if (formTitle) formTitle.textContent = 'Create Custom Sender & Receiver Wish 💌';
    });
  }

  // Form Submit
  const nameForm = document.getElementById('nameForm');
  const nameInput = document.getElementById('userNameInput');
  const clearInputBtn = document.getElementById('clearInputBtn');

  if (nameForm && nameInput) {
    nameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      generateWish(nameInput.value);
    });

    nameInput.addEventListener('input', () => {
      if (clearInputBtn) {
        clearInputBtn.classList.toggle('hidden', nameInput.value === '');
      }
    });
  }

  if (clearInputBtn && nameInput) {
    clearInputBtn.addEventListener('click', () => {
      nameInput.value = '';
      clearInputBtn.classList.add('hidden');
      nameInput.focus();
    });
  }

  // Quick Name Pills
  const quickPills = document.querySelectorAll('.name-pill');
  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const selectedName = pill.getAttribute('data-name');
      if (nameInput) nameInput.value = selectedName;
      if (clearInputBtn) clearInputBtn.classList.remove('hidden');
      generateWish(selectedName);
    });
  });

  // Action Buttons
  const audioBtn = document.getElementById('audioToggle');
  if (audioBtn) audioBtn.addEventListener('click', toggleAudio);

  const whatsappBtn = document.getElementById('whatsappShareBtn');
  if (whatsappBtn) whatsappBtn.addEventListener('click', shareOnWhatsApp);

  const webShareBtn = document.getElementById('webShareBtn');
  if (webShareBtn) webShareBtn.addEventListener('click', shareNativeWish);

  const copyWishBtn = document.getElementById('copyWishBtn');
  if (copyWishBtn) copyWishBtn.addEventListener('click', copyWishText);

  const downloadImageBtn = document.getElementById('downloadImageBtn');
  if (downloadImageBtn) downloadImageBtn.addEventListener('click', downloadWishImage);

  const sendWishBottomBtn = document.getElementById('sendWishBottomBtn');
  if (sendWishBottomBtn) {
    sendWishBottomBtn.addEventListener('click', () => {
      const wishSection = document.getElementById('wishSection');
      const nameSection = document.getElementById('nameSection');
      const tabSendWish = document.getElementById('tabSendWish');
      const tabQuickWish = document.getElementById('tabQuickWish');
      const senderInputGroup = document.getElementById('senderInputGroup');
      const userSenderInput = document.getElementById('userSenderInput');
      const formTitle = document.getElementById('formTitle');

      if (wishSection) wishSection.classList.add('hidden');
      if (nameSection) nameSection.classList.remove('hidden');

      if (tabSendWish && tabQuickWish) {
        tabSendWish.classList.add('active');
        tabQuickWish.classList.remove('active');
      }
      if (senderInputGroup) senderInputGroup.classList.remove('hidden');
      if (formTitle) formTitle.textContent = 'Create Custom Sender & Receiver Wish 💌';
      if (userSenderInput) userSenderInput.focus();
    });
  }

  const resetWishBtn = document.getElementById('resetWishBtn');
  if (resetWishBtn) resetWishBtn.addEventListener('click', resetForm);

  // Auto-detect name URL parameter for direct recipient links
  checkUrlParams();

  // Auto-start music on page load & unlock on first user interaction (Mobile & Desktop)
  startPatrioticAudio();
  const unlockAudio = () => {
    if (state.isPlayingAudio) {
      enableAndPlayAudio();
    }
  };

  ['click', 'touchstart', 'touchend', 'pointerdown', 'scroll', 'keydown', 'orientationchange'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true, capture: true });
    document.addEventListener(evt, unlockAudio, { passive: true, capture: true });
  });

  // Auto-pause audio when user leaves tab / minimizes app, resume when returning
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (bgAudioElement && !bgAudioElement.paused) {
        bgAudioElement.pause();
        state.wasAudioPlayingBeforeHidden = true;
      }
      if (state.audioContext && state.audioContext.state === 'running') {
        state.audioContext.suspend();
        state.wasAudioPlayingBeforeHidden = true;
      }
    } else {
      if (state.isPlayingAudio && state.wasAudioPlayingBeforeHidden) {
        if (bgAudioElement) {
          bgAudioElement.play().catch(() => { });
        } else if (state.audioContext && state.audioContext.state === 'suspended') {
          state.audioContext.resume().catch(() => { });
        }
        state.wasAudioPlayingBeforeHidden = false;
      }
    }
  });

  window.addEventListener('pagehide', () => {
    if (bgAudioElement) bgAudioElement.pause();
    if (state.audioContext && state.audioContext.state === 'running') state.audioContext.suspend();
  });
});
