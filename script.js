(() => {
  const apology = document.getElementById('apology');
  const stage = document.getElementById('characterStage');
  const wrap = document.getElementById('characterWrap');
  const hairEcho = document.getElementById('hairEcho');
  const bubble = document.getElementById('speechBubble');
  const stars = document.getElementById('impactStars');
  const hint = document.getElementById('hint');
  const gestureHint = document.getElementById('gestureHint');

  let bubbleTimer = null;
  let reactionTimer = null;
  let starsTimer = null;
  let hairPointer = null;
  let cheekPointer = null;
  let suppressClickUntil = 0;
  let hairCount = 0;
  let cheekCount = 0;

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
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 2600);
  }

  function showStars(kind) {
    stars.className = `impact-stars ${kind} show`;
    clearTimeout(starsTimer);
    starsTimer = setTimeout(() => stars.classList.remove('show'), 650);
  }

  function enterCharacter() {
    apology.hidden = true;
    apology.classList.remove('active');
    stage.hidden = false;
    stage.classList.add('active');
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap', 'hair-release');
    requestAnimationFrame(() => wrap.classList.add('zoomed'));
    setTimeout(() => {
      if (!stage.hidden) wrap.classList.add('idle');
    }, 1300);
    hint.textContent = 'Try a little tug on his curls! ✨';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function backToApology() {
    clearTimeout(bubbleTimer);
    clearTimeout(reactionTimer);
    bubble.classList.remove('show');
    stars.classList.remove('show');
    wrap.classList.remove('zoomed', 'idle', 'hair-pull', 'cheek-slap', 'hair-release');
    stage.classList.remove('active');
    stage.hidden = true;
    apology.hidden = false;
    apology.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  document.getElementById('beginPunishment').addEventListener('click', enterCharacter);
  document.getElementById('backToApology').addEventListener('click', backToApology);

  function resetMotion() {
    wrap.classList.remove('idle', 'hair-pull', 'cheek-slap', 'hair-release');
    hairEcho.classList.remove('pulling');
    void wrap.offsetWidth;
  }

  function finishMotion(className, duration = 800) {
    clearTimeout(reactionTimer);
    reactionTimer = setTimeout(() => {
      wrap.classList.remove(className);
      hairEcho.classList.remove('pulling');
      if (!stage.hidden) wrap.classList.add('idle');
    }, duration);
  }

  function hairAction(pullDistance = 0) {
    resetMotion();
    const intensity = Math.max(0, Math.min(1, Math.abs(pullDistance) / 100));
    wrap.style.setProperty('--pull', `${Math.max(18, 28 + intensity * 22)}px`);
    wrap.classList.add('hair-pull');
    hairEcho.classList.add('pulling');
    showStars('hair-stars');
    showBubble(hairLines[hairCount % hairLines.length]);
    hairCount++;
    hint.textContent = 'He is reconsidering his apology... 🌼';
    gestureHint.textContent = '☝️';
    gestureHint.classList.add('show');
    setTimeout(() => gestureHint.classList.remove('show'), 700);
    finishMotion('hair-pull', 850);
  }

  function cheekAction(swipeX = 0) {
    resetMotion();
    wrap.style.setProperty('--swipe', `${Math.max(-1, Math.min(1, swipeX / 120)) * 13}px`);
    wrap.classList.add('cheek-slap');
    showStars('cheek-stars');
    showBubble(cheekLines[cheekCount % cheekLines.length]);
    cheekCount++;
    hint.textContent = 'That one definitely left an impression 😅';
    gestureHint.textContent = '💥';
    gestureHint.classList.add('show');
    setTimeout(() => gestureHint.classList.remove('show'), 700);
    finishMotion('cheek-slap', 720);
  }

  // Hair supports both a tap and a short drag/pull gesture.
  const hairZone = document.getElementById('hairZone');
  hairZone.addEventListener('pointerdown', event => {
    hairPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { hairZone.setPointerCapture(event.pointerId); } catch (_) {}
  });
  hairZone.addEventListener('pointerup', event => {
    if (!hairPointer || hairPointer.id !== event.pointerId) return;
    const dy = hairPointer.y - event.clientY;
    hairAction(dy);
    hairPointer = null;
    suppressClickUntil = Date.now() + 500;
  });
  hairZone.addEventListener('pointercancel', () => { hairPointer = null; });
  hairZone.addEventListener('click', () => {
    if (Date.now() > suppressClickUntil) hairAction(0);
  });

  // Cheeks respond to a tap or a horizontal swipe.
  const cheekZone = document.getElementById('cheekZone');
  cheekZone.addEventListener('pointerdown', event => {
    cheekPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { cheekZone.setPointerCapture(event.pointerId); } catch (_) {}
  });
  cheekZone.addEventListener('pointerup', event => {
    if (!cheekPointer || cheekPointer.id !== event.pointerId) return;
    const dx = event.clientX - cheekPointer.x;
    const dy = event.clientY - cheekPointer.y;
    const moved = Math.hypot(dx, dy);
    cheekAction(moved > 12 ? dx : 0);
    cheekPointer = null;
    suppressClickUntil = Date.now() + 500;
  });
  cheekZone.addEventListener('pointercancel', () => { cheekPointer = null; });
  cheekZone.addEventListener('click', () => {
    if (Date.now() > suppressClickUntil) cheekAction(0);
  });

})();
