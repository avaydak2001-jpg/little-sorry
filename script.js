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
  const cheekZone = $('cheekZone');

  if (!apology || !stage || !wrap || !hairZone || !cheekZone) return;

  let bubbleTimer;
  let motionTimer;
  let starTimer;
  let hairCount = 0;
  let cheekCount = 0;
  let hairGesture = null;
  let cheekGesture = null;
  let ignoreHairClickUntil = 0;
  let ignoreCheekClickUntil = 0;

  const hairLines = [
    'OUCH! My curls have feelings! 😭',
    'Careful! This hairstyle took 3 hours! 😵‍💫',
    'HEY! Not the premium curls! 🥲',
    'I said sorry, not bald! 😭',
    'My barber is going to hear about this! 😤'
  ];
  const cheekLines = [
    'AYYO! I saw my ancestors! 😵',
    'My face just changed its PIN! 🫨',
    'Oiii! These cheeks are under protection! 😳',
    'Okay okay… I deserve that. 🥺',
    'Was that a slap or a software update?! 😭'
  ];

  function showBubble(message) {
    clearTimeout(bubbleTimer);
    bubble.textContent = message;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 2400);
  }

  function showStars(kind) {
    clearTimeout(starTimer);
    stars.className = `impact-stars ${kind} show`;
    starTimer = setTimeout(() => stars.classList.remove('show'), 720);
  }

  function showGesture(symbol) {
    gestureHint.textContent = symbol;
    gestureHint.classList.remove('show');
    void gestureHint.offsetWidth;
    gestureHint.classList.add('show');
  }

  function enterCharacter() {
    apology.hidden = true;
    apology.classList.remove('active');
    stage.hidden = false;
    stage.classList.add('active');
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
    void wrap.offsetWidth;
    wrap.classList.add('idle');
    hint.textContent = 'Go on… his curls are waiting! ✨';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function backToApology() {
    clearTimeout(bubbleTimer);
    clearTimeout(motionTimer);
    clearTimeout(starTimer);
    bubble.classList.remove('show');
    stars.classList.remove('show');
    gestureHint.classList.remove('show');
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
    stage.classList.remove('active');
    stage.hidden = true;
    apology.hidden = false;
    apology.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  $('beginPunishment').addEventListener('click', enterCharacter);
  $('backToApology').addEventListener('click', backToApology);

  function startReaction(className, message, kind, symbol, newHint, duration) {
    clearTimeout(motionTimer);
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
    void wrap.offsetWidth;
    wrap.classList.add(className);
    showStars(kind);
    showBubble(message);
    showGesture(symbol);
    hint.textContent = newHint;
    motionTimer = setTimeout(() => {
      wrap.classList.remove(className);
      if (!stage.hidden) wrap.classList.add('idle');
    }, duration);
  }

  function hairAction(distance = 0) {
    const pull = Math.max(0, Math.min(1, Math.abs(distance) / 90));
    wrap.style.setProperty('--pull', `${18 + pull * 22}px`);
    startReaction(
      'hair-pull', hairLines[hairCount % hairLines.length], 'hair-stars', '☝️',
      'He is reconsidering his apology… 🌼', 900
    );
    hairCount += 1;
  }

  function cheekAction(distance = 0) {
    const swipe = Math.max(-1, Math.min(1, distance / 100));
    wrap.style.setProperty('--swipe', `${swipe * 12}px`);
    startReaction(
      'cheek-slap', cheekLines[cheekCount % cheekLines.length], 'cheek-stars', '💥',
      'That one definitely left an impression 😅', 760
    );
    cheekCount += 1;
  }

  // Pointer events handle touch, mouse and stylus. Click remains as a keyboard fallback.
  function wireHotspot(button, type) {
    const isHair = type === 'hair';
    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const data = { id: event.pointerId, x: event.clientX, y: event.clientY };
      if (isHair) hairGesture = data; else cheekGesture = data;
      try { button.setPointerCapture(event.pointerId); } catch (_) { /* capture is optional */ }
    });

    button.addEventListener('pointerup', (event) => {
      const data = isHair ? hairGesture : cheekGesture;
      if (!data || data.id !== event.pointerId) return;
      const dx = event.clientX - data.x;
      const dy = event.clientY - data.y;
      if (isHair) {
        hairGesture = null;
        ignoreHairClickUntil = Date.now() + 650;
        hairAction(data.y - event.clientY || Math.abs(dx));
      } else {
        cheekGesture = null;
        ignoreCheekClickUntil = Date.now() + 650;
        cheekAction(Math.hypot(dx, dy) > 10 ? dx : 0);
      }
      event.preventDefault();
    });

    button.addEventListener('pointercancel', () => {
      if (isHair) hairGesture = null; else cheekGesture = null;
    });

    button.addEventListener('click', (event) => {
      // Pointer-generated clicks follow pointerup; ignore those to avoid double reactions.
      if (isHair) {
        if (Date.now() < ignoreHairClickUntil) return;
        hairAction(0);
      } else {
        if (Date.now() < ignoreCheekClickUntil) return;
        cheekAction(0);
      }
    });
  }

  wireHotspot(hairZone, 'hair');
  wireHotspot(cheekZone, 'cheek');
})();
