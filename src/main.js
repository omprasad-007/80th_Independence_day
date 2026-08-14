import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';

// ==========================================
// Application State & Constants
// ==========================================
const state = {
  currentName: '',
  isPlayingAudio: false,
  audioContext: null,
  activeOscillators: [],
  currentQuoteIndex: 0,
  pledgeCount: 1947
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
// Canvas Interactive Background Particles & Floating Hearts Engine
// ==========================================
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const tricolorColors = ['#FF9933', '#FF671F', '#FFFFFF', '#138808', '#046A38', '#F59E0B'];

  // Floating Heart Object
  class FloatingHeart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 40;
      this.size = Math.random() * 12 + 8; // Size between 8px and 20px
      this.speedY = -(Math.random() * 1.0 + 0.5); // Smooth upward float
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.sway = Math.random() * 0.03 + 0.01;
      this.swayOffset = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.6 + 0.25;
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
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;

      // Draw heart path
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
      this.radius = Math.random() * 3 + 1;
      this.color = tricolorColors[Math.floor(Math.random() * tricolorColors.length)];
      this.vy = -(Math.random() * 1.2 + 0.4);
      this.vx = (Math.random() - 0.5) * 0.8;
      this.alpha = Math.random() * 0.6 + 0.3;
    }

    update() {
      this.y += this.vy;
      this.x += Math.sin(this.y * 0.01) * 0.5 + this.vx;

      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0.1, Math.min(0.9, this.alpha));
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const hearts = Array.from({ length: 35 }, () => new FloatingHeart());
  const particles = Array.from({ length: 45 }, () => new TricolorParticle());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw particles first, then glowing hearts
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    hearts.forEach(h => {
      h.update();
      h.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================
// Web Audio API Patriotic Ambient Synthesizer
// ==========================================
function toggleAudio() {
  const audioBtn = document.getElementById('audioToggle');
  const audioLabel = document.getElementById('audioLabel');

  if (state.isPlayingAudio) {
    // Stop Audio
    stopPatrioticAudio();
    state.isPlayingAudio = false;
    audioBtn.classList.remove('playing');
    if (audioLabel) audioLabel.textContent = 'Music: OFF';
  } else {
    // Start Audio
    startPatrioticAudio();
    state.isPlayingAudio = true;
    audioBtn.classList.add('playing');
    if (audioLabel) audioLabel.textContent = 'Music: ON 🎵';
    showToast('🎵 Playing Ambient Patriotic Soundscape...', '🎶');
  }
}

function startPatrioticAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!state.audioContext) {
      state.audioContext = new AudioContextClass();
    }

    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }

    // Pentatonic / Raga Desh frequencies (D, E, F#, G, A, B, C#)
    const notes = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33];
    
    // Master gain
    const masterGain = state.audioContext.createGain();
    masterGain.gain.setValueAtTime(0.12, state.audioContext.currentTime);
    masterGain.connect(state.audioContext.destination);

    // Create a drone pad + gentle melody loop using Web Audio API
    let step = 0;
    const playNote = () => {
      if (!state.isPlayingAudio || !state.audioContext) return;

      const osc = state.audioContext.createOscillator();
      const noteGain = state.audioContext.createGain();

      const freq = notes[step % notes.length];
      osc.type = step % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, state.audioContext.currentTime);

      const now = state.audioContext.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.08, now + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.6);

      step++;
      if (state.isPlayingAudio) {
        setTimeout(playNote, 1200 + Math.random() * 800);
      }
    };

    playNote();

  } catch (err) {
    console.warn('Web Audio synthesis prevented:', err);
  }
}

function stopPatrioticAudio() {
  if (state.audioContext) {
    state.audioContext.suspend();
  }
}

// ==========================================
// Form & Wish Generation Logic
// ==========================================
function generateWish(name) {
  if (!name || name.trim() === '') {
    showToast('Please enter your name to generate your wish! 🇮🇳', '⚠️');
    return;
  }

  const cleanName = name.trim();
  state.currentName = cleanName;

  // Update Display Elements
  const displayRecipient = document.getElementById('displayRecipientName');
  const nameText = document.getElementById('nameText');
  
  if (displayRecipient && nameText) {
    nameText.textContent = cleanName;
  }

  // Hide Form, Show Wish Card
  const formSection = document.getElementById('formSection');
  const wishSection = document.getElementById('wishSection');

  if (formSection && wishSection) {
    formSection.classList.add('hidden');
    wishSection.classList.remove('hidden');

    // Scroll smoothly to wish card
    wishSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Trigger Tricolor Confetti Burst!
  triggerTricolorConfetti();

  // Update URL search param for direct sharing capability
  const newUrl = `${window.location.pathname}?name=${encodeURIComponent(cleanName)}`;
  window.history.replaceState({ path: newUrl }, '', newUrl);
}

function triggerTricolorConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#FF9933', '#FFFFFF', '#138808', '#000080', '#F59E0B']
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// ==========================================
// Sharing & Download Actions
// ==========================================
function getWishText() {
  return `Dear ${state.currentName || 'Friend'}, ❤️

Wishing you a very Happy 80th Independence Day! 🇮🇳

May the spirit of freedom, unity, courage, and hope always remain in your heart. May your dreams fly as high as our Tiranga, and may we continue to build a stronger, brighter, and better India together.

Jai Hind! 🇮🇳❤️

With Love & Best Wishes ❤️
— Omprasad Bhaskar Padwalkar 🇮🇳

Generate your personalized 80th Independence Day wish here:
${window.location.origin}${window.location.pathname}?name=${encodeURIComponent(state.currentName || '')}`;
}

function shareOnWhatsApp() {
  const wishText = getWishText();
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(wishText)}`;
  window.open(whatsappUrl, '_blank');
  showToast('Opening WhatsApp...', '📲');
}

async function shareNativeWish() {
  const wishText = getWishText();
  const shareData = {
    title: 'Happy Independence Day 2026 🇮🇳',
    text: wishText,
    url: window.location.href
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
  navigator.clipboard.writeText(text).then(() => {
    showToast('Wish message copied to clipboard! 📋', '✅');
  }).catch(() => {
    showToast('Failed to copy text. Please try manual copy.', '❌');
  });
}

async function downloadWishImage() {
  const cardElement = document.getElementById('exportWishCard');
  if (!cardElement) return;

  showToast('Rendering your card image... 🎨', '⏳');

  try {
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0F172A',
      logging: false,
      onclone: (clonedDoc) => {
        const clonedCard = clonedDoc.getElementById('exportWishCard');
        if (clonedCard) {
          clonedCard.style.transform = 'none';
          clonedCard.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.6)';
        }
      }
    });

    const link = document.createElement('a');
    const safeName = (state.currentName || 'Friend').replace(/[^a-z0-9]/gi, '_');
    link.download = `Independence_Day_Wish_${safeName}_Omprasad.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Wish image downloaded successfully! 🖼️', '🎉');
    triggerTricolorConfetti();
  } catch (err) {
    console.error('Image render error:', err);
    showToast('Failed to export image. Please try again.', '⚠️');
  }
}

function resetForm() {
  const formSection = document.getElementById('formSection');
  const wishSection = document.getElementById('wishSection');
  const nameInput = document.getElementById('userNameInput');

  if (formSection && wishSection) {
    wishSection.classList.add('hidden');
    formSection.classList.remove('hidden');
  }

  if (nameInput) {
    nameInput.value = '';
    nameInput.focus();
  }

  // Clear query string
  window.history.replaceState({}, '', window.location.pathname);
}

// ==========================================
// Freedom Fighters Quotes Carousel
// ==========================================
function initQuotesCarousel() {
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteRole = document.getElementById('quoteRole');
  const quoteDots = document.getElementById('quoteDots');
  const prevBtn = document.getElementById('prevQuoteBtn');
  const nextBtn = document.getElementById('nextQuoteBtn');

  if (!quoteText || !quoteDots) return;

  // Create dot indicators
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

    // Update dots
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

  // Auto-advance quote every 6 seconds
  setInterval(() => {
    let nextIndex = (state.currentQuoteIndex + 1) % freedomQuotes.length;
    renderQuote(nextIndex);
  }, 6000);
}

// ==========================================
// Interactive Pledge Wall
// ==========================================
function initPledgeWall() {
  const pledgeCountEl = document.getElementById('pledgeCount');
  const pledgeOptions = document.getElementById('pledgeOptions');
  const activePledgeText = document.getElementById('activePledgeText');
  const takePledgeBtn = document.getElementById('takePledgeBtn');

  if (!pledgeOptions || !activePledgeText) return;

  // Load count from localStorage
  const savedCount = localStorage.getItem('india_pledge_count');
  if (savedCount) {
    state.pledgeCount = parseInt(savedCount, 10);
  }
  if (pledgeCountEl) {
    pledgeCountEl.textContent = state.pledgeCount.toLocaleString('en-IN');
  }

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
      state.pledgeCount++;
      localStorage.setItem('india_pledge_count', state.pledgeCount);
      if (pledgeCountEl) {
        pledgeCountEl.textContent = state.pledgeCount.toLocaleString('en-IN');
      }

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
// Check URL Parameters on Load
// ==========================================
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const nameParam = urlParams.get('name');

  if (nameParam && nameParam.trim() !== '') {
    const nameInput = document.getElementById('userNameInput');
    if (nameInput) nameInput.value = nameParam;
    generateWish(nameParam);
  }
}

// ==========================================
// Initialize Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initQuotesCarousel();
  initPledgeWall();

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

  const resetWishBtn = document.getElementById('resetWishBtn');
  if (resetWishBtn) resetWishBtn.addEventListener('click', resetForm);

  // Check URL params for direct shared links
  checkUrlParams();
});
