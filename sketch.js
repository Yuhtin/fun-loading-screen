const PAN_BLUE       = '#00ADEF';
const PAN_BLUE_DEEP  = '#0080BB';
const PAN_BLUE_LIGHT = '#7BD3F0';
const PAN_DARK       = '#3F3F3F';
const PAN_GREY       = '#9AA0A6';
const PAN_BG_SOFT    = '#F4F7FA';

const BAR_COLORS = [PAN_BLUE, PAN_DARK, PAN_BLUE_LIGHT, PAN_BLUE_DEEP];
const NUM_BARS = 12;
const LOG_INTERVAL = 800;

let state = 'loading';
let logoPan;
let cardImgs = { azul: null, cinza: null, gold: null };
let cards = [];
let cardsColetados = 0;
let timerStart = null;
let timerDuration = 15000;
let stateChangeTime = null;
let bars = [];
let confetti = [];
let btnTedio = { x: 0, y: 0, w: 0, h: 0 };
let logMsg = '> Iteração 47291 · Aplicando restrição R_29';
let logLastUpdate = 0;

const LOG_LOADING = [
  '> Iteração 47291 · Aplicando restrição R_29',
  '> Convergindo simplex...',
  '> Recalculando alpha = 0.847...',
  '> Negociando com restrição de PD...',
  '> Aguardando ânimo do solver...',
  '> Aplicando restrição de exposição R_142',
  '> Lambda dual = 12.4 (estável)',
  '> Iteração 47292 · feasibility OK',
];

const LOG_TEDIO = [
  '> Detectada anomalia: humano interferindo no solver',
  '> Reportando ao compliance...',
  '> Tranche removida da otimização: T%N%',
  '> Tentando ignorar interferência externa...',
  '> Solver pedindo música pra concentrar',
  '> Restrição R_29 violada · ignorando',
  '> Otimização rodando em segundo plano...',
];

function preload() {
  logoPan        = loadImage('assets/logo-pan.png');
  cardImgs.azul  = loadImage('assets/card-azul.png');
  cardImgs.cinza = loadImage('assets/card-cinza.png');
  cardImgs.gold  = loadImage('assets/card-gold.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  setupBars();
}

function draw() {
  background(255);
  const c = document.querySelector('canvas');
  if (c) c.classList.toggle('no-cursor', state === 'bars');

  updateTimer();
  updateLog();

  if      (state === 'loading') drawLoading();
  else if (state === 'bars')    drawBars();
  else if (state === 'cards')   drawCards();
  else if (state === 'win')     drawWin();
  else if (state === 'done')    drawDone();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupBars();
}

function chartArea() {
  return {
    left:   width * 0.08,
    right:  width * 0.92,
    top:    height * 0.32,
    bottom: height * 0.84,
  };
}

function setupBars() {
  bars = [];
  const ch = chartArea();
  const innerLeft = ch.left + 16;
  const innerRight = ch.right - 16;
  const gap = 14;
  const barW = (innerRight - innerLeft - gap * (NUM_BARS - 1)) / NUM_BARS;
  const maxH = (ch.bottom - ch.top) * 0.85;
  for (let i = 0; i < NUM_BARS; i++) {
    bars.push(new Bar(
      innerLeft + i * (barW + gap),
      barW,
      ch.bottom,
      random(maxH * 0.25, maxH),
      BAR_COLORS[i % BAR_COLORS.length],
      `T${i + 1}`,
    ));
  }
}

function setupCards() {
  cards = [];
  cardsColetados = 0;
  const deck = [
    cardImgs.azul, cardImgs.azul,
    cardImgs.cinza, cardImgs.cinza,
    cardImgs.gold,
  ];
  for (const img of deck) {
    const w = 140;
    const h = (img.height / img.width) * w;
    cards.push(new Card(
      random(20, width - w - 20),
      random(140, height - h - 80),
      img,
      w,
    ));
  }
}

function drawLoading() {
  const cx = width / 2;
  drawCreditoLogo(cx, height * 0.28);

  noStroke();
  fill(PAN_DARK);
  textSize(22);
  textAlign(CENTER, CENTER);
  text('Processando Crédito com algoritmo', cx, height * 0.42);

  drawDots(cx, height * 0.48);
  drawButtons(cx, height * 0.58);
  drawLogLine(cx, height - 40);
  drawPanFooter(cx, height - 12);
}

function drawCreditoLogo(cx, cy) {
  const letters = ['C', 'r', 'é', 'd', 'i', 't', 'o'];
  textSize(72);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  const widths = letters.map(l => textWidth(l));
  const total = widths.reduce((a, b) => a + b, 0) + (letters.length - 1) * 4;
  let x = cx - total / 2;
  for (let i = 0; i < letters.length; i++) {
    fill(i % 2 === 0 ? PAN_BLUE : PAN_DARK);
    text(letters[i], x + widths[i] / 2, cy);
    x += widths[i] + 4;
  }
  textStyle(NORMAL);
}

function drawDots(cx, cy) {
  const t = millis() / 300;
  noStroke();
  for (let i = 0; i < 3; i++) {
    const alpha = 100 + 155 * (0.5 + 0.5 * sin(t - i * 0.8));
    fill(0, 173, 239, alpha);
    ellipse(cx - 20 + i * 20, cy, 9, 9);
  }
}

function drawButtons(cx, cy) {
  const w = 200, h = 40, gap = 16;
  const x1 = cx - w - gap / 2;
  const x2 = cx + gap / 2;
  drawButton(x1, cy - h / 2, w, h, 'Aguardar pacientemente', '#f4f5f7', PAN_GREY);
  drawButton(x2, cy - h / 2, w, h, 'Estou Com Tédio',         '#f4f5f7', PAN_DARK);
  btnTedio = { x: x2, y: cy - h / 2, w, h };
}

function drawButton(x, y, w, h, label, bg, fg) {
  noStroke();
  fill(bg);
  rect(x, y, w, h, 4);
  fill(fg);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

function drawLogLine(cx, cy) {
  fill(PAN_GREY);
  textSize(12);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  text(logMsg, cx, cy);
  textFont('Arial');
}

function drawPanFooter(cx, cy) {
  if (!logoPan) return;
  push();
  imageMode(CENTER);
  const h = 16;
  const w = (logoPan.width / logoPan.height) * h;
  tint(255, 180);
  image(logoPan, cx - 90, cy, w, h);
  noTint();
  fill(140);
  textSize(10);
  textAlign(LEFT, CENTER);
  text('otimizador desenvolvido para Banco PAN', cx - 75, cy);
  pop();
  textAlign(CENTER, CENTER);
}

function drawBars() {
  drawProcessingHeader('Movimente o mouse pelas tranches para acelerar a otimização');
  drawChartFrame();

  const mvx = mouseX - pmouseX;
  const mvy = mouseY - pmouseY;
  for (const b of bars) {
    b.update();
    if (b.tryKnock(mouseX, mouseY, mvx, mvy)) {
      spawnConfetti(b.x + b.w / 2, b.baseY - b.h, b.color);
    }
    b.draw();
  }

  for (let i = confetti.length - 1; i >= 0; i--) {
    confetti[i].update();
    confetti[i].draw();
    if (confetti[i].dead()) confetti.splice(i, 1);
  }

  const remaining = bars.filter(b => !b.knocked).length;
  fill(PAN_DARK);
  textSize(13);
  textAlign(LEFT, BOTTOM);
  text(`Tranches restantes: ${remaining}/12`, 24, height - 24);
  textAlign(CENTER, CENTER);

  if (bars.every(b => b.knocked)) {
    state = 'cards';
    setupCards();
  }

  drawTaco(mouseX, mouseY);
}

function drawProcessingHeader(subtitle) {
  fill(PAN_DARK);
  textStyle(BOLD);
  textSize(26);
  textAlign(CENTER, CENTER);
  text('Processando Crédito com algoritmo', width / 2, 42);
  textStyle(NORMAL);

  drawDots(width / 2, 76);

  fill(PAN_GREY);
  textSize(13);
  text(subtitle, width / 2, 102);

  fill(160);
  textSize(11);
  textFont('monospace');
  text(logMsg, width / 2, 124);
  textFont('Arial');
}

function drawChartFrame() {
  const ch = chartArea();

  noStroke();
  fill(PAN_BG_SOFT);
  rect(ch.left, ch.top, ch.right - ch.left, ch.bottom - ch.top, 8);

  stroke(225, 230, 236);
  strokeWeight(1);
  for (let i = 1; i <= 4; i++) {
    const y = ch.bottom - (i / 4) * (ch.bottom - ch.top);
    line(ch.left + 8, y, ch.right - 8, y);
  }

  stroke(PAN_GREY);
  strokeWeight(1.5);
  line(ch.left, ch.top + 4, ch.left, ch.bottom);
  line(ch.left, ch.bottom, ch.right, ch.bottom);

  noStroke();
  fill(PAN_GREY);
  textSize(10);
  textFont('monospace');
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= 4; i++) {
    const y = ch.bottom - (i / 4) * (ch.bottom - ch.top);
    text(`${i * 25}%`, ch.left - 8, y);
  }

  textAlign(CENTER, TOP);
  for (const b of bars) {
    if (!b.knocked) text(b.label, b.x + b.w / 2, ch.bottom + 8);
  }
  textFont('Arial');

  push();
  translate(ch.left - 42, (ch.top + ch.bottom) / 2);
  rotate(-PI / 2);
  textAlign(CENTER, CENTER);
  textSize(11);
  fill(PAN_DARK);
  text('Volume alocado', 0, 0);
  pop();

  textAlign(CENTER, CENTER);
  textSize(11);
  fill(PAN_DARK);
  text('Tranche de risco', (ch.left + ch.right) / 2, ch.bottom + 32);

  textAlign(LEFT, BOTTOM);
  textSize(11);
  fill(PAN_GREY);
  text('Distribuição ótima de crédito por tranche', ch.left, ch.top - 8);
}

function drawCards() {
  drawProcessingHeader('Realocando crédito em colaterais físicos...');

  for (const c of cards) {
    c.update();
    c.draw();
  }

  fill(PAN_DARK);
  textSize(13);
  textAlign(LEFT, BOTTOM);
  text(`Cartões coletados: ${cardsColetados}/5`, 24, height - 24);
  textAlign(CENTER, CENTER);
}

function drawWin() {
  const msg = 'Você matou seu tédio!';
  textAlign(CENTER, CENTER);
  textSize(60);
  textStyle(BOLD);
  const widths = [...msg].map(ch => textWidth(ch));
  const total = widths.reduce((a, b) => a + b, 0);
  let x = width / 2 - total / 2;
  let i = 0;
  for (const ch of msg) {
    fill(i % 2 === 0 ? PAN_BLUE : PAN_DARK);
    text(ch, x + widths[i] / 2, height / 2);
    x += widths[i];
    i++;
  }
  textStyle(NORMAL);
}

function drawDone() {
  fill(PAN_BLUE);
  textSize(60);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('Crédito processado ✓', width / 2, height / 2);
  textStyle(NORMAL);

  if (stateChangeTime !== null && millis() - stateChangeTime >= 5000) {
    resetGame();
  }
}

function drawTaco(mx, my) {
  const ang = atan2(mouseY - pmouseY, mouseX - pmouseX);
  push();
  translate(mx, my);
  rotate(ang);
  noStroke();
  fill(PAN_DARK);
  rect(-30, -3, 26, 6, 2);
  fill(PAN_BLUE);
  rect(-6, -8, 14, 16, 2);
  pop();
}

function spawnConfetti(x, y, color) {
  for (let i = 0; i < 16; i++) {
    confetti.push(new Confetti(x, y, color));
  }
}

function mousePressed() {
  if (state === 'loading' && pointInRect(mouseX, mouseY, btnTedio)) {
    state = 'bars';
    timerStart = millis();
    return;
  }
  if (state === 'cards') {
    for (const c of cards) {
      if (c.contains(mouseX, mouseY)) {
        c.collect();
        cardsColetados++;
        if (cardsColetados >= 5) {
          state = 'win';
          timerDuration += 3000;
        }
        return;
      }
    }
  }
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function updateTimer() {
  if (timerStart === null || state === 'done') return;
  if (millis() - timerStart >= timerDuration) {
    state = 'done';
    stateChangeTime = millis();
  }
}

function updateLog() {
  if (millis() - logLastUpdate < LOG_INTERVAL) return;
  logLastUpdate = millis();

  let pool;
  if (state === 'loading') pool = LOG_LOADING;
  else if (state === 'bars' || state === 'cards') pool = [...LOG_LOADING, ...LOG_TEDIO];
  else return;

  const knockedIdx = bars.findIndex(b => b.knocked);
  logMsg = random(pool).replace('%N%', knockedIdx >= 0 ? knockedIdx + 1 : 1);
}

function resetGame() {
  state = 'loading';
  timerStart = null;
  timerDuration = 15000;
  stateChangeTime = null;
  cardsColetados = 0;
  cards = [];
  confetti = [];
  setupBars();
}
