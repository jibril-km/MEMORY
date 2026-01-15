const grid = document.getElementById("grid");
const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");
const toast = document.getElementById("toast");

const EMOJIS = ["🍓","🍉","🍋","🍇","🍒","🥝","🍍","🍑"]; // 8 paires
let deck = [];
let first = null, lock = false;
let moves = 0, matched = 0, seconds = 0;
let timer = null;

function show(msg){ toast.textContent = msg; }

function bestKey(){ return "memoryBest"; }
function loadBest(){
  const b = localStorage.getItem(bestKey());
  bestEl.textContent = b ? `${b} coups` : "—";
}
function saveBest(){
  const b = localStorage.getItem(bestKey());
  if (!b || moves < Number(b)) localStorage.setItem(bestKey(), String(moves));
  loadBest();
}

function shuffle(a){
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function startTimer(){
  if (timer) clearInterval(timer);
  timer = setInterval(()=>{ seconds++; timeEl.textContent = seconds; }, 1000);
}

function build(){
  const cards = EMOJIS.concat(EMOJIS).map((v, id)=>({ id, v, matched:false }));
  deck = shuffle(cards);
  grid.innerHTML = "";
  deck.forEach((c, idx)=>{
    const el = document.createElement("div");
    el.className = "card";
    el.dataset.idx = idx;
    el.innerHTML = `
      <div class="face back">MEMORY</div>
      <div class="face front">${c.v}</div>
    `;
    el.addEventListener("click", ()=>flip(idx));
    grid.appendChild(el);
  });
}

function setMoves(n){
  moves = n;
  movesEl.textContent = moves;
}

function reset(){
  first = null; lock = false; matched = 0; seconds = 0;
  timeEl.textContent = "0";
  setMoves(0);
  build();
  loadBest();
  show("Retourne 2 cartes 🙂");
  startTimer();
}

function flip(idx){
  if (lock) return;
  const c = deck[idx];
  if (c.matched) return;

  const el = grid.children[idx];
  if (el.classList.contains("flipped")) return;

  el.classList.add("flipped");

  if (!first){
    first = { idx, v: c.v };
    return;
  }

  setMoves(moves + 1);

  const second = { idx, v: c.v };
  if (second.v === first.v){
    // match
    deck[first.idx].matched = true;
    deck[second.idx].matched = true;
    grid.children[first.idx].classList.add("matched");
    grid.children[second.idx].classList.add("matched");
    matched += 2;
    first = null;
    show("✅ Bien joué !");
    if (matched === deck.length){
      clearInterval(timer);
      show(`🏁 Terminé en ${seconds}s et ${moves} coups !`);
      saveBest();
    }
  } else {
    // no match
    lock = true;
    show("❌ Pas pareil…");
    setTimeout(()=>{
      grid.children[first.idx].classList.remove("flipped");
      grid.children[second.idx].classList.remove("flipped");
      first = null;
      lock = false;
    }, 650);
  }
}

restartBtn.addEventListener("click", reset);
loadBest();
reset();
