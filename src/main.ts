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
  const { $staticCanvas, $dynamicCanvas, $degreePicker, $startBtn, $duration } =
    uiController.elements;
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
    $degreePicker.addEventListener('change', (e) => {
      const selectedDegree = (e.target as HTMLSelectElement).value as Degree;
      const points = mapPoints(BezierPointRatios[selectedDegree]);

      uiController.updateDegreeLabel(selectedDegree);
      bezierCurve.setPoints(points).reset();
    });
    $duration.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;

      const raw = btn.dataset.action;
      if (raw !== 'increase' && raw !== 'decrease') return;

      const updatedDuration = bezierCurve.changeDuration(raw);
      uiController.updateDurationValue(updatedDuration);
    });
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
