import type { Point, PointList } from '@/core';

export const BezierPointRatios = {
  /** 1차 베지에 곡선 비율 (직선) */
  linear: [
    /** x: 50, y: 350 */
    { x: 0.1, y: 0.875 },
    /** x: 450, y: 50 */
    { x: 0.9, y: 0.125 },
  ],
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
  /** 5차 베지에 곡선 비율 */
  quintic: [
    /** x: 50, y: 300 */
    { x: 0.1, y: 0.75 },
    /** x: 130, y: 100 */
    { x: 0.26, y: 0.25 },
    /** x: 220, y: 350 */
    { x: 0.44, y: 0.875 },
    /** x: 280, y: 50 */
    { x: 0.56, y: 0.125 },
    /** x: 370, y: 350 */
    { x: 0.74, y: 0.875 },
    /** x: 450, y: 150 */
    { x: 0.9, y: 0.375 },
  ],
} satisfies Record<string, PointList>;

export type BezierCurveType = keyof typeof BezierPointRatios;
export const BezierCurveTypes = Object.keys(BezierPointRatios) as readonly BezierCurveType[];

export type MapPoints = ReturnType<typeof createPointMapper>;
export const createPointMapper = (width: number, height: number) => {
  return (ratioPoints: Point[]) =>
    ratioPoints.map((point) => ({
      x: point.x * width,
      y: point.y * height,
    }));
};
