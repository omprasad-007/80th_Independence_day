import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';

// ==========================================
// Application State & Constants
// ==========================================
const state = {
  currentName: '',
  isPlayingAudio: true,
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
      const speed = isRing ? (Math.random() * 2 + 4) : (Math.random() * 6 + 1.5);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.08;
      this.friction = 0.95;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.radius = Math.random() * 3 + 1.5;
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
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
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
      this.speed = Math.random() * 4 + 10;
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
      const count = 55;
      const isRingPattern = Math.random() > 0.5;

      for (let i = 0; i < count; i++) {
        const sparkColor = tricolorColors[Math.floor(Math.random() * tricolorColors.length)];
        this.sparks.push(new FireworkSpark(this.x, this.y, sparkColor, isRingPattern));
      }

      // Play soft festive burst sound if music is enabled
      playFireworkBurstSound();
    }

    draw() {
      if (!this.exploded) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        this.sparks.forEach(s => s.draw());
      }
    }
  }

  // Trigger multi-stage firecracker burst (3 to 5 seconds)
  window.triggerFirecrackers = function() {
    const totalRockets = 8;
    for (let i = 0; i < totalRockets; i++) {
      setTimeout(() => {
        const tx = (width * 0.15) + Math.random() * (width * 0.7);
        const ty = (height * 0.15) + Math.random() * (height * 0.45);
        activeFireworks.push(new FireworkRocket(tx, ty));
      }, i * 450);
    }
  };

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw background particles & hearts
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    hearts.forEach(h => {
      h.update();
      h.draw();
    });

    // Draw active fireworks
    for (let i = activeFireworks.length - 1; i >= 0; i--) {
      const fw = activeFireworks[i];
      fw.update();
      fw.draw();
      if (fw.exploded && fw.sparks.length === 0) {
        activeFireworks.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================
// Patriotic Instrumental Audio Engine (Audio File + Web Audio Synthesizer Fallback)
// ==========================================
let bgAudioElement = null;

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
    if (audioLabel) audioLabel.textContent = '🎵 Vande Mataram: ON';
  }
}

function startPatrioticAudio() {
  const mobileAudio = document.getElementById('mobileBgAudio');
  
  if (mobileAudio) {
    mobileAudio.volume = 0.5;
    mobileAudio.play().then(() => {
      showToast('🎵 Playing Vande Mataram Audio Track... 🇮🇳', '🎶');
    }).catch(() => {
      // If HTML5 audio is blocked by mobile autoplay policy, fallback to AudioContext or retry on touch
      startSynthesizedVandeMataram();
    });
    return;
  }

  const candidateAudioPaths = [
    '/music/vandemataram ringtone.mpeg',
    '/music/vandemataram_ringtone.mpeg',
    '/music/vandemataram ringtone.mp3',
    '/music/vandemataram_ringtone.mp3',
    '/music/vandemataram.mp3',
    '/music/vande_mataram.mp3'
  ];

  if (!bgAudioElement) {
    bgAudioElement = new Audio();
    bgAudioElement.loop = true;
    bgAudioElement.volume = 0.45;
  }

  let trackIdx = 0;
  const tryNextTrack = () => {
    if (trackIdx >= candidateAudioPaths.length) {
      startSynthesizedVandeMataram();
      return;
    }

    bgAudioElement.src = candidateAudioPaths[trackIdx];
    bgAudioElement.play().then(() => {
      showToast('🎵 Playing Vande Mataram Audio Track... 🇮🇳', '🎶');
    }).catch(() => {
      trackIdx++;
      tryNextTrack();
    });
  };

  tryNextTrack();
}

function startSynthesizedVandeMataram() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!state.audioContext) {
      state.audioContext = new AudioContextClass();
    }

    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }

    // Master Volume Gain
    const masterGain = state.audioContext.createGain();
    masterGain.gain.setValueAtTime(0.18, state.audioContext.currentTime);
    masterGain.connect(state.audioContext.destination);

    // Continuous Indian Classical Tanpura / Drone (C4 + G4)
    const droneSa = state.audioContext.createOscillator();
    const dronePa = state.audioContext.createOscillator();
    const droneGain = state.audioContext.createGain();

    droneSa.type = 'sine';
    droneSa.frequency.setValueAtTime(261.63, state.audioContext.currentTime);
    dronePa.type = 'triangle';
    dronePa.frequency.setValueAtTime(392.00, state.audioContext.currentTime);

    droneGain.gain.setValueAtTime(0.04, state.audioContext.currentTime);
    droneSa.connect(droneGain);
    dronePa.connect(droneGain);
    droneGain.connect(masterGain);

    droneSa.start();
    dronePa.start();

    // Vande Mataram Sequence ("Sujalam Sufalam Malayaja Shitalam...")
    const vandeMataramMelody = [
      { freq: 392.00, duration: 0.45 }, { freq: 440.00, duration: 0.45 }, { freq: 523.25, duration: 0.90 },
      { freq: 523.25, duration: 0.45 }, { freq: 587.33, duration: 0.45 }, { freq: 523.25, duration: 0.90 },
      { freq: 440.00, duration: 0.35 }, { freq: 523.25, duration: 0.35 }, { freq: 587.33, duration: 0.45 },
      { freq: 659.25, duration: 0.65 }, { freq: 587.33, duration: 0.45 }, { freq: 523.25, duration: 0.90 },
      { freq: 440.00, duration: 0.35 }, { freq: 523.25, duration: 0.35 }, { freq: 587.33, duration: 0.45 },
      { freq: 659.25, duration: 0.65 }, { freq: 587.33, duration: 0.45 }, { freq: 523.25, duration: 0.90 },
      { freq: 523.25, duration: 0.35 }, { freq: 440.00, duration: 0.35 }, { freq: 392.00, duration: 0.45 },
      { freq: 440.00, duration: 0.45 }, { freq: 392.00, duration: 0.70 },
      { freq: 329.63, duration: 0.45 }, { freq: 392.00, duration: 0.45 }, { freq: 440.00, duration: 0.90 },
      { freq: 329.63, duration: 0.50 }, { freq: 392.00, duration: 0.50 }, { freq: 440.00, duration: 0.70 },
      { freq: 523.25, duration: 1.30 }, { freq: 0, duration: 0.8 }
    ];

    let noteIndex = 0;

    const playNextNote = () => {
      if (!state.isPlayingAudio || !state.audioContext) {
        try { droneSa.stop(); dronePa.stop(); } catch(e) {}
        return;
      }

      const note = vandeMataramMelody[noteIndex % vandeMataramMelody.length];

      if (note.freq > 0) {
        const osc = state.audioContext.createOscillator();
        const harmonicOsc = state.audioContext.createOscillator();
        const noteGain = state.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, state.audioContext.currentTime);

        harmonicOsc.type = 'triangle';
        harmonicOsc.frequency.setValueAtTime(note.freq * 2, state.audioContext.currentTime);

        const now = state.audioContext.currentTime;
        const dur = note.duration;

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.14, now + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(noteGain);
        harmonicOsc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now);
        harmonicOsc.start(now);

        osc.stop(now + dur + 0.05);
        harmonicOsc.stop(now + dur + 0.05);
      }

      noteIndex++;
      if (state.isPlayingAudio) {
        setTimeout(playNextNote, note.duration * 1000);
      } else {
        try { droneSa.stop(); dronePa.stop(); } catch(e) {}
      }
    };

    playNextNote();

  } catch (err) {
    console.warn('Web Audio synthesis prevented:', err);
  }
}

function playFireworkBurstSound() {
  if (!state.isPlayingAudio || !state.audioContext) return;
  try {
    const osc = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    const now = state.audioContext.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(state.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}

function stopPatrioticAudio() {
  if (bgAudioElement) {
    bgAudioElement.pause();
  }
  if (state.audioContext) {
    state.audioContext.suspend();
  }
}

// ==========================================
// Form & Wish Generation Logic (Single Stage Flow)
// ==========================================
function startOpeningWelcomeSequence() {
  const greetingStage = document.getElementById('openingGreetingStage');
  const nameInputStage = document.getElementById('nameInputStage');
  const wishCardStage = document.getElementById('wishCardStage');
  const boomOverlay = document.getElementById('boomFlashOverlay');

  if (wishCardStage) wishCardStage.classList.add('hidden');

  // 0.0s → BOOM Effect
  if (boomOverlay) {
    boomOverlay.classList.remove('hidden');
    setTimeout(() => boomOverlay.classList.add('hidden'), 750);
  }
  triggerTricolorConfetti();
  playFireworkBurstSound();

  // 0.8s → Opening Greeting Stage Active
  if (greetingStage) {
    greetingStage.classList.remove('hidden');
  }

  // 3.5s → Transition smoothly away from opening greeting to Name Section ("Who would you like to wish? ❤️")
  setTimeout(() => {
    if (greetingStage) greetingStage.classList.add('hidden');
    if (nameInputStage) {
      nameInputStage.classList.remove('hidden');
    }
  }, 3500);
}

function generateWish(name) {
  if (!name || name.trim() === '') {
    showToast('Please enter your name to generate your wish! 🇮🇳', '⚠️');
    return;
  }

  const cleanName = name.trim();
  state.currentName = cleanName;

  const greetingStage = document.getElementById('openingGreetingStage');
  const nameInputStage = document.getElementById('nameInputStage');
  const wishCardStage = document.getElementById('wishCardStage');
  const nameText = document.getElementById('nameText');

  if (greetingStage) greetingStage.classList.add('hidden');
  if (nameInputStage) nameInputStage.classList.add('hidden');
  if (nameText) nameText.textContent = cleanName;

  if (wishCardStage) {
    wishCardStage.classList.remove('hidden');
    wishCardStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Celebration sequence
  triggerTricolorConfetti();
  if (typeof window.triggerFirecrackers === 'function') {
    window.triggerFirecrackers();
  }
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
  const recipientName = state.currentName || 'Friend';
  return `Happy Independence Day, ${recipientName}! 🇮🇳❤️

May the spirit of freedom, unity, courage, and hope always remain in your heart. May your dreams fly as high as our Tiranga, and may we continue to build a stronger, brighter, and better India together.

Jai Hind! 🇮🇳❤️

With Love & Best Wishes ❤️
— Omprasad Bhaskar Padwalkar 🇮🇳

Celebrate & generate your personalized 80th Independence Day wish here:
${window.location.origin}${window.location.pathname}`;
}

function shareOnWhatsApp() {
  const wishText = getWishText();
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(wishText)}`;
  window.open(whatsappUrl, '_blank');
  showToast('Opening WhatsApp...', '📲');
}

async function shareNativeWish() {
  const wishText = getWishText();
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  const shareData = {
    title: 'Happy Independence Day 2026 🇮🇳',
    text: wishText,
    url: cleanUrl
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
          
          // Reveal all cinematic steps in exported image
          clonedDoc.querySelectorAll('.cinematic-step').forEach(el => {
            el.classList.remove('hidden');
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
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

function sendThankYouEmail() {
  const visitorName = state.currentName || 'A Patriotic Indian Citizen';

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_independence';
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_thank_you';
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_demo';

  const templateParams = {
    to_email: 'omprasadpadwalkar07@gmail.com',
    from_name: visitorName,
    subject: '🇮🇳 Someone sent you a Thank You!',
    message_body: `Someone named ${visitorName} clicked the Thank You button on your Independence Day website. ❤️🇮🇳\n\nMessage: Thank you, Omprasad! ❤️\n15 August 2026 — India's 80th Independence Day 🇮🇳`,
    date: '15 August 2026'
  };

  showToast('Sending your love to Omprasad... ❤️', '💌');

  emailjs.send(serviceId, templateId, templateParams, publicKey)
    .then(() => {
      showToast('Thank you for your love! ❤️🇮🇳', '❤️');
      triggerTricolorConfetti();
    })
    .catch((err) => {
      console.warn('EmailJS notification notice:', err);
      showToast('Thank you for your love! ❤️🇮🇳', '❤️');
      triggerTricolorConfetti();
    });
}

function resetForm() {
  const nameInputStage = document.getElementById('nameInputStage');
  const wishCardStage = document.getElementById('wishCardStage');
  const nameInput = document.getElementById('userNameInput');

  if (wishCardStage) wishCardStage.classList.add('hidden');
  if (nameInputStage) nameInputStage.classList.remove('hidden');

  if (nameInput) {
    nameInput.value = '';
    nameInput.focus();
  }
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

  const thankYouBtn = document.getElementById('thankYouBtn');
  if (thankYouBtn) thankYouBtn.addEventListener('click', sendThankYouEmail);

  // Auto-start opening greeting animation immediately on load
  startOpeningWelcomeSequence();

  // Auto-start music on page load & unlock on first mobile gesture/interaction
  startPatrioticAudio();
  const gestureEvents = ['touchstart', 'touchend', 'pointerdown', 'click', 'scroll', 'keydown'];
  const unlockAudio = () => {
    if (state.isPlayingAudio) {
      startPatrioticAudio();
    }
    gestureEvents.forEach(evt => document.removeEventListener(evt, unlockAudio));
  };
  gestureEvents.forEach(evt => document.addEventListener(evt, unlockAudio, { passive: true }));

  // Keep audio playing on mobile visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.isPlayingAudio) {
      startPatrioticAudio();
    }
  });
});
