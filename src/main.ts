import {
  BezierPointRatios,
  createPointMapper,
  type Degree,
  setupCanvasCtx,
  setupCanvasResolution,
  uiController,
} from './lib';
import { BezierCurve } from './bezier-curve';

function setupApp() {
  const { $staticCanvas, $dynamicCanvas, $degreePicker, $startBtn } = uiController.elements;
  try {
    const { staticCtx, dynamicCtx } = setupCanvasCtx($staticCanvas, $dynamicCanvas);

    const { cssWidth, cssHeight } = setupCanvasResolution(
      $staticCanvas,
      $dynamicCanvas,
      staticCtx,
      dynamicCtx,
    );

    const mapPoints = createPointMapper(cssWidth, cssHeight);

    const bezierCurve = new BezierCurve({
      staticCtx,
      dynamicCtx,
      points: mapPoints(BezierPointRatios.quadratic),
      onTick: uiController.updateTLabel.bind(uiController),
    });

    uiController.init();
    bezierCurve.reset();

    $startBtn.addEventListener('click', bezierCurve.start.bind(bezierCurve));
    $degreePicker?.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;

      const selectedDegree = event.target.value as Degree;
      const points = mapPoints(BezierPointRatios[selectedDegree]);

      uiController.updateDegreeLabel(selectedDegree);
      bezierCurve.stop().setPoints(points).reset();
    });
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.body.innerHTML = '<div class="error">앱을 초기화할 수 없습니다.</div>';
  }
}

window.addEventListener('DOMContentLoaded', setupApp);
