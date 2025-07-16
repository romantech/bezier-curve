import type { BezierCurve, BezierEvent, Observer, Point } from '@/core';
import { truncate } from '@/lib/utils.ts';
import {
  ACTION,
  type Action,
  DURATION,
  INITIAL_CURVE,
  SELECTORS,
  TOGGLE_LABEL,
  type ToggleLabel,
} from './config';
import { startOnboarding } from './onboard';
import {
  type BezierCurveType,
  BezierCurveTypes,
  BezierPointRatios,
  type MapPoints,
} from './presets';

export type DefinedElements<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

const UnsafeElements = {
  $staticCanvas: document.querySelector<HTMLCanvasElement>(SELECTORS.STATIC_CANVAS),
  $dynamicCanvas: document.querySelector<HTMLCanvasElement>(SELECTORS.DYNAMIC_CANVAS),

  $curveLabel: document.querySelector<HTMLElement>(SELECTORS.CURVE_LABEL),
  $curvePicker: document.querySelector<HTMLSelectElement>(SELECTORS.CURVE_PICKER),

  $progress: document.querySelector<HTMLOutputElement>(SELECTORS.PROGRESS),
  $progressValue: document.querySelector<HTMLSpanElement>(SELECTORS.PROGRESS_VALUE),
  $controlPoints: document.querySelector<HTMLElement>(SELECTORS.CONTROL_POINTS),

  $duration: document.querySelector<HTMLDivElement>(SELECTORS.DURATION_CONTAINER),
  $durationValue: document.querySelector<HTMLSpanElement>(SELECTORS.DURATION_VALUE),

  $toggleBtn: document.querySelector<HTMLButtonElement>(SELECTORS.TOGGLE_BUTTON),
  $onboardBtn: document.querySelector<HTMLButtonElement>(SELECTORS.ONBOARD_BUTTON),
  $decreaseBtn: document.querySelector<HTMLButtonElement>(SELECTORS.DECREASE_BUTTON),
  $increaseBtn: document.querySelector<HTMLButtonElement>(SELECTORS.INCREASE_BUTTON),
};

type Elements = DefinedElements<typeof UnsafeElements>;

export class Controller implements Observer {
  public readonly elements: Elements;

  constructor() {
    if (Object.values(UnsafeElements).some((el) => el === null)) {
      throw new Error('필수 HTML 요소가 존재하지 않습니다.');
    }

    this.elements = UnsafeElements as Elements;
  }

  public update(event: BezierEvent): void {
    switch (event.type) {
      case 'start':
        this.updateToggleLabel(TOGGLE_LABEL.PAUSE);
        this._toggleScale(this.elements.$progress, true);
        break;
      case 'tick':
      case 'setup':
        this.updateProgressValue(event.progress);
        if (event.points) this.updateControlPoints(event.points);
        break;
      case 'stop':
      case 'pause':
        this.updateToggleLabel(TOGGLE_LABEL.START);
        this._toggleScale(this.elements.$progress, false);
        break;
      default:
        break;
    }
  }

  public updateControlPoints(points: Point[]) {
    const labelTexts = points.map(({ x, y }, i) => `P${i}(${truncate(x)},${truncate(y)})`);

    const createLabelElement = (content: string, idx: number) => {
      const span = document.createElement('span');
      span.textContent = content;
      span.dataset.idx = idx.toString();
      return span;
    };

    const labelElements = labelTexts.map((v, i) => createLabelElement(v, i));

    this.elements.$controlPoints.replaceChildren(...labelElements);
  }

  public updateCurveLabel(label: string) {
    this.elements.$curveLabel.textContent = label;
  }

  public updateProgressValue(t: number) {
    this.elements.$progressValue.textContent = `${t.toFixed(2)}`;
  }

  public updateToggleLabel(label: ToggleLabel) {
    this.elements.$toggleBtn.textContent = label;
  }

  public init(
    bezierCurve: BezierCurve,
    mapPoints: MapPoints,
    curveTypes: readonly BezierCurveType[] = BezierCurveTypes,
    initialCurve: BezierCurveType = INITIAL_CURVE,
  ) {
    this.updateCurveLabel(initialCurve);
    this._populateCurvePicker(curveTypes, initialCurve);
    this._updateDurationValue(DURATION.DEFAULT);
    this._updateDurationButtonStates();
    this._bindEvents(bezierCurve, mapPoints);
    return this;
  }

  private _toggleScale(element: HTMLElement, highlight: boolean) {
    element.classList.toggle('scale-150', highlight);
  }

  private _populateCurvePicker(
    curveTypes: readonly BezierCurveType[],
    initialCurve: BezierCurveType,
  ) {
    const initialKeyIdx = Math.max(0, curveTypes.indexOf(initialCurve));

    curveTypes.forEach((curve, i) => {
      const isSelected = i === initialKeyIdx;
      const option = new Option(curve, curve, isSelected, isSelected);
      this.elements.$curvePicker.add(option);
    });
  }

  private _bindEvents(bezierCurve: BezierCurve, mapPoints: MapPoints) {
    const { $toggleBtn, $curvePicker, $duration, $onboardBtn } = this.elements;

    $toggleBtn.addEventListener('click', bezierCurve.togglePlayPause.bind(bezierCurve));
    $onboardBtn.addEventListener('click', () => startOnboarding(true));

    $curvePicker.addEventListener('change', (e) => {
      const selected = (e.target as HTMLSelectElement).value as BezierCurveType;
      const controlPoints = mapPoints(BezierPointRatios[selected]);

      this.updateCurveLabel(selected);
      bezierCurve.setPoints(controlPoints).setup();
    });

    $duration.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action !== ACTION.INCREASE && action !== ACTION.DECREASE) return;

      this._handleDurationChange(bezierCurve, action);
    });
  }

  private _handleDurationChange(bezierCurve: BezierCurve, action: Action) {
    const newDuration = bezierCurve.changeDuration(action);
    this._updateDurationValue(newDuration);
    this._updateDurationButtonStates();
  }

  private _updateDurationValue(duration: number) {
    this.elements.$durationValue.textContent = `${Math.trunc(duration / 1000)}`;
    this.elements.$durationValue.dataset.value = `${duration}`;
  }

  private _updateDurationButtonStates() {
    const { $durationValue, $decreaseBtn, $increaseBtn } = this.elements;

    const ms = parseInt($durationValue.dataset.value ?? `${DURATION.DEFAULT}`, 10);
    $decreaseBtn.disabled = ms <= DURATION.MIN;
    $increaseBtn.disabled = ms >= DURATION.MAX;
  }
}

/** 싱글턴(단일 인스턴스)으로 사용 */
export const controller = new Controller();
