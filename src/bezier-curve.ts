import type { BezierCurveOptions, Point } from './lib';

export class BezierCurve {
  public points: Point[];
  /** t 값이 증가했을 때 수행할 액션 */
  public readonly onTick: BezierCurveOptions['onTick'];

  private readonly staticCtx: CanvasRenderingContext2D;
  private readonly dynamicCtx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;
  private readonly duration: number;
  private readonly pointColors: string[];
  private readonly finalPointColor: string;
  private animationFrameId: number | null = null;

  constructor(options: BezierCurveOptions) {
    this.staticCtx = options.staticCtx;
    this.dynamicCtx = options.dynamicCtx;

    this.points = options.points.slice();
    this.duration = options.duration ?? 4000;
    this.pointColors = options.pointColors ?? ['#72CC7C', '#58BDED', '#F9A825', '#E91E63'];
    this.finalPointColor = options.finalPointColor ?? '#F9DE60';

    this.width = this.staticCtx.canvas.clientWidth;
    this.height = this.staticCtx.canvas.clientHeight;
    this.onTick = options.onTick;
  }

  /** 베지에 곡선 가이드, 초기 조절점/레이블 같은 정적 요소 렌더링 */
  public drawStaticLayer(): void {
    const ctx = this.staticCtx;
    this._clearLayer(ctx); // 베지에 곡선 차수(degree) 변경 시 가이드를 다시 그려야하므로 캔버스 초기화

    const gridSize = this.width / 10;
    // 좌상단, 우하단 경계는 제외하고 내부 영역에만 격자 추가
    for (let x = gridSize; x < this.width; x += gridSize) {
      this._drawLine(ctx, { x, y: 0 }, { x, y: this.height }, '#333'); // 세로선(상 > 하 라인 생선)
    }
    for (let y = gridSize; y < this.height; y += gridSize) {
      this._drawLine(ctx, { x: 0, y }, { x: this.width, y }, '#333'); // 가로선(좌 > 우 라인 생성)
    }

    // ① 베지에 곡선 가이드
    ctx.beginPath(); // 경로 시작
    ctx.moveTo(this.points[0].x, this.points[0].y); // 시작점으로 이동
    // t 증가값에 따라 곡선의 부드러움(품질)이 결정됨. 0.01은 총 100단계로 곡선을 그림
    // 참고로 캔버스 네이티브 메서드(quadraticCurveTo, bezierCurveTo)로 2차, 3차 곡선을 그릴 수도 있음
    for (let t = 0; t <= 1; t += 0.01) {
      const p = this._getBezierPoint(this.points, t);
      ctx.lineTo(p.x, p.y); // 계산한 점까지 선 연결 (마지막 지점부터 이어서 연결)
    }

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    ctx.stroke(); // 지정한 경로를 캔버스에 렌더링

    // ② 조절점을 잇는 안내선 (점선)
    ctx.setLineDash([5, 5]); // 점선 모드로 변경. [점선 5px, 빈공간 5px] 형태로 반복
    for (let i = 0; i < this.points.length - 1; i++) {
      this._drawLine(ctx, this.points[i], this.points[i + 1], '#555');
    }
    ctx.setLineDash([]); // 점선 모드 해제 (실선으로 복원)

    // ③ 조절점 및 레이블
    this.points.forEach((p, i) => {
      this._drawPoint(ctx, p, '#fff', 7);
      const offsetX = i % 2 === 0 ? -26 : 10;
      this._drawLabel(ctx, p, `P${i}`, offsetX, -8);
    });
  }

  /** 애니메이션의 각 프레임에서 t 값에 따라 변하는 동적 요소 렌더링 */
  public drawDynamicLayer(t: number): void {
    const ctx = this.dynamicCtx;
    // 이전에 그렸던 모든 그래픽 요소 제거 (잔상처럼 보이는 현상 없애기 위해)
    this._clearLayer(ctx);

    let currentPoints = this.points;
    let level = 0;

    while (currentPoints.length > 1) {
      const color = this.pointColors[level % this.pointColors.length];
      const nextPoints: Point[] = [];

      // 현재 레벨의 보간점 계산
      for (let i = 0; i < currentPoints.length - 1; i++) {
        const [p1, p2] = [currentPoints[i], currentPoints[i + 1]];
        const interpolatedPoint = this._getInterpolatedPoint(p1, p2, t);
        nextPoints.push(interpolatedPoint);
        this._drawPoint(ctx, interpolatedPoint, color);
      }

      // 계산한 보간점 사이를 직선으로 연결
      for (let i = 0; i < nextPoints.length - 1; i++) {
        const [q1, q2] = [nextPoints[i], nextPoints[i + 1]];
        this._drawLine(ctx, q1, q2, color, 2);
      }

      currentPoints = nextPoints;
      level++;
    }

    // 모든 보간이 끝나고 마지막 남은 점(베지에 곡선 위의 점) 표시
    const finalPoint = currentPoints[0];
    this._drawPoint(ctx, finalPoint, this.finalPointColor, 8);
    this._drawLabel(ctx, finalPoint, 'P', -20, 20);
  }

  public stop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    return this;
  }

  public start(): void {
    this.stop();

    let startTime: number | null = null;
    const animate = (now: number): void => {
      if (!startTime) startTime = now;

      const t = Math.min((now - startTime) / this.duration, 1);
      this.onTick(t);
      this.drawDynamicLayer(t); // 매 프레임마다 동적 레이어 다시 렌더링

      if (t < 1) this.animationFrameId = requestAnimationFrame(animate);
      else this.animationFrameId = null;
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public reset() {
    this.drawStaticLayer();
    this.drawDynamicLayer(0);
    this.onTick(0);
  }

  public setPoints(newPoints: Point[]) {
    this.points = newPoints.slice();
    return this;
  }

  /**
   * 선형보간 계산식: (1 - t)P₁ + tP₂
   * 만약 P₁ = a, P₂ = b 라고 가정하면...
   * (1 - t)a + tb = a - at + tb -> a + tb - at = a + t(b - a)
   * */
  private _lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /** 두 점 사이를 주어진 비율 t로 선형 보간(Lerp)한 점 계산 */
  private _getInterpolatedPoint(start: Point, end: Point, t: number): Point {
    return {
      x: this._lerp(start.x, end.x, t),
      y: this._lerp(start.y, end.y, t),
    };
  }

  /** 인접한 조절점 사이를 t 비율로 보간한 점들을 배열로 반환 */
  private _getIntermediatePoints(points: Point[], t: number): Point[] {
    const interpolatedPoints: Point[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const [start, end] = [points[i], points[i + 1]];
      interpolatedPoints.push(this._getInterpolatedPoint(start, end, t));
    }

    return interpolatedPoints;
  }

  /** t 시점(0~1)의 베지에 곡선 위의 점을 재귀적으로 계산 */
  private _getBezierPoint(points: Point[], t: number): Point {
    if (points.length === 1) return points[0]; // 점 하나 남으면 반환

    // 현재 단계의 보간점 계산
    const intermediatePoints = this._getIntermediatePoints(points, t);
    // 계산한 보간점으로 다시 재귀 호출
    return this._getBezierPoint(intermediatePoints, t);
  }

  private _clearLayer(ctx: CanvasRenderingContext2D) {
    // clearRect() 메서드는 캔버스에서 특정 영역을 지울 때 사용
    // clearRect(x, y, width, height) - (x,y) 좌표부터 width×height 크기만큼 지움
    ctx.clearRect(0, 0, this.width, this.height);
  }

  private _drawLine(
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    color: string,
    width = 1,
  ): void {
    ctx.beginPath(); // 새 경로 시작
    ctx.moveTo(start.x, start.y); // 시작점 설정
    ctx.lineTo(end.x, end.y); // 끝점까지 선 추가
    ctx.strokeStyle = color; // 선 색상 설정
    ctx.lineWidth = width; // 선 두께 설정
    ctx.stroke(); // 캔버스에 렌더링
  }

  private _drawPoint(ctx: CanvasRenderingContext2D, point: Point, color: string, size = 6): void {
    ctx.beginPath();
    // arc(x, y, radius, startAngle, endAngle, anticlockwise)
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
}
