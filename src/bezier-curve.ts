import type { BezierCurveOptions, Point } from './lib';

export class BezierCurve {
  public points: Point[];
  private readonly staticCtx: CanvasRenderingContext2D;
  private readonly dynamicCtx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;
  private readonly duration: number;
  private readonly colors: string[];
  private readonly finalPointColor: string;
  private readonly labelElem: HTMLLabelElement | null;
  private animationFrameId: number | null = null;

  constructor(options: BezierCurveOptions) {
    this.staticCtx = options.staticCtx;
    this.dynamicCtx = options.dynamicCtx;
    this.points = options.points;
    this.duration = options.duration ?? 4000;
    this.colors = options.colors ?? ['#72CC7C', '#58BDED', '#F9A825', '#E91E63'];
    this.finalPointColor = options.finalPointColor ?? '#F9DE60';

    this.width = this.staticCtx.canvas.clientWidth;
    this.height = this.staticCtx.canvas.clientHeight;

    this.labelElem = options.labelElem ?? null;
  }

  public drawStaticLayer(): void {
    const ctx = this.staticCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 격자
    for (let x = 50; x < this.width; x += 50) {
      this._drawLine(ctx, { x, y: 0 }, { x, y: this.height }, '#333');
    }
    for (let y = 50; y < this.height; y += 50) {
      this._drawLine(ctx, { x: 0, y }, { x: this.width, y }, '#333');
    }

    // 베지어 곡선 전체 경로
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let t = 0; t <= 1; t += 0.01) {
      const p = this._getBezierPoint(this.points, t);
      ctx.lineTo(p.x, p.y);
    }

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 제어점을 잇는 안내선 (점선)
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < this.points.length - 1; i++) {
      this._drawLine(ctx, this.points[i], this.points[i + 1], '#555');
    }
    ctx.setLineDash([]);

    // 제어점 및 레이블
    this.points.forEach((p, i) => {
      this._drawPoint(ctx, p, '#fff', 7);
      this._drawLabel(ctx, p, `P${i}`, 8, -8);
    });
  }

  public drawDynamicLayer(t: number): void {
    const ctx = this.dynamicCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    let currentPoints = this.points;
    let level = 0;

    while (currentPoints.length > 1) {
      const color = this.colors[level % this.colors.length];
      const nextPoints: Point[] = [];
      for (let i = 0; i < currentPoints.length - 1; i++) {
        const p1 = currentPoints[i];
        const p2 = currentPoints[i + 1];
        const interpolatedPoint = this._getInterpolatedPoint(p1, p2, t);
        nextPoints.push(interpolatedPoint);
        this._drawPoint(ctx, interpolatedPoint, color);
      }
      for (let i = 0; i < nextPoints.length - 1; i++) {
        this._drawLine(ctx, nextPoints[i], nextPoints[i + 1], color, 2);
      }
      currentPoints = nextPoints;
      level++;
    }

    if (currentPoints.length > 0) {
      const finalPoint = currentPoints[0];
      this._drawPoint(ctx, finalPoint, this.finalPointColor, 8);
      this._drawLabel(ctx, finalPoint, 'P', -20, 20);
    }
  }

  public start(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    let startTime: number | null = null;
    const animate = (now: number): void => {
      if (!startTime) startTime = now;
      const t = Math.min((now - startTime) / this.duration, 1);
      if (this.labelElem) this.labelElem.textContent = `t = ${t.toFixed(2)}`;

      this.drawDynamicLayer(t);
      if (t < 1) this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  private _lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private _getInterpolatedPoint(p1: Point, p2: Point, t: number): Point {
    return {
      x: this._lerp(p1.x, p2.x, t),
      y: this._lerp(p1.y, p2.y, t),
    };
  }

  /**
   * 한 단계의 보간점들을 계산하는 헬퍼 함수
   */
  private _getIntermediatePoints(points: Point[], t: number): Point[] {
    const newPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      newPoints.push(this._getInterpolatedPoint(points[i], points[i + 1], t));
    }
    return newPoints;
  }

  private _drawLine(
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    color: string,
    width = 1,
  ): void {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  private _drawPoint(ctx: CanvasRenderingContext2D, point: Point, color: string, size = 6): void {
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  private _drawLabel(
    ctx: CanvasRenderingContext2D,
    point: Point,
    text: string,
    offsetX = 8,
    offsetY = -8,
  ): void {
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, point.x + offsetX, point.y + offsetY);
  }

  /**
   * t 시점의 베지에 곡선 위의 점 계산
   * */
  private _getBezierPoint(points: Point[], t: number): Point {
    if (points.length === 1) return points[0]; // 점 하나 남으면 반환

    // 현재 단계의 보간점 계산
    const intermediatePoints = this._getIntermediatePoints(points, t);
    // 보간점들을 가지고 다시 재귀 호출
    return this._getBezierPoint(intermediatePoints, t);
  }
}
