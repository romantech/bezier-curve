import { driver } from 'driver.js';
import { controller } from './controller';

export const onboard = driver({
  showProgress: true,
  steps: [
    {
      element: controller.elements.$dynamicCanvas,
      popover: {
        title: 'Move control points',
        description: 'Drag and drop to move the control points.',
        popoverClass: 'ctrl-popover',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: controller.elements.$toggleBtn,
      popover: {
        title: 'Pause/Resume',
        description: 'Press the button to pause or resume the animation.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: controller.elements.$curvePicker,
      popover: {
        title: 'Change curves',
        description: 'Choose a Bézier curve from 1st to 5th order.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: controller.elements.$duration,
      popover: {
        title: 'Duration control',
        description:
          'Adjust the duration using the - and + buttons. A shorter duration makes the animation play faster.',
        side: 'top',
        align: 'end',
      },
    },
  ],
});
