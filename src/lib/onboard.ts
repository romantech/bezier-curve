import { driver } from 'driver.js';
import { controller } from './controller';

const onboard = driver({
  showProgress: true,
  overlayOpacity: 0.5,
  onDestroyed: () => localStorage.setItem('bezier-curve-onboarded', 'true'),
  steps: [
    {
      element: controller.elements.$dynamicCanvas,
      popover: {
        title: 'Move the Control Points',
        description: 'Click and drag the control points to change the curve.',
        popoverClass: 'control-point-popover',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: controller.elements.$toggleBtn,
      popover: {
        title: 'Pause or Resume',
        description: 'Click the button to pause or resume the animation.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: controller.elements.$curvePicker,
      popover: {
        title: 'Change Curve Type',
        description: 'Choose a Bézier curve, from linear (1st order) to quintic (5th order).',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: controller.elements.$duration,
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

export const startOnboarding = () => {
  const hasSeenOnboarding = localStorage.getItem('bezier-curve-onboarded');
  if (!hasSeenOnboarding) onboard.drive();
};
