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
