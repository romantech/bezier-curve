import type { Degree, Point } from './types';

export const BezierPoints = {
  /** 2차 베지에 곡선 */
  quadratic: [
    { x: 50, y: 350 },
    { x: 250, y: 50 },
    { x: 450, y: 350 },
  ],
  /** 3차 베지에 곡선 */
  cubic: [
    { x: 50, y: 350 },
    { x: 250, y: 350 },
    { x: 250, y: 50 },
    { x: 450, y: 50 },
  ],
  /** 4차 베지에 곡선 */
  quartic: [
    { x: 50, y: 200 },
    { x: 150, y: 350 },
    { x: 250, y: 50 },
    { x: 350, y: 350 },
    { x: 450, y: 200 },
  ],
} satisfies Record<Degree, Point[]>;
