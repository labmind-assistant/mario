const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
type Rect = { x: number; y: number; w: number; h: number };
const worldWidth = 2900;
const platforms: Rect[] = [
  { x: 0, y: 420, w: 620, h: 120 },
  { x: 740, y: 420, w: 620, h: 120 },
  { x: 1500, y: 420, w: 560, h: 120 },
  { x: 2190, y: 420, w: 710, h: 120 },
  { x: 280, y: 320, w: 130, h: 22 },
  { x: 920, y: 310, w: 150, h: 22 },
  { x: 1650, y: 315, w: 140, h: 22 },
  { x: 2350, y: 310, w: 150, h: 22 },
];
const coins = [
  [320, 285], [380, 285], [570, 380], [810, 380], [970, 275],
  [1230, 380], [1550, 380], [1700, 280], [1950, 380], [2400, 275], [2600, 380],
].map(([x, y]) => ({ x, y, taken: false }));
const flag: Rect = { x: 2780, y: 250, w: 18, h: 170 };
const player = { x: 60, y: 360, w: 28, h: 36, vx: 0, vy: 0, grounded: false };
const keys = new Set<string>();
let jumpQueued = false;
let score = 0;
let camera = 0;
let state: 'playing' | 'won' | 'lost' = 'playing';
function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function restart(): void {
  Object.assign(player, { x: 60, y: 360, vx: 0, vy: 0, grounded: false });
  coins.forEach(c => c.taken = false);
  score = 0;
  camera = 0;
  state = 'playing';
  jumpQueued = false;
  keys.clear();
}
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code)) e.preventDefault();
  keys.add(e.code);
  if (!e.repeat && ['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jumpQueued = true;
  if (e.code === 'KeyR') restart();
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => { keys.clear(); jumpQueued = false; });
function update(dt: number): void {
  if (state !== 'playing') return;
  const left = keys.has('ArrowLeft') || keys.has('KeyA');
  const right = keys.has('ArrowRight') || keys.has('KeyD');
  player.vx = (Number(right) - Number(left)) * 260;
  if (jumpQueued && player.grounded) player.vy = -570;
  jumpQueued = false;
  player.vy += 1550 * dt;
  player.x = Math.max(0, Math.min(worldWidth - player.w, player.x + player.vx * dt));
  for (const p of platforms) {
    if (overlaps(player, p)) {
      if (player.vx > 0) player.x = p.x - player.w;
      if (player.vx < 0) player.x = p.x + p.w;
    }
  }
  player.y += player.vy * dt;
  player.grounded = false;
  for (const p of platforms) {
    if (overlaps(player, p)) {
      if (player.vy >= 0) {
        player.y = p.y - player.h;
        player.grounded = true;
      } else player.y = p.y + p.h;
      player.vy = 0;
    }
  }
  for (const c of coins) {
    if (!c.taken && overlaps(player, { x: c.x - 10, y: c.y - 10, w: 20, h: 20 })) {
      c.taken = true;
      score++;
    }
  }
  if (overlaps(player, flag)) state = 'won';
  if (player.y > canvas.height + 80) state = 'lost';
  camera = Math.max(0, Math.min(worldWidth - canvas.width, player.x - canvas.width * 0.38));
}
function box(x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function draw(): void {
  box(0, 0, canvas.width, canvas.height, '#94d9f5');
  ctx.save();
  ctx.translate(-camera * 0.25, 0);
  for (let x = 100; x < worldWidth; x += 380) {
    ctx.fillStyle = '#e8f8ff';
    ctx.beginPath(); ctx.ellipse(x, 105, 65, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#70bfa0';
    ctx.beginPath(); ctx.arc(x + 120, 440, 120, Math.PI, 0); ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(-camera, 0);
  for (const p of platforms) {
    box(p.x, p.y, p.w, p.h, '#985c3d');
    box(p.x, p.y, p.w, 8, '#378550');
    for (let x = p.x + 16; x < p.x + p.w; x += 38) box(x, p.y + 16, 14, 5, '#be8056');
  }
  for (const c of coins) if (!c.taken) {
    ctx.fillStyle = '#ffd447'; ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fill();
    box(c.x - 2, c.y - 6, 4, 12, '#d58a20');
  }
  box(flag.x, flag.y, 5, flag.h, '#f7f7ee');
  box(flag.x + 5, flag.y, 54, 32, '#e65359');
  box(player.x, player.y + 10, player.w, 26, '#325ec5');
  box(player.x + 3, player.y + 3, 22, 15, '#ffce9b');
  box(player.x - 2, player.y, 32, 8, '#d84143');
  box(player.x + 19, player.y + 9, 4, 4, '#253046');
  ctx.restore();
  box(16, 16, 230, 42, '#18394c');
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px monospace';
  ctx.fillText(`COINS ${score} / ${coins.length}`, 30, 44);
  if (state !== 'playing') {
    box(190, 155, 420, 145, '#18394c');
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 30px monospace';
    ctx.fillText(state === 'won' ? 'FLAG REACHED!' : 'TRY AGAIN!', 400, 207);
    ctx.font = '18px monospace'; ctx.fillText(`Coins: ${score}/${coins.length} · R to restart`, 400, 255);
    ctx.textAlign = 'left';
  }
}
let previousTime: number | undefined;
let accumulator = 0;
function frame(time: number): void {
  if (previousTime !== undefined) accumulator += Math.min((time - previousTime) / 1000, 0.1);
  previousTime = time;
  while (accumulator >= 1 / 120) { update(1 / 120); accumulator -= 1 / 120; }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
