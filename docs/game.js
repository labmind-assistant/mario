const worldWidth = 2900;
const platforms = [
    { x: 0, y: 420, w: 620, h: 120 },
    { x: 740, y: 420, w: 620, h: 120 },
    { x: 1500, y: 420, w: 560, h: 120 },
    { x: 2190, y: 420, w: 710, h: 120 },
    { x: 280, y: 320, w: 130, h: 22 },
    { x: 920, y: 320, w: 150, h: 22 },
    { x: 1650, y: 320, w: 140, h: 22 },
    { x: 2350, y: 320, w: 150, h: 22 },
];
const flag = { x: 2780, y: 250, w: 18, h: 170 };
const physics = { gravity: 1550, jumpVelocity: -570, runSpeed: 260, playerWidth: 28, playerHeight: 36 };
const spawn = { x: 60, y: 360 };

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const coins = [
    [320, 285], [380, 285], [570, 380], [810, 380], [970, 275],
    [1230, 380], [1550, 380], [1700, 280], [1950, 380], [2400, 275], [2600, 380],
].map(([x, y]) => ({ x, y, taken: false }));
const player = { ...spawn, w: physics.playerWidth, h: physics.playerHeight, vx: 0, vy: 0, grounded: false };
const enemyPlatform = platforms[5];
const enemy = { x: enemyPlatform.x + 55, y: enemyPlatform.y - 24, w: 28, h: 24, vx: 70, alive: true };
const keys = new Set();
let jumpQueued = false;
let score = 0;
let camera = 0;
let state = 'playing';
function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function restart() {
    Object.assign(player, { ...spawn, vx: 0, vy: 0, grounded: false });
    coins.forEach(c => c.taken = false);
    Object.assign(enemy, { x: enemyPlatform.x + 55, vx: 70, alive: true });
    score = 0;
    camera = 0;
    state = 'playing';
    jumpQueued = false;
    keys.clear();
}
window.addEventListener('keydown', e => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(e.code))
        e.preventDefault();
    keys.add(e.code);
    if (!e.repeat && ['Space', 'ArrowUp', 'KeyW'].includes(e.code))
        jumpQueued = true;
    if (e.code === 'KeyR')
        restart();
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => { keys.clear(); jumpQueued = false; });
function update(dt) {
    if (state !== 'playing')
        return;
    const previousBottom = player.y + player.h;
    if (enemy.alive) {
        enemy.x += enemy.vx * dt;
        if (enemy.x <= enemyPlatform.x) {
            enemy.x = enemyPlatform.x;
            enemy.vx = Math.abs(enemy.vx);
        }
        if (enemy.x + enemy.w >= enemyPlatform.x + enemyPlatform.w) {
            enemy.x = enemyPlatform.x + enemyPlatform.w - enemy.w;
            enemy.vx = -Math.abs(enemy.vx);
        }
    }
    const left = keys.has('ArrowLeft') || keys.has('KeyA');
    const right = keys.has('ArrowRight') || keys.has('KeyD');
    player.vx = (Number(right) - Number(left)) * physics.runSpeed;
    if (jumpQueued && player.grounded)
        player.vy = physics.jumpVelocity;
    jumpQueued = false;
    player.vy += physics.gravity * dt;
    player.x = Math.max(0, Math.min(worldWidth - player.w, player.x + player.vx * dt));
    for (const p of platforms) {
        if (overlaps(player, p)) {
            if (player.vx > 0)
                player.x = p.x - player.w;
            if (player.vx < 0)
                player.x = p.x + p.w;
        }
    }
    player.y += player.vy * dt;
    player.grounded = false;
    if (enemy.alive && overlaps(player, enemy)) {
        if (player.vy > 0 && previousBottom <= enemy.y) {
            enemy.alive = false;
            score += 100;
            player.y = enemy.y - player.h;
            player.vy = physics.jumpVelocity / 2;
        }
        else
            state = 'lost';
    }
    for (const p of platforms) {
        if (overlaps(player, p)) {
            if (player.vy >= 0) {
                player.y = p.y - player.h;
                player.grounded = true;
            }
            else
                player.y = p.y + p.h;
            player.vy = 0;
        }
    }
    for (const c of coins) {
        if (!c.taken && overlaps(player, { x: c.x - 10, y: c.y - 10, w: 20, h: 20 })) {
            c.taken = true;
            score++;
        }
    }
    if (state === 'playing' && overlaps(player, flag))
        state = 'won';
    if (player.y > canvas.height + 80)
        state = 'lost';
    camera = Math.max(0, Math.min(worldWidth - canvas.width, player.x - canvas.width * 0.38));
}
function box(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function draw() {
    box(0, 0, canvas.width, canvas.height, '#94d9f5');
    ctx.save();
    ctx.translate(-camera * 0.25, 0);
    for (let x = 100; x < worldWidth; x += 380) {
        ctx.fillStyle = '#e8f8ff';
        ctx.beginPath();
        ctx.ellipse(x, 105, 65, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#70bfa0';
        ctx.beginPath();
        ctx.arc(x + 120, 440, 120, Math.PI, 0);
        ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(-camera, 0);
    for (const p of platforms) {
        box(p.x, p.y, p.w, p.h, '#985c3d');
        box(p.x, p.y, p.w, 8, '#378550');
        for (let x = p.x + 16; x < p.x + p.w; x += 38)
            box(x, p.y + 16, 14, 5, '#be8056');
    }
    for (const c of coins)
        if (!c.taken) {
            ctx.fillStyle = '#ffd447';
            ctx.beginPath();
            ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
            ctx.fill();
            box(c.x - 2, c.y - 6, 4, 12, '#d58a20');
        }
    if (enemy.alive) {
        box(enemy.x, enemy.y, enemy.w, enemy.h, '#8b3152');
        box(enemy.x + 4, enemy.y + 5, 5, 6, '#fff');
        box(enemy.x + 19, enemy.y + 5, 5, 6, '#fff');
        box(enemy.x - 2, enemy.y + 20, 12, 4, '#42243a');
        box(enemy.x + 18, enemy.y + 20, 12, 4, '#42243a');
    }
    box(flag.x, flag.y, 5, flag.h, '#f7f7ee');
    box(flag.x + 5, flag.y, 54, 32, '#e65359');
    box(player.x, player.y + 10, player.w, 26, '#325ec5');
    box(player.x + 3, player.y + 3, 22, 15, '#ffce9b');
    box(player.x - 2, player.y, 32, 8, '#d84143');
    box(player.x + 19, player.y + 9, 4, 4, '#253046');
    ctx.restore();
    box(16, 16, 230, 42, '#18394c');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`SCORE ${score}`, 30, 44);
    if (state !== 'playing') {
        box(190, 155, 420, 145, '#18394c');
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px monospace';
        ctx.fillText(state === 'won' ? 'FLAG REACHED!' : 'TRY AGAIN!', 400, 207);
        ctx.font = '18px monospace';
        ctx.fillText(`Score: ${score} · R to restart`, 400, 255);
        ctx.textAlign = 'left';
    }
}
let previousTime;
let accumulator = 0;
function frame(time) {
    if (previousTime !== undefined)
        accumulator += Math.min((time - previousTime) / 1000, 0.1);
    previousTime = time;
    while (accumulator >= 1 / 120) {
        update(1 / 120);
        accumulator -= 1 / 120;
    }
    draw();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
