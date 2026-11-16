(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const apology = $('apology');
  const stage = $('characterStage');
  const wrap = $('characterWrap');
  const bubble = $('speechBubble');
  const stars = $('impactStars');
  const hint = $('hint');
  const gestureHint = $('gestureHint');
  const hairZone = $('hairZone');
  const faceZone = $('faceZone');
  const soundToggle = $('soundToggle');
  const characterImage = $('character');

  if (!apology || !stage || !wrap || !bubble || !hairZone || !faceZone || !characterImage) return;

  // Keep the 14 approved reaction sentences exactly as agreed.
  const hairLines = [
    'OUCH! My curls have feelings! 😭',
    'Careful! This hairstyle took 3 hours! 😵‍💫',
    'Papam my hair 😭',
    'I said sorry, not bald! 😭',
    'Please, don’t make me bald, I am yet to get married 🙏',
    "I'm sorry, okay? Why are you still looking at me like that? 🥺",
    'Ayyo! My hair has suffered more than I did! 🥺',
    'Amuuuu sorry re…. My hairs already started regretting'
  ];

  const cheekLines = [
    'AYYO! I saw my ancestors! 😵',
    'Didn’t knew those hands can be so ruthless 🙌',
    'Baboaaa 🫨…. I think I am left with two tooth less',
    'Okay okay… I deserve that. 🥺',
    'Was that a slap or a software update?! 😭',
    'Abba! My cheeks have officially resigned! 😭',
    'Ammaaa! I came here to say sorry, not attend a boxing match! 🥊',
    'Show some mercy Oppa 😩'
  ];

  let bubbleTimer = 0;
  let motionTimer = 0;
  let starTimer = 0;
  let hairCount = 0;
  let cheekCount = 0;
  let soundOn = true;
  let audioContext = null;
  let activeGesture = null;
  let suppressNextPointerClick = false;

  function showBubble(message) {
    window.clearTimeout(bubbleTimer);
    bubble.textContent = message;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
    // Keep each reaction visible long enough to read; a new touch replaces it.
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('show'), 5200);
  }

  function showStars(kind) {
    window.clearTimeout(starTimer);
    stars.className = `impact-stars ${kind} show`;
    stars.textContent = kind === 'hair-stars' ? '〰️ ✦ ✧' : '💥 ✦ 💥';
    starTimer = window.setTimeout(() => stars.classList.remove('show'), 760);
  }

  function showGesture(symbol) {
    gestureHint.textContent = symbol;
    gestureHint.classList.remove('show');
    void gestureHint.offsetWidth;
    gestureHint.classList.add('show');
  }

  function updateCounters() {
    $('hairCount').textContent = String(hairCount);
    $('cheekCount').textContent = String(cheekCount);
    const total = hairCount + cheekCount;
    $('meterFill').style.width = `${Math.min(total, 10) * 10}%`;
    const labels = ['Still forgiving…', 'A little upset…', 'Questioning everything…', 'Calling my lawyer…', 'Curls filing a complaint!'];
    const labelIndex = total === 0 ? 0 : total < 3 ? 1 : total < 5 ? 2 : total < 8 ? 3 : 4;
    $('meterLabel').textContent = labels[labelIndex];
  }

  function enterCharacter() {
    apology.hidden = true;
    apology.classList.remove('active');
    stage.hidden = false;
    stage.classList.add('active');
    wrap.classList.remove('hair-pull', 'cheek-slap');
    wrap.classList.add('idle');
    showBubble("I'm ready... I think. 🥺");
    hint.textContent = 'Top curls for hair. Face for cheek reactions! ✨';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function backToApology() {
    window.clearTimeout(bubbleTimer);
    window.clearTimeout(motionTimer);
    window.clearTimeout(starTimer);
    bubble.classList.remove('show');
    stars.classList.remove('show');
    gestureHint.classList.remove('show');
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
    stage.classList.remove('active');
    stage.hidden = true;
    apology.hidden = false;
    apology.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  $('beginPunishment').addEventListener('click', enterCharacter);
  $('backToApology').addEventListener('click', backToApology);

  function startReaction(className, message, kind, symbol, newHint, duration) {
    window.clearTimeout(motionTimer);
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
    void wrap.offsetWidth;
    wrap.classList.add(className);
    showStars(kind);
    showBubble(message);
    showGesture(symbol);
    hint.textContent = newHint;
    motionTimer = window.setTimeout(() => {
      wrap.classList.remove(className);
      if (!stage.hidden) wrap.classList.add('idle');
    }, duration);
  }

  function hairAction(distance = 0) {
    const pull = Math.max(0, Math.min(1, Math.abs(distance) / 90));
    wrap.style.setProperty('--pull', `${18 + pull * 22}px`);
    startReaction('hair-pull', hairLines[hairCount % hairLines.length], 'hair-stars', '☝️',
      'He is reconsidering his apology… 🌼', 900);
    hairCount += 1;
    updateCounters();
    playCartoonSound('hair');
  }

  function cheekAction(distance = 0) {
    const swipe = Math.max(-1, Math.min(1, distance / 100));
    wrap.style.setProperty('--swipe', `${swipe * 12}px`);
    startReaction('cheek-slap', cheekLines[cheekCount % cheekLines.length], 'cheek-stars', '💥',
      'That one definitely left an impression 😅', 760);
    cheekCount += 1;
    updateCounters();
    playCartoonSound('cheek');
  }

  function getAudioContext() {
    if (!soundOn) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    try {
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') audioContext.resume();
      return audioContext;
    } catch (_) {
      return null;
    }
  }

  function playCartoonSound(kind) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const makeTone = (frequency, endFrequency, start, length, volume, type = 'triangle') => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now + start);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + start + length);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + length + 0.02);
    };
    if (kind === 'hair') {
      makeTone(210, 620, 0, 0.22, 0.055, 'triangle');
      makeTone(390, 180, 0.12, 0.22, 0.035, 'sine');
    } else {
      makeTone(520, 170, 0, 0.13, 0.06, 'square');
      makeTone(250, 120, 0.11, 0.16, 0.035, 'triangle');
    }
  }

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.textContent = soundOn ? '🔊 Cartoon sounds: ON' : '🔇 Cartoon sounds: OFF';
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    if (soundOn) getAudioContext();
  });

  // Pointer-up activates the zone where the gesture started. Keyboard activation
  // is handled through click(detail === 0), avoiding duplicate touch reactions.
  function wireHotspot(button, type) {
    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      activeGesture = { type, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      suppressNextPointerClick = false;
      try { button.setPointerCapture(event.pointerId); } catch (_) { /* pointer capture is optional */ }
      event.preventDefault();
    });

    button.addEventListener('pointerup', (event) => {
      if (!activeGesture || activeGesture.type !== type || activeGesture.pointerId !== event.pointerId) return;
      const gesture = activeGesture;
      activeGesture = null;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      suppressNextPointerClick = true;
      if (type === 'hair') {
        hairAction(Math.max(Math.abs(dx), Math.abs(dy)));
      } else {
        cheekAction(Math.hypot(dx, dy) > 10 ? dx : 0);
      }
      event.preventDefault();
    });

    button.addEventListener('pointercancel', () => { activeGesture = null; });
    button.addEventListener('lostpointercapture', () => { activeGesture = null; });

    button.addEventListener('click', (event) => {
      if (event.detail !== 0) {
        // Ignore pointer-generated clicks because pointerup already reacted.
        if (suppressNextPointerClick) {
          suppressNextPointerClick = false;
          return;
        }
        return;
      }
      if (type === 'hair') hairAction(0); else cheekAction(0);
    });
  }

  wireHotspot(hairZone, 'hair');
  wireHotspot(faceZone, 'cheek');
  characterImage.addEventListener('error', () => {
    bubble.textContent = 'The character image did not load. Check character-front-20261117.jpeg is beside index.html.';
    bubble.classList.add('show');
  });

  updateCounters();
})();
