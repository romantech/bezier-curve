import './style.css';
import { BezierCurve } from './bezier-curve';
import {
  type Degree,
  Points,
  setupCanvasContexts,
  setupCanvasResolution,
  validateDOMElements,
} from './lib';

function setupApp() {
  try {
    const { $staticCanvas, $dynamicCanvas, $startBtn, $degreePicker, $tLabel, $title } =
      validateDOMElements();
    const { staticCtx, dynamicCtx } = setupCanvasContexts($staticCanvas, $dynamicCanvas);

    Object.keys(Points).forEach((key, i) => {
      const option = new Option(key, undefined, i === 0);
      $degreePicker.appendChild(option);
    });

    setupCanvasResolution($staticCanvas, $dynamicCanvas, staticCtx, dynamicCtx);

    const bezierCurve = new BezierCurve({
      staticCtx,
      dynamicCtx,
      points: Points.cubic,
      tLabelElem: $tLabel,
    });

    bezierCurve.drawStaticLayer();
    bezierCurve.drawDynamicLayer(0);

    $startBtn.addEventListener('click', bezierCurve.start.bind(bezierCurve));
    $degreePicker?.addEventListener('change', (event) => {
      if (event.target instanceof HTMLSelectElement) {
        const selectedValue = event.target.value as Degree;
        $title.textContent = `${selectedValue} Bezier Curve`;
        bezierCurve.stop();
        bezierCurve.setPoints(Points[selectedValue]);
      }
    });
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.body.innerHTML = '<div class="error">앱을 초기화할 수 없습니다.</div>';
  }
}

document.addEventListener('DOMContentLoaded', setupApp);
