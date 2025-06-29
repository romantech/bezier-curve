import type { Degree, Point } from './types';

export const BezierPointRatios = {
  /** 2차 베지에 곡선 비율 */
  quadratic: [
    /** x: 50, y: 350 */
    { x: 0.1, y: 0.875 },
    /** x: 250, y: 50 */
    { x: 0.5, y: 0.125 },
    /** x: 450, y: 350 */
    { x: 0.9, y: 0.875 },
  ],
  /** 3차 베지에 곡선 비율 */
  cubic: [
    /** x: 50, y: 350 */
    { x: 0.1, y: 0.875 },
    /** x: 250, y: 350 */
    { x: 0.5, y: 0.875 },
    /** x: 250, y: 50 */
    { x: 0.5, y: 0.125 },
    /** x: 450, y: 50 */
    { x: 0.9, y: 0.125 },
  ],
  /** 4차 베지에 곡선 비율 */
  quartic: [
    /** x: 50, y: 200 */
    { x: 0.1, y: 0.5 },
    /** x: 150, y: 350 */
    { x: 0.3, y: 0.875 },
    /** x: 250, y: 50 */
    { x: 0.5, y: 0.125 },
    /** x: 350, y: 350 */
    { x: 0.7, y: 0.875 },
    /** x: 450, y: 200 */
    { x: 0.9, y: 0.5 },
  ],
} satisfies Record<Degree, Point[]>;

export const BezierDegreeKeys = Object.keys(BezierPointRatios);

export const createPointMapper = (width: number, height: number) => {
  return (ratioPoints: Point[]) =>
    ratioPoints.map((point) => ({
      x: point.x * width,
      y: point.y * height,
    }));
};
