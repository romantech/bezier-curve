import type { DefinedElements, Degree, Point } from './types';
import { BezierDegreeKeys, BezierPointRatios } from './bezier-points';
import type { BezierCurve } from '../bezier-curve.ts';

const UnsafeElements = {
  $staticCanvas: document.querySelector<HTMLCanvasElement>('.static-canvas'),
  $dynamicCanvas: document.querySelector<HTMLCanvasElement>('.dynamic-canvas'),
  $degreeLabel: document.querySelector<HTMLElement>('.degree-label'),
  $degreePicker: document.querySelector<HTMLSelectElement>('.degree-picker'),
  $startBtn: document.querySelector<HTMLButtonElement>('.start-animation'),
  $tLabel: document.querySelector<HTMLSpanElement>('.t-value'),
  $duration: document.querySelector<HTMLDivElement>('.duration'),
  $durationValue: document.querySelector<HTMLSpanElement>('.duration-value'),
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

  public populateDegreePicker(degreeKeys = BezierDegreeKeys) {
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
  }

  public init() {
    const initialDegree = this.populateDegreePicker();
    this.updateDegreeLabel(initialDegree);
    this.updateDurationValue(4000);
    return this;
  }

  public bindEvents(bezierCurve: BezierCurve, mapPoints: (ratioPts: Point[]) => Point[]) {
    const { $startBtn, $degreePicker, $duration } = this.elements;

    $startBtn.addEventListener('click', () => bezierCurve.start());

    $degreePicker.addEventListener('change', (e) => {
      const selected = (e.target as HTMLSelectElement).value as Degree;
      const pts = mapPoints(BezierPointRatios[selected]);
      this.updateDegreeLabel(selected);
      bezierCurve.setPoints(pts).reset();
    });

    $duration.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;
      const action = btn.dataset.action as 'increase' | 'decrease' | undefined;
      if (!action) return;

      const newDur = bezierCurve.changeDuration(action);
      this.updateDurationValue(newDur);
    });
  }
}

/** 싱글턴(단일 인스턴스)으로 사용 */
export const uiController = new UIController();
