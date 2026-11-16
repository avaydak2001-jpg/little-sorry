const apology = document.getElementById('apology');
const stage = document.getElementById('characterStage');
const wrap = document.getElementById('characterWrap');
const bubble = document.getElementById('speechBubble');
const lines = document.getElementById('reactionLines');
const hint = document.getElementById('hint');
let bubbleTimer;
let introTimers = [];

function clearIntro(){ introTimers.forEach(clearTimeout); introTimers=[]; }
function showStage(){
  clearIntro();
  apology.classList.remove('active');
  stage.classList.add('active');
  requestAnimationFrame(()=>wrap.classList.add('zoomed'));
  introTimers.push(setTimeout(()=>wrap.classList.add('idle'),1500));
}
function replay(){
  clearIntro();
  hideBubble();
  wrap.classList.remove('zoomed','idle','hair-pull','cheek-slap');
  stage.classList.remove('active');
  apology.classList.add('active');
  setTimeout(showStage,2400);
}
document.getElementById('skipIntro').addEventListener('click',showStage);
document.getElementById('replay').addEventListener('click',replay);

function showBubble(message){
  clearTimeout(bubbleTimer);
  bubble.textContent=message;
  bubble.classList.add('show');
  bubbleTimer=setTimeout(()=>bubble.classList.remove('show'),2100);
}
function hideBubble(){clearTimeout(bubbleTimer);bubble.classList.remove('show');}
function animate(kind){
  wrap.classList.remove('idle','hair-pull','cheek-slap');
  lines.classList.remove('show');
  void wrap.offsetWidth;
  wrap.classList.add(kind);
  lines.classList.add('show');
  setTimeout(()=>{wrap.classList.remove(kind);wrap.classList.add('idle');},700);
  setTimeout(()=>lines.classList.remove('show'),550);
}
const hairLines=[
  'OUCH! My curls have feelings! 😭',
  'Careful! This hairstyle took 3 hours! 😵‍💫',
  'HEY! Not the premium curls! 🥲',
  'I said sorry, not bald! 😭'
];
const cheekLines=[
  'Oiii! That cheek is under protection! 😳',
  'My face just changed its PIN! 🫨',
  'AYYO! I saw my ancestors! 😵',
  'Okay okay… I deserve that. 🥺'
];
let hairCount=0,cheekCount=0;
let suppressCheekClick=false;
function hairAction(){
  animate('hair-pull');
  showBubble(hairLines[hairCount%hairLines.length]);
  hairCount++;
  hint.textContent='He is reconsidering his apology...';
}
function cheekAction(){
  animate('cheek-slap');
  showBubble(cheekLines[cheekCount%cheekLines.length]);
  cheekCount++;
  hint.textContent='That one definitely left an impression 😅';
}
document.getElementById('hairZone').addEventListener('click',hairAction);
const cheek=document.getElementById('cheekZone');
let touchStart=null;
cheek.addEventListener('pointerdown',e=>{touchStart={x:e.clientX,y:e.clientY};});
cheek.addEventListener('pointerup',e=>{
  if(!touchStart)return;
  const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;
  if(Math.hypot(dx,dy)>18) {
    cheekAction();
    suppressCheekClick=true;
    setTimeout(()=>{suppressCheekClick=false;},500);
  }
  touchStart=null;
});
cheek.addEventListener('click',()=>{if(!suppressCheekClick)cheekAction();});
// The page begins with the apology, then reveals the character and instructions.
introTimers.push(setTimeout(showStage,3300));
