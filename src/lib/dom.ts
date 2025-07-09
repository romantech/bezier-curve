import type { BezierCurve } from '../bezier-curve';
import { type BezierCurveType, BezierCurveTypes, BezierPointRatios } from './bezier-points';
import {
  ACTION,
  type Action,
  DURATION,
  INITIAL_CURVE,
  TOGGLE_LABEL,
  type ToggleLabel,
} from './config';
import type { BezierEvent, Observer } from './events';
import type { DefinedElements, Point } from './types';

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

export class UIController implements Observer {
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

  public update(event: BezierEvent): void {
    switch (event.type) {
      case 'start':
        this.updateToggleLabel(TOGGLE_LABEL.PAUSE);
        break;
      case 'tick':
      case 'setup':
        this.updateTLabel(event.progress);
        break;
      case 'stop':
      case 'pause':
        this.updateToggleLabel(TOGGLE_LABEL.START);
        break;
      default:
        break;
    }
  }

  public updateTLabel(tValue: number) {
    this.elements.$tLabel.textContent = `${tValue.toFixed(2)}`;
  }

  public updateToggleLabel(label: ToggleLabel) {
    this.elements.$toggleBtn.textContent = label;
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

    $toggleBtn.addEventListener('click', bezierCurve.togglePlayPause.bind(bezierCurve));

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
    this.updateDurationValue(newDuration);
    this._updateDurationButtonStates();
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
