import type { DefinedElements, Point } from './types';
import { type BezierCurveKey, BezierCurveKeys, BezierPointRatios } from './bezier-points';
import type { BezierCurve } from '../bezier-curve';
import { ACTION, DURATION } from './config';

const UnsafeElements = {
  $staticCanvas: document.querySelector<HTMLCanvasElement>('.static-canvas'),
  $dynamicCanvas: document.querySelector<HTMLCanvasElement>('.dynamic-canvas'),

  $degreeLabel: document.querySelector<HTMLElement>('.degree-label'),
  $degreePicker: document.querySelector<HTMLSelectElement>('.degree-picker'),

  $tLabel: document.querySelector<HTMLSpanElement>('.t-value'),

  $duration: document.querySelector<HTMLDivElement>('.duration'),
  $durationValue: document.querySelector<HTMLSpanElement>('.duration-value'),

  $startBtn: document.querySelector<HTMLButtonElement>('.start-animation'),
  $pauseBtn: document.querySelector<HTMLButtonElement>('.pause-animation'),
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

  public updateDegreeLabel(label: string) {
    this.elements.$degreeLabel.textContent = label;
  }

  public populateDegreePicker(degreeKeys = BezierCurveKeys) {
    const initialKeyIdx = 0;

    degreeKeys.forEach((key, i) => {
      const option = new Option(key, key, i === initialKeyIdx);
      this.elements.$degreePicker.appendChild(option);
    });

    return degreeKeys[initialKeyIdx];
  }

  public updateTLabel(tValue: number) {
    this.elements.$tLabel.textContent = `${tValue.toFixed(2)}`;
  }

  public updateDurationValue(duration: number) {
    this.elements.$durationValue.textContent = `${Math.trunc(duration / 1000)}`;
    this.elements.$durationValue.dataset.value = `${duration}`;
  }

  public init() {
    const initialDegree = this.populateDegreePicker();
    this.updateDegreeLabel(initialDegree);
    this.updateDurationValue(DURATION.DEFAULT);
    this._updateDurationButtonStates();
    return this;
  }

  public bindEvents(bezierCurve: BezierCurve, mapPoints: (ratioPts: Point[]) => Point[]) {
    const { $startBtn, $degreePicker, $duration, $pauseBtn } = this.elements;

    $startBtn.addEventListener('click', () => bezierCurve.start());
    $pauseBtn.addEventListener('click', () => bezierCurve.pause());

    $degreePicker.addEventListener('change', (e) => {
      const selected = (e.target as HTMLSelectElement).value as BezierCurveKey;
      const pts = mapPoints(BezierPointRatios[selected]);
      this.updateDegreeLabel(selected);
      bezierCurve.setPoints(pts).reset();
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
