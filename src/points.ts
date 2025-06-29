import type { Point } from './types';

type CurveType = 'quadratic' | 'cubic' | 'quartic';

export const Points: Record<CurveType, Point[]> = {
  // 2차 (Quadratic)
  quadratic: [
    { x: 50, y: 350 },
    { x: 250, y: 50 },
    { x: 450, y: 350 },
  ],
  // 3차 (Cubic)
  cubic: [
    { x: 50, y: 350 },
    { x: 250, y: 350 },
    { x: 250, y: 50 },
    { x: 450, y: 50 },
  ],
  // 4차 (Quartic)
  quartic: [
    { x: 50, y: 200 },
    { x: 150, y: 350 },
    { x: 250, y: 50 },
    { x: 350, y: 350 },
    { x: 450, y: 200 },
  ],
};
