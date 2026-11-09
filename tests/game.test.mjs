import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function game() {
  const context = vm.createContext({
    document: { getElementById: () => ({ width: 800, height: 480, getContext: () => ({}) }) },
    window: { addEventListener(name, handler) { this[name] = handler; } },
    requestAnimationFrame() {},
  });
  vm.runInContext(readFileSync('docs/game.js', 'utf8'), context);
  return (code) => vm.runInContext(code, context);
}

test('movement, gravity, ground collision and jump', () => {
  const run = game();
  run('keys.add("ArrowRight"); update(0.1)');
  assert.ok(run('player.x > 60'));
  run('keys.clear(); for(let i=0;i<120;i++) update(1/120)');
  assert.equal(run('player.y + player.h'), 420);
  assert.equal(run('player.grounded'), true);
  run('jumpQueued = true; update(1/60)');
  assert.ok(run('player.vy < 0'));
});

test('coins, flag, fall and restart', () => {
  const run = game();
  run('player.x=coins[0].x; player.y=coins[0].y; update(0)');
  assert.equal(run('score'), 1);
  run('player.x=flag.x; player.y=380; update(0)');
  assert.equal(run('state'), 'won');
  run('restart(); player.y=600; update(0)');
  assert.equal(run('state'), 'lost');
  run("window.keydown({ code: 'KeyR', repeat: false })");
  assert.equal(run('state'), 'playing');
  assert.equal(run('score'), 0);
  assert.equal(run('coins.every(c => !c.taken)'), true);
});

test('landing on a floating platform and camera following', () => {
  const run = game();
  run('player.x=300; player.y=200; player.vy=300; for(let i=0;i<40;i++) update(1/120)');
  assert.equal(run('player.y + player.h'), 320);
  run('player.x=1400; update(0)');
  assert.ok(run('camera > 0'));
});

test('static output uses a classic script and no runtime dependencies', () => {
  assert.match(readFileSync('docs/index.html', 'utf8'), /<script src="game.js"><\/script>/);
  assert.deepEqual(JSON.parse(readFileSync('package.json', 'utf8')).dependencies ?? {}, {});
});

test('the whole level can be traversed with three gap jumps', () => {
  const run = game();
  run(`
    keys.add('ArrowRight');
    for (let i=0; i<1600 && state === 'playing'; i++) {
      if (player.grounded && (
        (player.x > 565 && player.x < 620) ||
        (player.x > 1305 && player.x < 1360) ||
        (player.x > 2005 && player.x < 2060)
      )) jumpQueued = true;
      update(1/120);
    }
  `);
  assert.equal(run('state'), 'won');
  assert.ok(run('score > 0'));
});

test('one enemy patrols within its platform and reverses at both edges', () => {
  const run = game();
  const start = run('enemy.x');
  run('update(1/120)');
  assert.ok(run('enemy.x > ' + start));
  run('enemy.x=enemyPlatform.x+enemyPlatform.w-enemy.w; enemy.vx=70; update(1/120)');
  assert.ok(run('enemy.vx < 0 && enemy.x + enemy.w <= enemyPlatform.x + enemyPlatform.w'));
  run('enemy.x=enemyPlatform.x; enemy.vx=-70; update(1/120)');
  assert.ok(run('enemy.vx > 0 && enemy.x >= enemyPlatform.x'));
});

test('descending stomp removes enemy, awards 100 once, and restart restores it', () => {
  const run = game();
  run('enemy.x=enemyPlatform.x+5; player.x=enemy.x; player.y=enemy.y-player.h-1; player.vy=250; update(1/120)');
  assert.equal(run('enemy.alive'), false);
  assert.equal(run('score'), 100);
  assert.equal(run('state'), 'playing');
  run('update(1/120)');
  assert.equal(run('score'), 100);
  run('restart()');
  assert.equal(run('enemy.alive'), true);
  assert.equal(run('score'), 0);
});

for (const contact of ['side', 'below']) test(`enemy ${contact} contact loses`, () => {
  const run = game();
  run(contact === 'side'
    ? 'player.x=enemy.x-player.w+2; player.y=enemy.y; update(0)'
    : 'player.x=enemy.x; player.y=enemy.y+enemy.h-2; player.vy=-100; update(0)');
  assert.equal(run('state'), 'lost');
});

test('each floating platform can be landed on using the actual fixed-step physics', () => {
  for (let index = 4; index < 8; index++) {
    const run = game();
    run(`
      const target = platforms[${index}];
      player.x=target.x-65; player.y=420-player.h; player.grounded=true;
      enemy.x=enemyPlatform.x+enemyPlatform.w-enemy.w; enemy.vx=-70;
      keys.add('ArrowRight'); jumpQueued=true;
      for (let step=0; step<60; step++) {
        update(1/120);
        if (player.grounded && player.y+player.h===target.y) break;
      }
    `);
    assert.equal(run('player.y+player.h'), 320, `platform ${index}`);
    assert.equal(run('state'), 'playing');
  }
});
