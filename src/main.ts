import './styles/global.css';
import './styles/main.css';
import './styles/driver.css';

import { BezierCurve } from '@/core';
import {
  BezierPointRatios,
  CONFIG,
  Controller,
  createPointMapper,
  getElements,
  setupCanvasCtx,
  setupCanvasResolution,
  startOnboarding,
} from '@/lib';

function setupApp() {
  try {
    const elements = getElements();
    const { $staticCanvas, $dynamicCanvas } = elements;

    const { staticCtx, dynamicCtx } = setupCanvasCtx($staticCanvas, $dynamicCanvas);
    const { cssWidth, cssHeight } = setupCanvasResolution(
      $staticCanvas,
      $dynamicCanvas,
      staticCtx,
      dynamicCtx,
    );

    const mapPoints = createPointMapper(cssWidth, cssHeight);
    const points = mapPoints(BezierPointRatios[CONFIG.INITIAL_CURVE]);

    const bezierCurve = new BezierCurve({ staticCtx, dynamicCtx, points });
    const controller = new Controller({ bezierCurve, mapPoints, elements });

    bezierCurve.subscribe(controller).setup();
    controller.init();

    startOnboarding();
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
