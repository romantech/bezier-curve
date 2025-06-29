import './style.css';
import { BezierCurve } from './bezier-curve';
import { getPoints, setupCanvasContexts, setupCanvasResolution, validateDOMElements } from './lib';

function setupApp() {
  try {
    const { staticCanvas, dynamicCanvas, startBtn, tLabel } = validateDOMElements();
    const { staticCtx, dynamicCtx } = setupCanvasContexts(staticCanvas, dynamicCanvas);

    setupCanvasResolution(staticCanvas, dynamicCanvas, staticCtx, dynamicCtx);

    const bezierCurve = new BezierCurve({
      staticCtx,
      dynamicCtx,
      points: getPoints('quartic'),
      labelElem: tLabel,
    });

    bezierCurve.drawStaticLayer();
    bezierCurve.drawDynamicLayer(0);

    startBtn.addEventListener('click', bezierCurve.start.bind(bezierCurve));
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.body.innerHTML = '<div class="error">앱을 초기화할 수 없습니다.</div>';
  }
}

setupApp();
