import { ACTION, type Action, CanvasRenderer, DURATION, STYLE } from '@/lib';
import { clamp } from './lerp';
import { Publisher } from './observer';

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

export class BezierCurve extends Publisher {
  private points: Point[];
  /** 애니메이션 진행 시간 */
  private duration: number;
  private elapsedTime: number = 0;
  private animationFrameId: number | null = null;
  private grabbedPointIndex: number | null = null;

  private readonly renderer: CanvasRenderer;
  private readonly dynamicCanvas: HTMLCanvasElement;
  private readonly width: number;
  private readonly height: number;

  constructor(options: BezierCurveOptions) {
    super();
    this.points = options.points.slice();
    this.duration = options.duration ?? DURATION.DEFAULT;

    this.renderer = new CanvasRenderer(
      options.staticCtx,
      options.dynamicCtx,
      options.pointColors ?? STYLE.INTERP_COLORS,
      options.finalPointColor ?? STYLE.FINAL_POINT_COLOR,
    );

    this.dynamicCanvas = options.dynamicCtx.canvas;
    this.width = this.dynamicCanvas.clientWidth;
    this.height = this.dynamicCanvas.clientHeight;

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

  public drawLayer(type: 'static' | 'dynamic' | 'both', t = 0) {
    const isBoth = type === 'both';
    if (type === 'static' || isBoth) this.renderer.drawStaticLayer(this.points);
    if (type === 'dynamic' || isBoth) this.renderer.drawDynamicLayer(this.points, t);
  }

  public togglePlayPause() {
    const action = this.nextAction;
    this[action]();
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
      this.drawLayer('dynamic', t); // 매 프레임마다 동적 레이어 다시 렌더링

      if (t < 1) this.animationFrameId = requestAnimationFrame(animate);
      else this.stop();
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public setup() {
    this.stop();
    this.drawLayer('both');
    this.notify({ type: 'setup', progress: this.progress });
  }

  public setPoints(newPoints: Point[]) {
    this.points = newPoints.slice();
    return this;
  }

  /**
   * this.duration 조정 메서드
   * duration 길어질수록 t 증가 폭 줄어듦 -> 애니메이션 더 느리게 진행
   *
   * [예시] 각 프레임에서 t가 증가하는 폭(Δt) 비교 (프레임 간격: 16ms 가정)
   * - duration 1000ms일 때: Δt ≈ 16 / 1000 = 0.016
   * - duration 10000ms일 때: Δt ≈ 16 / 10000 = 0.0016
   */
  public changeDuration(action: Action) {
    const delta = action === ACTION.INCREASE ? DURATION.STEP : -DURATION.STEP;
    this.duration = this._clampDuration(delta + this.duration);
    return this.duration;
  }

  private _addEventListeners(): void {
    const canvas = this.dynamicCanvas;
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
    this.dynamicCanvas.style.cursor = cursor;
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
    const rect = this.dynamicCanvas.getBoundingClientRect();
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
     * 피타고라스 정리를 이용해 point와 mouse 사이의 거리(빗변) 계산
     * @see https://webp.romantech.net/distance_between_points.png 참고 이미지
     * */
    const dx = point.x - mouse.x;
    const dy = point.y - mouse.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    // 클릭 판정 영역을 넓게 설정하여 선택하기 쉽도록 함
    return distance < STYLE.BASE_POINT_RADIUS * 2.5;
  }

  private _cancelAnimation(): void {
    if (!this.animationFrameId) return;

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  /** Point 좌표를 1개 그리드 사이즈 안으로 제한(가장 바깥쪽 그리드는 경계선이 없으므로) */
  private _clampPoint(point: Point): Point {
    const padding = this._gridSize;
    const x = clamp(point.x, padding, this.width - padding);
    const y = clamp(point.y, padding, this.height - padding);
    return { x, y };
  }

  /** 애니메이션 진행시간 DURATION.MIN ~ DURATION.MAX 사이로 제한 */
  private _clampDuration(value: number): number {
    return clamp(value, DURATION.MIN, DURATION.MAX);
  }
}
