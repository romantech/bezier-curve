const DURATION = {
  DEFAULT: 4000,
  MIN: 1000,
  MAX: 10000,
  STEP: 1000,
  DELTA_T: 0.01,
} as const;

const STYLE = {
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

export const CONFIG = {
  STYLE,
  DURATION,
} as const;
