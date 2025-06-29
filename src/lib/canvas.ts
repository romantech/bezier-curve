export const setupCanvasCtx = (
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
  const { clientWidth: cssWidth, clientHeight: cssHeight } = staticCanvas;
  // clientWidth/clientHeight는 CSS 픽셀 (CSS px) 단위로 반환함
  // CSS 픽셀은 "레이아웃"을 위한 논리적 픽셀로, 실제 디바이스의 물리적 픽셀 수와 다를 수 있음
  // 예를들어 devicePixelRatio가 2인 화면에서는 1 CSS 픽셀이 2×2 물리적 픽셀에 해당함
  const dpr = window.devicePixelRatio ?? 1;

  // 고해상도 디스플레이 대응을 위해 캔버스 내부 해상도를 물리 픽셀 기준으로 설정
  // 화면에 보이는 크기는 여전히 CSS 픽셀 기준 (clientWidth, clientHeight)
  [staticCanvas, dynamicCanvas].forEach((canvas) => {
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
  });

  // 각 컨텍스트에 스케일 보정 적용
  [staticCtx, dynamicCtx].forEach((ctx) => {
    // 좌표계를 CSS 픽셀 기준으로 보정
    // 즉, 1개 CSS 픽셀이 dpr개의 물리 픽셀을 차지하도록 스케일 조정
    // 예: canvas 크기가 500×400이고 dpr=2일 경우,
    //    내부 해상도는 1000×800이 되지만,
    //    ctx.scale()을 생략하면 도형이 절반 크기로 작게 보임
    ctx.scale(dpr, dpr);
  });

  return { cssWidth, cssHeight };
};
