import type { BezierCurve, BezierEvent, Observer, Point } from '@/core';
import {
  ACTION,
  type Action,
  DURATION,
  INITIAL_CURVE,
  TOGGLE_LABEL,
  type ToggleLabel,
} from './config';
import type { Elements } from './elements';
import { startOnboarding } from './onboard';
import {
  type BezierCurveType,
  BezierCurveTypes,
  BezierPointRatios,
  type MapPoints,
} from './presets';
import { truncate } from './utils';

interface ControllerDependencies {
  bezierCurve: BezierCurve;
  mapPoints: MapPoints;
  elements: Elements;
}

export class Controller implements Observer {
  private readonly bezierCurve: BezierCurve;
  private readonly mapPoints: MapPoints;
  private readonly elements: Elements;

  constructor({ bezierCurve, mapPoints, elements }: ControllerDependencies) {
    this.bezierCurve = bezierCurve;
    this.mapPoints = mapPoints;
    this.elements = elements;
  }

  public update(e: BezierEvent): void {
    switch (e.type) {
      case 'start':
        this.updateToggleLabel(TOGGLE_LABEL.PAUSE);
        this.toggleScale(this.elements.$progress, true);
        break;
      case 'tick':
        this.updateProgressValue(e.progress);
        break;
      case 'setup':
        this.updateProgressValue(e.progress);
        this.renderPointLabels(e.points);
        break;
      case 'stop':
      case 'pause':
        this.updateToggleLabel(TOGGLE_LABEL.START);
        this.toggleScale(this.elements.$progress, false);
        break;
      case 'dragMove':
      case 'dragEnd': {
        if (e.dragPointIdx === null) return;
        const target = this.getPointLabelElement(e.dragPointIdx);
        this.toggleHighlight(target, e.type === 'dragMove');
        this.updatePointLabel(e.dragPointIdx, e.points[e.dragPointIdx]);
        break;
      }
      default:
        console.warn(`Unknown event type: ${e.type}`, e);
    }
  }

  public init(
    curveTypes: readonly BezierCurveType[] = BezierCurveTypes,
    initialCurve: BezierCurveType = INITIAL_CURVE,
  ) {
    this.updateCurveLabel(initialCurve);
    this.populateCurvePicker(curveTypes, initialCurve);
    this.updateDurationValue(DURATION.DEFAULT);
    this.updateDurationButtonStates();
    this.bindEvents();
    return this;
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
    const labelTexts = points.map(({ x, y }, i) => `P${i}(${truncate(x)},${truncate(y)})`);

    const createLabelElement = (content: string) => {
      const span = document.createElement('span');
      span.textContent = content;
      return span;
    };

    const labelElements = labelTexts.map(createLabelElement);

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

  private toggleHighlight(target: HTMLElement, shouldHighlight: boolean) {
    target.classList.toggle('highlight', shouldHighlight);
  }

  private toggleScale(target: HTMLElement, shouldScale: boolean) {
    target.classList.toggle('scale-150', shouldScale);
  }

  private populateCurvePicker(
    curveTypes: readonly BezierCurveType[],
    initialCurve: BezierCurveType,
  ) {
    const initialKeyIdx = Math.max(0, curveTypes.indexOf(initialCurve));

    curveTypes.forEach((curve, i) => {
      const isSelected = i === initialKeyIdx;
      const option = new Option(curve, curve, isSelected, isSelected);
      this.elements.$curvePicker.add(option);
    });
  }

  private bindEvents() {
    const { $toggleBtn, $curvePicker, $duration, $onboardBtn } = this.elements;

    $toggleBtn.addEventListener('click', () => this.bezierCurve.togglePlayPause());
    $onboardBtn.addEventListener('click', () => startOnboarding(true));

    $curvePicker.addEventListener('change', (e) => {
      const curve = (e.target as HTMLSelectElement).value as BezierCurveType;
      const controlPoints = this.mapPoints(BezierPointRatios[curve]);

      this.updateCurveLabel(curve);
      this.bezierCurve.setPoints(controlPoints).setup();
    });

    $duration.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action !== ACTION.INCREASE && action !== ACTION.DECREASE) return;

      this.handleDurationChange(action);
    });
  }

  private handleDurationChange(action: Action) {
    const newDuration = this.bezierCurve.changeDuration(action);
    this.updateDurationValue(newDuration);
    this.updateDurationButtonStates();
  }

  private updateDurationValue(duration: number) {
    this.elements.$durationValue.textContent = `${Math.trunc(duration / 1000)}`;
    this.elements.$durationValue.dataset.value = `${duration}`;
  }

  private updateDurationButtonStates() {
    const { $durationValue, $decreaseBtn, $increaseBtn } = this.elements;

    const ms = parseInt($durationValue.dataset.value ?? `${DURATION.DEFAULT}`, 10);
    $decreaseBtn.disabled = ms <= DURATION.MIN;
    $increaseBtn.disabled = ms >= DURATION.MAX;
  }
}
