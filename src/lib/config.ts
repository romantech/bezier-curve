import type { BezierCurveType } from './presets';

export const DURATION = {
  /** 기본 진행 시간(ms) */
  DEFAULT: 3000,
  /** 최소 진행 시간(ms) */
  MIN: 1000,
  /** 최대 진행 시간(ms) */
  MAX: 15000,
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

  BASE_POINT_RADIUS: 7,
  CTRL_POINT_RADIUS: 6,
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

export const TOGGLE_LABEL = {
  PAUSE: 'pause',
  START: 'start',
} as const;

export const INITIAL_CURVE: BezierCurveType = 'cubic';

export const SELECTORS = {
  CANVAS_CONTAINER: '.canvas-container',
  STATIC_CANVAS: '.static-canvas',
  DYNAMIC_CANVAS: '.dynamic-canvas',

  CURVE_LABEL: '.curve-label',
  CURVE_PICKER: '.curve-picker',
  T_VALUE: '.t-value',
  POINTS_VALUE: '.points-value',

  DURATION_CONTAINER: '.duration',
  DURATION_VALUE: '.duration-value',

  TOGGLE_BUTTON: '.toggle-button',
  ONBOARD_BUTTON: '.onboard-button',
  DECREASE_BUTTON: 'button[data-action="decrease"]',
  INCREASE_BUTTON: 'button[data-action="increase"]',
} as const;

export const CONFIG = {
  STYLE,
  DURATION,
  ACTION,
  INITIAL_CURVE,
  TOGGLE_LABEL,
} as const;

export type Action = (typeof ACTION)[keyof typeof ACTION];
export type ToggleLabel = (typeof TOGGLE_LABEL)[keyof typeof TOGGLE_LABEL];
