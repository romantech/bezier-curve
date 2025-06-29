export type Degree = 'quadratic' | 'cubic' | 'quartic';

export interface Point {
  x: number;
  y: number;
}

export interface BezierCurveOptions {
  staticCtx: CanvasRenderingContext2D;
  dynamicCtx: CanvasRenderingContext2D;
  points: Point[];
  duration?: number;
  pointColors?: string[];
  finalPointColor?: string;
  tLabelElem?: HTMLElement | null;
}

export type DefinedElements<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
