import './style.css';
import {
  BezierPoints,
  type Degree,
  getValidElements,
  populateDegreePicker,
  setupCanvasCtx,
  setupCanvasResolution,
} from './lib';
import { BezierCurve } from './bezier-curve';

function setupApp() {
  try {
    const { $staticCv, $dynamicCv, $startBtn, $degreePicker, $tLabel, $title } = getValidElements();
    const { staticCtx, dynamicCtx } = setupCanvasCtx($staticCv, $dynamicCv);

    populateDegreePicker($degreePicker);
    setupCanvasResolution($staticCv, $dynamicCv, staticCtx, dynamicCtx);

    const bezierCurve = new BezierCurve({
      staticCtx,
      dynamicCtx,
      points: BezierPoints.quadratic,
      tLabelElem: $tLabel,
    });

    bezierCurve.reset();

    $startBtn.addEventListener('click', bezierCurve.start.bind(bezierCurve));
    $degreePicker?.addEventListener('change', (event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;

      const degree = event.target.value as Degree;
      $title.textContent = `${degree} Bezier Curve`;
      bezierCurve.setPoints(BezierPoints[degree]).reset();
    });
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.body.innerHTML = '<div class="error">앱을 초기화할 수 없습니다.</div>';
  }
}

document.addEventListener('DOMContentLoaded', setupApp);
