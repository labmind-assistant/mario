import { platforms, flag, physics, spawn } from '../src/level';

const { gravity, jumpVelocity, runSpeed, playerWidth, playerHeight } = physics;
const jumpSpeed = -jumpVelocity;
const maxHeight = jumpSpeed ** 2 / (2 * gravity);
const surfaces = platforms.map((p, i) => ({ ...p, name: `surface ${i} (x=${p.x}, y=${p.y})` }));
// The flag is a trigger: reaching its base on the final ground wins.
const nodes = [...surfaces, { ...flag, y: flag.y + flag.h, name: 'flag' }];
function canReach(a: typeof nodes[number], b: typeof nodes[number]): boolean {
  const rise = a.y - b.y;
  if (rise > maxHeight) return false;
  const airtime = (jumpSpeed + Math.sqrt(jumpSpeed ** 2 - 2 * gravity * rise)) / gravity;
  const gap = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  return gap < runSpeed * airtime + playerWidth;
}
const start = surfaces.findIndex(p => spawn.x + playerWidth > p.x && spawn.x < p.x + p.w && spawn.y + playerHeight <= p.y);
if (start < 0) throw new Error('Spawn has no supporting surface');
const reached = new Set([start]);
const queue = [start];
for (const from of queue) {
  nodes.forEach((to, index) => {
    if (!reached.has(index) && canReach(nodes[from], to)) {
      reached.add(index);
      queue.push(index);
    }
  });
}
const missing = nodes.filter((_, i) => !reached.has(i));
for (const node of missing) {
  const nearest = [...reached].map(i => nodes[i]).sort((a, b) =>
    Math.abs(a.x - node.x) + Math.abs(a.y - node.y) - Math.abs(b.x - node.x) - Math.abs(b.y - node.y))[0];
  console.error(`Unreachable: ${node.name}; stuck from reachable ${nearest.name}`);
}
if (missing.length) throw new Error(`${missing.length} unreachable surfaces/flag`);
console.log(`Reachability PASS: ${nodes.map(n => n.name).join(', ')}`);
