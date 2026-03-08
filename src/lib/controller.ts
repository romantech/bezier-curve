import type { BezierCurve, BezierEvent, Observer, Point } from '@/core';
import { ACTION, DURATION, INITIAL_CURVE, TOGGLE_LABEL, type ToggleLabel } from './config';
import type { Elements } from './elements';
import { startOnboarding } from './onboard';
import {
  type BezierCurveType,
  BezierCurveTypes,
  BezierPointRatios,
  type MapPoints,
} from './presets';
import { toCssCubicBezier, truncate } from './utils';

interface ControllerDependencies {
  bezierCurve: BezierCurve;
  mapPoints: MapPoints;
  elements: Elements;
}

type CopyStatus = 'copied' | 'manual' | 'failed';

export class Controller implements Observer {
  private readonly bezierCurve: BezierCurve;
  private readonly mapPoints: MapPoints;
  private readonly elements: Elements;
  private currentCurveType: BezierCurveType = INITIAL_CURVE;
  private copyStatusTimeoutId: number | null = null;

  constructor({ bezierCurve, mapPoints, elements }: ControllerDependencies) {
    this.bezierCurve = bezierCurve;
    this.mapPoints = mapPoints;
    this.elements = elements;
  }

  public update(e: BezierEvent): void {
    switch (e.type) {
      case 'start':
        this.updateToggleLabel(TOGGLE_LABEL.PAUSE);
        this.toggleClass(this.elements.$progress, 'scale-150', true);
        break;
      case 'tick':
        this.updateProgressValue(e.progress);
        break;
      case 'setup':
        this.updateProgressValue(e.progress);
        this.renderPointLabels(e.points);
        this.updateCssOutput(e.points);
        break;
      case 'stop':
        this.updateProgressValue(e.progress);
        this.updateToggleLabel(TOGGLE_LABEL.START);
        this.toggleClass(this.elements.$progress, 'scale-150', false);
        break;
      case 'pause':
        this.updateToggleLabel(TOGGLE_LABEL.START);
        this.toggleClass(this.elements.$progress, 'scale-150', false);
        break;
      case 'dragMove':
      case 'dragEnd': {
        if (e.dragPointIdx === null) return;

        const target = this.getPointLabelElement(e.dragPointIdx);
        const isDrag = e.type === 'dragMove';

        this.toggleClass(target, 'highlight', isDrag);
        this.updatePointLabel(e.dragPointIdx, e.points[e.dragPointIdx]);
        this.updateCssOutput(e.points);
        break;
      }
      case 'durationChange':
        this.updateDurationUI(e.duration);
        break;
      default:
        console.warn(`Unknown event type: ${e.type}`, e);
    }
  }

  public init() {
    this.updateCurveLabel(INITIAL_CURVE);
    this.populateCurvePicker(BezierCurveTypes, INITIAL_CURVE);
    this.updateDurationUI(this.bezierCurve.getDuration());
    this.updateCssOutputVisibility(INITIAL_CURVE);
    this.bindEvents();
    return this;
  }

  private toggleClass(target: HTMLElement, className: string, enabled: boolean) {
    target.classList.toggle(className, enabled);
  }

  private updateCurveLabel(label: string) {
    this.elements.$curveLabel.textContent = label;
  }

  private updateProgressValue(t: number) {
    this.elements.$progressValue.textContent = `${t.toFixed(2)}`;
  }

  private updateToggleLabel(label: ToggleLabel) {
    this.elements.$toggleBtn.textContent = label;
  }

  private renderPointLabels(points: Point[]) {
    const labelElements = points.map(({ x, y }, i) => {
      const span = document.createElement('span');
      span.textContent = `P${i}(${truncate(x)},${truncate(y)})`;
      return span;
    });

    this.elements.$controlPoints.replaceChildren(...labelElements);
  }
  private getPointLabelElement(idx: number) {
    return this.elements.$controlPoints.children[idx] as HTMLSpanElement;
  }

  private updatePointLabel(pointIdx: number, point: Point): void {
    const target = this.getPointLabelElement(pointIdx);
    if (!target) return;

    const [truncX, truncY] = [truncate(point.x), truncate(point.y)];
    target.textContent = `P${pointIdx}(${truncX},${truncY})`;
  }

  private populateCurvePicker(
    curveTypes: readonly BezierCurveType[],
    initialCurve: BezierCurveType,
  ) {
    this.elements.$curvePicker.options.length = 0; // 기존 옵션 제거
    const initialKeyIdx = Math.max(0, curveTypes.indexOf(initialCurve));

    curveTypes.forEach((curve, i) => {
      const isSelected = i === initialKeyIdx;
      const option = new Option(curve, curve, isSelected, isSelected);
      this.elements.$curvePicker.add(option);
    });
  }

  private bindEvents() {
    const { $toggleBtn, $curvePicker, $duration, $onboardBtn, $cssOutput } = this.elements;

    $toggleBtn.addEventListener('click', () => this.bezierCurve.togglePlayPause());
    $onboardBtn.addEventListener('click', () => startOnboarding(true));

    $curvePicker.addEventListener('change', (e) => {
      const curve = (e.target as HTMLSelectElement).value as BezierCurveType;
      const controlPoints = this.mapPoints(BezierPointRatios[curve]);

      this.currentCurveType = curve;
      this.updateCurveLabel(curve);
      this.updateCssOutputVisibility(curve);
      this.bezierCurve.setPoints(controlPoints).setup();
    });

    $duration.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action !== ACTION.INCREASE && action !== ACTION.DECREASE) return;

      this.bezierCurve.changeDuration(action);
    });

    const copyCssOutput = async () => {
      const text = $cssOutput.textContent;
      if (!text || !text.startsWith('cubic-bezier')) return;

      const copyStatus = await this.copyTextToClipboard(text);
      if (copyStatus === 'copied') {
        this.showCopyStatus('Copied!', true);
      } else if (copyStatus === 'manual') {
        this.showCopyStatus('Press Ctrl/Cmd+C', false);
      } else {
        this.showCopyStatus('Copy failed', false);
      }
    };

    $cssOutput.addEventListener('click', () => {
      void copyCssOutput();
    });

    $cssOutput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      void copyCssOutput();
    });
  }

  private updateDurationUI(duration: number): void {
    this.elements.$durationValue.textContent = `${Math.trunc(duration / 1000)}`;

    const { $decreaseBtn, $increaseBtn } = this.elements;
    $decreaseBtn.disabled = duration <= DURATION.MIN;
    $increaseBtn.disabled = duration >= DURATION.MAX;
  }

  private updateCssOutputVisibility(curveType: BezierCurveType): void {
    const isCubic = curveType === 'cubic';
    this.elements.$cssOutputContainer.style.display = isCubic ? 'block' : 'none';
  }

  private updateCssOutput(points: Point[]): void {
    if (this.currentCurveType !== 'cubic' || points.length !== 4) return;

    try {
      const cssBezier = toCssCubicBezier(points);
      if (cssBezier) {
        this.elements.$cssOutput.textContent = cssBezier;
        this.elements.$cssOutput.style.cursor = 'pointer';
        this.elements.$cssOutput.style.color = 'var(--accent)';
      } else {
        this.elements.$cssOutput.textContent = 'Invalid CSS cubic-bezier';
        this.elements.$cssOutput.style.cursor = 'default';
        this.elements.$cssOutput.style.color = 'var(--text-light)';
      }
    } catch {
      this.elements.$cssOutput.textContent = '';
    }
  }

  private async copyTextToClipboard(text: string): Promise<CopyStatus> {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return 'copied';
      } catch {
        // no-op: manual fallback is handled below
      }
    }

    return this.selectCssOutputText() ? 'manual' : 'failed';
  }

  private selectCssOutputText(): boolean {
    const selection = window.getSelection();
    if (!selection) return false;

    const range = document.createRange();
    try {
      range.selectNodeContents(this.elements.$cssOutput);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } catch {
      return false;
    }
  }

  private showCopyStatus(message: string, isSuccess: boolean): void {
    const indicator = this.elements.$cssCopiedIndicator;

    if (this.copyStatusTimeoutId !== null) {
      window.clearTimeout(this.copyStatusTimeoutId);
      this.copyStatusTimeoutId = null;
    }

    indicator.style.opacity = '0';
    indicator.textContent = '';
    indicator.style.color = isSuccess ? 'var(--accent)' : 'var(--text-light)';

    window.requestAnimationFrame(() => {
      indicator.textContent = message;
      indicator.style.opacity = '1';
      this.copyStatusTimeoutId = window.setTimeout(() => {
        indicator.style.opacity = '0';
        this.copyStatusTimeoutId = null;
      }, 2000);
    });
  }
}
