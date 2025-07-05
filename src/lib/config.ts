export const DURATION = {
  /** 기본 진행 시간(ms) */
  DEFAULT: 4000,
  /** 최소 진행 시간(ms) */
  MIN: 1000,
  /** 최대 진행 시간(ms) */
  MAX: 10000,
  /** 증감 단위(ms) */
  STEP: 1000,
  /** 보간 단계 간격 (t 값 변화량) */
  DELTA_T: 0.01,
} as const;

export const STYLE = {
  GRID_COLOR: '#333',
  GRID_DIVISIONS: 10,
  GUIDE_COLOR: '#555',
  GUIDE_WIDTH: 3,
  GUIDE_DASH: [5, 5],
  INTERP_WIDTH: 2,
  BASE_WIDTH: 1,

  BASE_POINT_SIZE: 7,
  CTRL_POINT_SIZE: 6,
  CTRL_POINT_COLOR: '#fff',
  FINAL_POINT_COLOR: '#F9DE60',

  /** 보간 단계별 색상 */
  INTERP_COLORS: ['#72CC7C', '#58BDED', '#F9A825', '#E91E63'],
  LABEL_COLOR: '#fff',
  LABEL_FONT: '14px sans-serif',
} as const;

export const ACTION = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
} as const;

export const CONFIG = {
  STYLE,
  DURATION,
  ACTION,
} as const;

export type Action = (typeof ACTION)[keyof typeof ACTION];
