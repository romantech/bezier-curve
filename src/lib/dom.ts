import type { DefinedElements } from './types';
import { BezierPoints } from './bezier-points';

export const getValidElements = () => {
  const elements = {
    $staticCv: document.querySelector<HTMLCanvasElement>('.static-canvas'),
    $dynamicCv: document.querySelector<HTMLCanvasElement>('.dynamic-canvas'),
    $title: document.querySelector<HTMLElement>('.title'),
    $degreePicker: document.querySelector<HTMLSelectElement>('.degree-picker'),
    $startBtn: document.querySelector<HTMLButtonElement>('.start-animation'),
    $tLabel: document.querySelector<HTMLElement>('.t-label'),
  };

  if (Object.values(elements).some((el) => el === null)) {
    throw new Error('필수 HTML 요소가 존재하지 않습니다.');
  }

  return elements as DefinedElements<typeof elements>;
};

export const populateDegreePicker = ($degreePicker: HTMLSelectElement, points = BezierPoints) => {
  Object.keys(points).forEach((key, i) => {
    const option = new Option(key, key, i === 0);
    $degreePicker.appendChild(option);
  });
};
