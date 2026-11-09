import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function game() {
  const context = vm.createContext({
    document: { getElementById: () => ({ width: 800, height: 480, getContext: () => ({}) }) },
    window: { addEventListener() {} },
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
  run('restart()');
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
