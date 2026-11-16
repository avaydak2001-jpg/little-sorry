const apology = document.getElementById('apology');
const stage = document.getElementById('characterStage');
const wrap = document.getElementById('characterWrap');
const bubble = document.getElementById('speechBubble');
const lines = document.getElementById('reactionLines');
const hint = document.getElementById('hint');
let bubbleTimer;
let animationTimers = [];

function clearAnimationTimers() {
  animationTimers.forEach(clearTimeout);
  animationTimers = [];
}

function showStage() {
  hideBubble();
  clearAnimationTimers();
  apology.classList.remove('active');
  apology.hidden = true;
  stage.hidden = false;
  stage.classList.add('active');
  wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
  requestAnimationFrame(() => wrap.classList.add('zoomed'));
  animationTimers.push(setTimeout(() => wrap.classList.add('idle'), 1350));
  hint.textContent = 'Try tapping his hair or cheeks! ✨';
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function returnToApology() {
  hideBubble();
  clearAnimationTimers();
  wrap.classList.remove('zoomed', 'idle', 'hair-pull', 'cheek-slap');
  lines.classList.remove('show');
  stage.classList.remove('active');
  stage.hidden = true;
  apology.hidden = false;
  apology.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.getElementById('beginPunishment').addEventListener('click', showStage);
document.getElementById('backToApology').addEventListener('click', returnToApology);

function showBubble(message) {
  clearTimeout(bubbleTimer);
  bubble.textContent = message;
  bubble.classList.add('show');
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 2300);
}

function hideBubble() {
  clearTimeout(bubbleTimer);
  bubble.classList.remove('show');
}

function animate(kind) {
  wrap.classList.remove('idle', 'hair-pull', 'cheek-slap');
  lines.classList.remove('show');
  void wrap.offsetWidth;
  wrap.classList.add(kind);
  lines.classList.add('show');
  animationTimers.push(setTimeout(() => {
    wrap.classList.remove(kind);
    wrap.classList.add('idle');
  }, 720));
  animationTimers.push(setTimeout(() => lines.classList.remove('show'), 560));
}

const hairLines = [
  'OUCH! My curls have feelings! 😭',
  'Careful! This hairstyle took 3 hours! 😵‍💫',
  'HEY! Not the premium curls! 🥲',
  'I said sorry, not bald! 😭'
];
const cheekLines = [
  'Oiii! That cheek is under protection! 😳',
  'My face just changed its PIN! 🫨',
  'AYYO! I saw my ancestors! 😵',
  'Okay okay… I deserve that. 🥺'
];
let hairCount = 0;
let cheekCount = 0;
let suppressCheekClick = false;

function hairAction() {
  animate('hair-pull');
  showBubble(hairLines[hairCount % hairLines.length]);
  hairCount++;
  hint.textContent = 'He is reconsidering his apology... 🌼';
}

function cheekAction() {
  animate('cheek-slap');
  showBubble(cheekLines[cheekCount % cheekLines.length]);
  cheekCount++;
  hint.textContent = 'That one definitely left an impression 😅';
}

document.getElementById('hairZone').addEventListener('click', hairAction);
const cheek = document.getElementById('cheekZone');
let touchStart = null;
cheek.addEventListener('pointerdown', event => {
  touchStart = { x: event.clientX, y: event.clientY };
});
cheek.addEventListener('pointerup', event => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  if (Math.hypot(dx, dy) > 18) {
    cheekAction();
    suppressCheekClick = true;
    setTimeout(() => { suppressCheekClick = false; }, 500);
  }
  touchStart = null;
});
cheek.addEventListener('pointercancel', () => { touchStart = null; });
cheek.addEventListener('click', () => {
  if (!suppressCheekClick) cheekAction();
});

// No automatic timer: the apology remains on screen until the visitor chooses to continue.
