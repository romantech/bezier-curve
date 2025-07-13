import type { Point } from './bezier-curve';

/**
 * 선형보간 계산식: (1 - t)P₁ + tP₂
 * 만약 P₁ = a, P₂ = b 라고 가정하면...
 * (1 - t)a + tb = a - at + tb -> a + tb - at = a + t(b - a)
 * */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 두 점 사이를 주어진 비율 t로 선형 보간(Lerp)한 점 계산 */
export function getInterpolatedPoint(start: Point, end: Point, t: number): Point {
  return {
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  };
}

/** 인접한 조절점 사이를 t 비율로 보간한 점들을 배열로 반환 */
export function getIntermediatePoints(points: Point[], t: number): Point[] {
  const interpolatedPoints: Point[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const [start, end] = [points[i], points[i + 1]];
    interpolatedPoints.push(getInterpolatedPoint(start, end, t));
  }

  return interpolatedPoints;
}

/** t 시점(0~1)의 베지에 곡선 위의 점을 재귀적으로 계산 */
export function getBezierPoint(points: Point[], t: number): Point {
  if (points.length === 1) return points[0]; // 점 하나 남으면 반환

  // 현재 단계의 보간점 계산
  const intermediatePoints = getIntermediatePoints(points, t);
  // 계산한 보간점으로 다시 재귀 호출
  return getBezierPoint(intermediatePoints, t);
}

export function clamp(value: number, min: number, max: number): number {
  // value를 먼저 최대값 이하로 제한한 후(Math.min), 최소값 이상으로 제한(Math.max)
  return Math.max(min, Math.min(value, max));
}
