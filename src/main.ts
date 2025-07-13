import { BezierCurve } from './core';
import {
  BezierPointRatios,
  createPointMapper,
  INITIAL_CURVE,
  setupCanvasCtx,
  setupCanvasResolution,
  uiController,
} from './lib';

function setupApp() {
  const { $staticCanvas, $dynamicCanvas } = uiController.elements;
  try {
    const { staticCtx, dynamicCtx } = setupCanvasCtx($staticCanvas, $dynamicCanvas);

    const { cssWidth, cssHeight } = setupCanvasResolution(
      $staticCanvas,
      $dynamicCanvas,
      staticCtx,
      dynamicCtx,
    );

    const mapPoints = createPointMapper(cssWidth, cssHeight);
    const points = mapPoints(BezierPointRatios[INITIAL_CURVE]);

    const bezierCurve = new BezierCurve({ staticCtx, dynamicCtx, points });
    bezierCurve.subscribe(uiController).setup();

    uiController.init(bezierCurve, mapPoints);
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.body.innerHTML = '<div class="error">앱을 초기화할 수 없습니다.</div>';
  }
}

/**
 * 첫 페이지 로드 시 경쟁 상태로 인해 캔버스 크기가 비정상적으로 출력되는 문제 해결 #14
 * @see https://github.com/romantech/bezier-curve/issues/14
 * */
requestAnimationFrame(setupApp);
