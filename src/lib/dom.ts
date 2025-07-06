import type { DefinedElements, Point } from './types';
import { type BezierCurveType, BezierCurveTypes, BezierPointRatios } from './bezier-points';
import type { BezierCurve } from '../bezier-curve';
import { ACTION, DURATION, INITIAL_CURVE } from './config';

const UnsafeElements = {
  $staticCanvas: document.querySelector<HTMLCanvasElement>('.static-canvas'),
  $dynamicCanvas: document.querySelector<HTMLCanvasElement>('.dynamic-canvas'),

  $curveLabel: document.querySelector<HTMLElement>('.curve-label'),
  $curvePicker: document.querySelector<HTMLSelectElement>('.curve-picker'),

  $tLabel: document.querySelector<HTMLSpanElement>('.t-value'),

  $duration: document.querySelector<HTMLDivElement>('.duration'),
  $durationValue: document.querySelector<HTMLSpanElement>('.duration-value'),

  $toggleBtn: document.querySelector<HTMLButtonElement>('.toggle-button'),
  $decreaseBtn: document.querySelector<HTMLButtonElement>('button[data-action="decrease"]'),
  $increaseBtn: document.querySelector<HTMLButtonElement>('button[data-action="increase"]'),
};

type Elements = DefinedElements<typeof UnsafeElements>;

export class UIController {
  public readonly elements: Elements;

  constructor() {
    if (Object.values(UnsafeElements).some((el) => el === null)) {
      throw new Error('필수 HTML 요소가 존재하지 않습니다.');
    }

    this.elements = UnsafeElements as Elements;
  }

  public updateCurveLabel(label: string) {
    this.elements.$curveLabel.textContent = label;
  }

  public populateCurvePicker(
    curveTypes = BezierCurveTypes,
    initialCurve: BezierCurveType = INITIAL_CURVE,
  ) {
    const initialKeyIdx = Math.max(0, curveTypes.indexOf(initialCurve));

    curveTypes.forEach((curve, i) => {
      const isSelected = i === initialKeyIdx;
      const option = new Option(curve, curve, isSelected, isSelected);
      this.elements.$curvePicker.add(option);
    });

    return curveTypes[initialKeyIdx];
  }

  public updateTLabel(value: number) {
    this.elements.$tLabel.textContent = `${value.toFixed(2)}`;
  }

  public updateToggleLabel(nextActionLabel: string) {
    this.elements.$toggleBtn.textContent = nextActionLabel;
  }

  public updateDurationValue(duration: number) {
    this.elements.$durationValue.textContent = `${Math.trunc(duration / 1000)}`;
    this.elements.$durationValue.dataset.value = `${duration}`;
  }

  public init() {
    const initialCurve = this.populateCurvePicker();
    this.updateCurveLabel(initialCurve);
    this.updateDurationValue(DURATION.DEFAULT);
    this._updateDurationButtonStates();
    return this;
  }

  public bindEvents(bezierCurve: BezierCurve, mapPoints: (ratioPoints: Point[]) => Point[]) {
    const { $toggleBtn, $curvePicker, $duration } = this.elements;

    $toggleBtn.addEventListener('click', () => {
      bezierCurve.togglePlayPause();
      $toggleBtn.textContent = bezierCurve.nextActionLabel;
    });

    $curvePicker.addEventListener('change', (e) => {
      const selected = (e.target as HTMLSelectElement).value as BezierCurveType;
      const controlPoints = mapPoints(BezierPointRatios[selected]);
      this.updateCurveLabel(selected);
      bezierCurve.setPoints(controlPoints).reset();
    });

    $duration.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action !== ACTION.INCREASE && action !== ACTION.DECREASE) return;

      const newDuration = bezierCurve.changeDuration(action);
      this.updateDurationValue(newDuration);
      this._updateDurationButtonStates();
    });
  }

  private _updateDurationButtonStates() {
    const { $durationValue, $decreaseBtn, $increaseBtn } = this.elements;

    const ms = parseInt($durationValue.dataset.value ?? `${DURATION.DEFAULT}`, 10);
    $decreaseBtn.disabled = ms <= DURATION.MIN;
    $increaseBtn.disabled = ms >= DURATION.MAX;
  }
}

/** 싱글턴(단일 인스턴스)으로 사용 */
export const uiController = new UIController();
