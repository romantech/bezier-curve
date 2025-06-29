export interface Point {
  x: number;
  y: number;
}

export interface BezierCurveOptions {
  staticCtx: CanvasRenderingContext2D;
  dynamicCtx: CanvasRenderingContext2D;
  points: Point[];
  duration?: number;
  colors?: string[];
  finalPointColor?: string;
  labelElem?: HTMLLabelElement | null;
}
