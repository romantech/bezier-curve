import {
  ACTION,
  type Action,
  type BezierCurveOptions,
  DURATION,
  type Point,
  Publisher,
  STYLE,
} from './lib';

export class BezierCurve extends Publisher {
  private points: Point[];
  /** 애니메이션 진행 시간 */
  private duration: number;
  private elapsedTime: number = 0;
  private animationFrameId: number | null = null;
  private grabbedPointIndex: number | null = null;

  private readonly staticCtx: CanvasRenderingContext2D;
  private readonly dynamicCtx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;
  private readonly pointColors: readonly string[];
  private readonly finalPointColor: string;

  constructor(options: BezierCurveOptions) {
    super();
    this.staticCtx = options.staticCtx;
    this.dynamicCtx = options.dynamicCtx;

    this.points = options.points.slice();
    this.duration = options.duration ?? DURATION.DEFAULT;
    this.pointColors = options.pointColors ?? STYLE.INTERP_COLORS;
    this.finalPointColor = options.finalPointColor ?? STYLE.FINAL_POINT_COLOR;

    this.width = this.staticCtx.canvas.clientWidth;
    this.height = this.staticCtx.canvas.clientHeight;

    this._addEventListeners();
  }

  public get nextAction() {
    return this.animationFrameId ? 'pause' : 'start';
  }

  public get progress() {
    return Math.min(this.elapsedTime / this.duration, 1);
  }

  private get _gridSize() {
    return this.width / STYLE.GRID_DIVISIONS;
  }

  /** 베지에 곡선 가이드, 초기 조절점/레이블 같은 정적 요소 렌더링 */
  public drawStaticLayer(): void {
    const ctx = this.staticCtx;
    this._clearLayer(ctx); // 베지에 곡선 차수(degree) 변경 시 가이드를 다시 그려야하므로 캔버스 초기화

    const { _gridSize } = this;
    // 좌상단, 우하단 경계는 제외하고 내부 영역에만 격자 추가
    for (let x = _gridSize; x < this.width; x += _gridSize) {
      this._drawLine(ctx, { x, y: 0 }, { x, y: this.height }, STYLE.GRID_COLOR); // 세로선(상 > 하 라인 생선)
    }
    for (let y = _gridSize; y < this.height; y += _gridSize) {
      this._drawLine(ctx, { x: 0, y }, { x: this.width, y }, STYLE.GRID_COLOR); // 가로선(좌 > 우 라인 생성)
    }

    // ① 베지에 곡선 가이드
    ctx.beginPath(); // 경로 시작
    ctx.moveTo(this.points[0].x, this.points[0].y); // 시작점으로 이동
    // t 증가값에 따라 곡선의 부드러움(품질)이 결정됨. 0.01은 총 100단계로 곡선을 그림
    // 참고로 캔버스 네이티브 메서드(quadraticCurveTo, bezierCurveTo)로 2차, 3차 곡선을 그릴 수도 있음
    for (let t = 0; t <= 1; t += DURATION.DELTA_T) {
      const p = this._getBezierPoint(this.points, t);
      ctx.lineTo(p.x, p.y); // 계산한 점까지 선 연결 (마지막 지점부터 이어서 연결)
    }

    ctx.strokeStyle = STYLE.GUIDE_COLOR;
    ctx.lineWidth = STYLE.GUIDE_WIDTH;
    ctx.stroke(); // 지정한 경로를 캔버스에 렌더링

    // ② 조절점을 잇는 안내선 (점선)
    ctx.setLineDash(STYLE.GUIDE_DASH); // 점선 모드로 변경. [점선 5px, 빈공간 5px] 형태로 반복
    for (let i = 0; i < this.points.length - 1; i++) {
      this._drawLine(ctx, this.points[i], this.points[i + 1], STYLE.GUIDE_COLOR);
    }
    ctx.setLineDash([]); // 점선 모드 해제 (실선으로 복원)

    // ③ 조절점 및 레이블
    this.points.forEach((p, i) => {
      this._drawPoint(ctx, p, STYLE.CTRL_POINT_COLOR);
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
        this._drawPoint(ctx, interpolatedPoint, color, STYLE.CTRL_POINT_RADIUS);
      }

      // 계산한 보간점 사이를 직선으로 연결
      for (let i = 0; i < nextPoints.length - 1; i++) {
        const [q1, q2] = [nextPoints[i], nextPoints[i + 1]];
        this._drawLine(ctx, q1, q2, color, STYLE.INTERP_WIDTH);
      }

      currentPoints = nextPoints;
      level++;
    }

    // 모든 보간이 끝나고 마지막 남은 점(베지에 곡선 위의 점) 표시
    const finalPoint = currentPoints[0];
    this._drawPoint(ctx, finalPoint, this.finalPointColor, STYLE.CTRL_POINT_RADIUS);
    this._drawLabel(ctx, finalPoint, 'P', -20, 20);
  }

  public togglePlayPause() {
    const methodName = this.nextAction;
    this[methodName]();
  }

  /** 애니메이션 정지. 다음 start() 호출 시 처음부터 시작 */
  public stop() {
    this._cancelAnimation();
    this.elapsedTime = 0;
    this.notify({ type: 'stop', progress: this.progress });
  }

  /** 애니메이션 일시정지. 다음 start() 호출 시 정지 시점부터 이어서 재생 */
  public pause() {
    this._cancelAnimation();
    this.notify({ type: 'pause', progress: this.progress });
  }

  public start(): void {
    if (this.animationFrameId) return;

    this.notify({ type: 'start', progress: this.progress });
    let startTime: number | null = null;

    /**
     * 애니메이션 프레임 콜백
     * @param {number} now 페이지 로드 이후 경과 시간(ms). `performance.now()`와 동일한 값 */
    const animate = (now: number): void => {
      /**
       * 시작 시간 보정 (시작 혹은 재개 대응)
       * 애니메이션 2초 경과 후 일시정지하면, this.elapsedTime = 2000
       * 이후 애니메이션 재개 시, startTime을 '현재시간(now) - 경과시간(2000)'으로 보정하여
       * 다음 프레임의 경과 시간이 2000부터 시작되도록 만듦.
       */
      if (!startTime) startTime = now - this.elapsedTime;

      this.elapsedTime = now - startTime;
      const t = this.progress;

      this.notify({ type: 'tick', progress: t });
      this.drawDynamicLayer(t); // 매 프레임마다 동적 레이어 다시 렌더링

      if (t < 1) this.animationFrameId = requestAnimationFrame(animate);
      else this.stop();
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public setup() {
    this.stop();
    this.drawStaticLayer();
    this.drawDynamicLayer(0);
    this.notify({ type: 'setup', progress: this.progress });
  }

  public setPoints(newPoints: Point[]) {
    this.points = newPoints.slice();
    return this;
  }

  public changeDuration(action: Action) {
    const delta = action === ACTION.INCREASE ? DURATION.STEP : -DURATION.STEP;
    this.duration = this._clampDuration(delta + this.duration);
    return this.duration;
  }

  private _addEventListeners(): void {
    const canvas = this.dynamicCtx.canvas;
    // 모바일에선 터치를 스크롤, 줌 같은 제스처로 처리하므로 캔버스를 드래그 가능한 영역으로 전환하기 위해 touchAction 비활성
    canvas.style.touchAction = 'none';

    canvas.addEventListener('pointerdown', this._onPointerDown.bind(this));
    canvas.addEventListener('pointermove', this._onPointerMove.bind(this));
    canvas.addEventListener('pointerup', this._onPointerUp.bind(this));
    canvas.addEventListener('pointerleave', this._onPointerUp.bind(this));
  }

  private _onPointerDown(e: PointerEvent): void {
    if (this.animationFrameId) return; // 애니메이션 재생 중에는 드래그 비활성화

    const mousePos = this._getPointerPos(e);
    const pointIdx = this.points.findIndex((p) => this._isColliding(p, mousePos));

    if (pointIdx !== -1) {
      this._changeCursor('grabbing');
      this.grabbedPointIndex = pointIdx;
    }
  }

  private _changeCursor(cursor: 'default' | 'grabbing' | 'grab') {
    this.dynamicCtx.canvas.style.cursor = cursor;
  }

  private _onPointerMove(e: PointerEvent): void {
    if (this.animationFrameId) return;

    const mousePos = this._getPointerPos(e);

    if (this.grabbedPointIndex !== null) {
      // 드래그 중일 때: 조절점 위치 업데이트
      this.points[this.grabbedPointIndex] = this._clampPoint(mousePos);
      this.setup();
    } else {
      // 드래그 중이 아닐 때: 커서 아이콘 변경
      const isOverPoint = this.points.some((p) => this._isColliding(p, mousePos));
      this._changeCursor(isOverPoint ? 'grab' : 'default');
    }
  }

  private _onPointerUp(): void {
    if (this.animationFrameId) return;

    // 조절점을 드래그한 후 마우스를 놓았다면 'grab', 빈 공간을 클릭했다 놓았다면 'default' 커서
    this._changeCursor(this.grabbedPointIndex ? 'grab' : 'default');
    this.grabbedPointIndex = null;
  }

  private _getPointerPos(e: PointerEvent): Point {
    const rect = this.dynamicCtx.canvas.getBoundingClientRect();
    return {
      // e.clientX: 화면 왼쪽 최상단부터 이벤트가 발생한 지점까지의 거리
      // rect.left: 화면 좌측부터 해당 엘리먼트의 왼쪽 변까지의 거리
      // e.clientX - rect.left: 해당 엘리먼트의 왼쪽부터 이벤트가 발생한 지점까지의 거리
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private _isColliding(point: Point, mouse: Point): boolean {
    /**
     * 피타고라스 정리를 이용해 point, mouse 사이의 직선 거리(빗변) 계산
     * @see https://webp.romantech.net/distance_between_points.png 참고 이미지
     * */
    const dx = point.x - mouse.x;
    const dy = point.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // 조절점보다 큰 영역으로 지정해서 포인트 선택하기 편하게 설정
    return distance < STYLE.BASE_POINT_RADIUS * 2;
  }

  private _cancelAnimation(): void {
    if (!this.animationFrameId) return;

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  /** Point 좌표를 1개 그리드 사이즈 안으로 제한(가장 바깥쪽 그리드는 경계선이 없으므로) */
  private _clampPoint(point: Point): Point {
    const padding = this._gridSize;
    const x = this._clamp(point.x, padding, this.width - padding);
    const y = this._clamp(point.y, padding, this.height - padding);
    return { x, y };
  }

  /** 애니메이션 진행시간 DURATION.MIN ~ DURATION.MAX 사이로 제한 */
  private _clampDuration(value: number): number {
    return this._clamp(value, DURATION.MIN, DURATION.MAX);
  }

  private _clamp(value: number, min: number, max: number) {
    // value를 먼저 최대값 이하로 제한한 후(Math.min), 최소값 이상으로 제한(Math.max)
    return Math.max(min, Math.min(value, max));
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
    width: number = STYLE.BASE_WIDTH,
  ): void {
    ctx.beginPath(); // 새 경로 시작
    ctx.moveTo(start.x, start.y); // 시작점 설정
    ctx.lineTo(end.x, end.y); // 끝점까지 선 추가
    ctx.strokeStyle = color; // 선 색상 설정
    ctx.lineWidth = width; // 선 두께 설정
    ctx.stroke(); // 정의된 경로에 따라 캔버스에 선 렌더링
  }

  private _drawPoint(
    ctx: CanvasRenderingContext2D,
    point: Point,
    color: string,
    radius: number = STYLE.BASE_POINT_RADIUS,
  ): void {
    ctx.beginPath();
    // arc(x, y, radius, startAngle, endAngle, anticlockwise)
    // 종료 각도를 나타내는 endAngle 인자는 라디언 단위이며 2 * Math.PI는 360도가 됨
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
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
    ctx.font = STYLE.LABEL_FONT;
    ctx.fillStyle = STYLE.LABEL_COLOR;
    ctx.fillText(text, point.x + offsetX, point.y + offsetY);
  }
}
