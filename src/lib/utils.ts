export const clamp = (value: number, min: number, max: number): number => {
  // value를 먼저 최대값 이하로 제한한 후(Math.min), 최소값 이상으로 제한(Math.max)
  return Math.max(min, Math.min(value, max));
};

/**
 * 소수점 n자리까지 버림(truncate)하여 반환
 * @param num 원본 숫자
 * @param n 유지할 소수점 자리수 (0 이상 정수)
 */
export const truncate = (num: number, n: number = 2): number => {
  const factor = 10 ** n;
  return Math.trunc(num * factor) / factor;
};

export const isMobile = (): boolean => {
  // 포인터가 터치 방식이거나
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  // 호버 기능이 없거나
  const hasNoHover = window.matchMedia('(hover: none)').matches;
  // 화면 폭이 768px 이하인 경우
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

  return isCoarsePointer || hasNoHover || isSmallScreen;
};

/**
 * Converts cubic bezier control points to CSS cubic-bezier format
 * @param points Array of 4 normalized points (0-1 range) representing P0, P1, P2, P3
 * @returns CSS cubic-bezier string in format "cubic-bezier(x1, y1, x2, y2)" or null if invalid
 */
export const toCssCubicBezier = (
  points: Array<{ x: number; y: number }>,
): string | null => {
  if (points.length !== 4) {
    throw new Error('Cubic bezier requires exactly 4 points');
  }

  const [p0, p1, p2, p3] = points;

  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;

  if (Math.abs(dx) < 1e-10 || Math.abs(dy) < 1e-10) {
    return null;
  }

  const x1 = (p1.x - p0.x) / dx;
  const y1 = (p1.y - p0.y) / dy;
  const x2 = (p2.x - p0.x) / dx;
  const y2 = (p2.y - p0.y) / dy;

  // CSS cubic-bezier requires x1 and x2 to be between 0 and 1
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
    return null;
  }

  return `cubic-bezier(${x1.toFixed(2)}, ${y1.toFixed(2)}, ${x2.toFixed(2)}, ${y2.toFixed(2)})`;
};
