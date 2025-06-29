import {
  BezierPoints,
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

    setupCanvasResolution($staticCanvas, $dynamicCanvas, staticCtx, dynamicCtx);

    const bezierCurve = new BezierCurve({
      staticCtx,
      dynamicCtx,
      points: BezierPoints.quadratic,
      onTick: uiController.updateTLabel.bind(uiController),
    });

    uiController.init();
    bezierCurve.reset();

    $startBtn.addEventListener('click', bezierCurve.start.bind(bezierCurve));
    $degreePicker?.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;

      const selectedDegree = event.target.value as Degree;
      uiController.updateDegreeLabel(selectedDegree);
      bezierCurve.setPoints(BezierPoints[selectedDegree]).reset();
    });
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.body.innerHTML = '<div class="error">앱을 초기화할 수 없습니다.</div>';
  }
}

setupApp();
