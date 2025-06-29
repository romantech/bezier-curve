export const validateDOMElements = () => {
  const staticCanvas = document.querySelector<HTMLCanvasElement>('.static-canvas');
  const dynamicCanvas = document.querySelector<HTMLCanvasElement>('.dynamic-canvas');
  const startBtn = document.querySelector<HTMLButtonElement>('.start-animation');
  const tLabel = document.querySelector<HTMLLabelElement>('.t-label');

  if (!staticCanvas || !dynamicCanvas || !startBtn) {
    throw new Error('필수 HTML 요소가 문서에 존재하지 않습니다.');
  }

  return { staticCanvas, dynamicCanvas, startBtn, tLabel };
};

export const setupCanvasContexts = (
  staticCanvas: HTMLCanvasElement,
  dynamicCanvas: HTMLCanvasElement,
) => {
  const staticCtx = staticCanvas.getContext('2d');
  const dynamicCtx = dynamicCanvas.getContext('2d');

  if (!staticCtx || !dynamicCtx) {
    throw new Error('Canvas 컨텍스트를 가져올 수 없습니다.');
  }

  return { staticCtx, dynamicCtx };
};

export const setupCanvasResolution = (
  staticCanvas: HTMLCanvasElement,
  dynamicCanvas: HTMLCanvasElement,
  staticCtx: CanvasRenderingContext2D,
  dynamicCtx: CanvasRenderingContext2D,
) => {
  const { clientWidth: cvWidth, clientHeight: cvHeight } = staticCanvas;
  const dpr = window.devicePixelRatio ?? 1;

  [staticCanvas, dynamicCanvas].forEach((canvas) => {
    canvas.width = cvWidth * dpr;
    canvas.height = cvHeight * dpr;
  });

  [staticCtx, dynamicCtx].forEach((ctx) => {
    ctx.scale(dpr, dpr);
  });
};
