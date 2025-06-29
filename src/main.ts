import './style.css';
import { BezierCurve } from './bezier-curve';
import { Points } from './points';

function setupApp() {
  const staticCanvas = document.querySelector<HTMLCanvasElement>('.static-canvas');
  const dynamicCanvas = document.querySelector<HTMLCanvasElement>('.dynamic-canvas');
  const startBtn = document.querySelector<HTMLButtonElement>('.start-animation');
  const tLabel = document.querySelector<HTMLLabelElement>('.t-label');

  if (!staticCanvas || !dynamicCanvas || !startBtn) {
    console.error('필수 HTML 요소(canvas, button)가 문서에 존재하지 않습니다.');
    return;
  }

  const staticCtx = staticCanvas.getContext('2d');
  const dynamicCtx = dynamicCanvas.getContext('2d');

  if (!staticCtx || !dynamicCtx) {
    console.error('Canvas 컨텍스트를 가져올 수 없습니다.');
    return;
  }

  const { clientWidth: cvWidth, clientHeight: cvHeight } = staticCanvas;
  const dpr = window.devicePixelRatio ?? 1;
  [staticCanvas, dynamicCanvas].forEach((canvas) => {
    canvas.width = cvWidth * dpr;
    canvas.height = cvHeight * dpr;
  });
  [staticCtx, dynamicCtx].forEach((ctx) => {
    ctx.scale(dpr, dpr);
  });

  const bezierCurve = new BezierCurve({
    staticCtx,
    dynamicCtx,
    points: Points.quadratic,
    duration: 4000,
    labelElem: tLabel,
  });

  bezierCurve.drawStaticLayer();
  bezierCurve.drawDynamicLayer(0);

  startBtn.addEventListener('click', () => bezierCurve.start());
}

setupApp();
