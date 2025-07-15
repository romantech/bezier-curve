import { type Driver, driver } from 'driver.js';
import { SELECTORS } from './config';

const STORAGE_KEY_ONBOARDED = 'bezier-curve-onboarded';
const CLASS_ONBOARD_THEME = 'onboard-theme';

let onboardDriver: Driver | null = null;

const getDriverInstance = () => {
  if (onboardDriver) return onboardDriver;

  onboardDriver = driver({
    showProgress: true,
    overlayOpacity: 0.5,
    popoverClass: CLASS_ONBOARD_THEME,
    onDestroyed: () => localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true'),
    steps: [
      {
        element: SELECTORS.CANVAS_CONTAINER,
        popover: {
          title: 'Move the Control Points',
          description: 'Click and drag the control points to change the curve.',
          popoverClass: `${CLASS_ONBOARD_THEME} control-point-popover`,
          side: 'top',
          align: 'center',
        },
      },
      {
        element: SELECTORS.TOGGLE_BUTTON,
        popover: {
          title: 'Pause or Resume',
          description: 'Click the button to pause or resume the animation.',
          side: 'top',
          align: 'start',
        },
      },
      {
        element: SELECTORS.CURVE_PICKER,
        popover: {
          title: 'Change Curve Type',
          description: 'Choose a Bézier curve, from linear (1st order) to quintic (5th order).',
          popoverClass: `${CLASS_ONBOARD_THEME} curve-picker-popover`,
          side: 'top',
          align: 'start',
        },
      },
      {
        element: SELECTORS.DURATION_CONTAINER,
        popover: {
          title: 'Adjust Duration',
          description:
            'Use the - and + buttons to adjust the animation speed. A shorter duration results in a faster animation.',
          side: 'top',
          align: 'end',
        },
      },
    ],
  });

  return onboardDriver;
};

export const startOnboarding = (force: boolean = false) => {
  if (force) return getDriverInstance().drive();

  /**
   * <iframe> 태그에서 렌더링 중일 땐 온보딩 표시 안함
   * window.self: 현재 코드가 실행 중인 창의 window 객체. iframe 내부에서는 해당 iframe의 window를 가리킴.
   * window.top:  iframe 중첩 여부와 관계없이 가장 최상위 부모 창(브라우저 창)의 window 객체.
   */
  const isInFrame = window.self !== window.top;
  if (isInFrame) return;

  const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY_ONBOARDED);
  if (!hasSeenOnboarding) getDriverInstance().drive();
};
