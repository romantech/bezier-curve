export interface Point {
  x: number;
  y: number;
}

export type PointList = Point[];

export interface BezierCurveOptions {
  staticCtx: CanvasRenderingContext2D;
  dynamicCtx: CanvasRenderingContext2D;
  points: Point[];
  duration?: number;
  pointColors?: string[];
  finalPointColor?: string;
}

export type DefinedElements<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
