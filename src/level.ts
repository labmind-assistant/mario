export type Rect = { x: number; y: number; w: number; h: number };
export const worldWidth = 2900;
export const platforms: Rect[] = [
  { x: 0, y: 420, w: 620, h: 120 },
  { x: 740, y: 420, w: 620, h: 120 },
  { x: 1500, y: 420, w: 560, h: 120 },
  { x: 2190, y: 420, w: 710, h: 120 },
  { x: 280, y: 320, w: 130, h: 22 },
  { x: 920, y: 320, w: 150, h: 22 },
  { x: 1650, y: 320, w: 140, h: 22 },
  { x: 2350, y: 320, w: 150, h: 22 },
];
export const flag: Rect = { x: 2780, y: 250, w: 18, h: 170 };
export const physics = { gravity: 1550, jumpVelocity: -570, runSpeed: 260, playerWidth: 28, playerHeight: 36 };
export const spawn = { x: 60, y: 360 };
