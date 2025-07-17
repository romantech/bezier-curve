import { SELECTORS } from './config';

export type DefinedElements<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export function getElements() {
  const elements = {
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

  const hasMissingElement = Object.values(elements).some((el) => el === null);
  if (hasMissingElement) throw new Error('Required HTML elements not found.');

  return elements as DefinedElements<typeof elements>;
}

export type Elements = ReturnType<typeof getElements>;
