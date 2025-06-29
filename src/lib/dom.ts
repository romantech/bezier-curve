import type { DefinedElements } from './types';
import { BezierDegreeKeys } from './bezier-points';

const UnsafeElements = {
  $staticCanvas: document.querySelector<HTMLCanvasElement>('.static-canvas'),
  $dynamicCanvas: document.querySelector<HTMLCanvasElement>('.dynamic-canvas'),
  $degreeLabel: document.querySelector<HTMLElement>('.degree-label'),
  $degreePicker: document.querySelector<HTMLSelectElement>('.degree-picker'),
  $startBtn: document.querySelector<HTMLButtonElement>('.start-animation'),
  $tLabel: document.querySelector<HTMLSpanElement>('.t-value'),
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

  public init() {
    const initialDegree = this.populateDegreePicker();
    this.updateDegreeLabel(initialDegree);
  }
}

/** 싱글턴(단일 인스턴스)으로 사용 */
export const uiController = new UIController();
