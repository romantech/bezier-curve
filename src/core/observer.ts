import type { BezierCurve, Point } from './bezier-curve';

export type BezierEventType =
  | 'start'
  | 'stop'
  | 'pause'
  | 'setup'
  | 'tick'
  | 'dragStart'
  | 'dragEnd';

export type BezierEvent = {
  type: BezierEventType;
  points: Point[];
  progress: BezierCurve['progress'];
  dragPointIdx: BezierCurve['dragPointIdx'];
};

export interface Observer {
  update(event: BezierEvent): void;
}

export class Publisher {
  private observers: Set<Observer> = new Set();

  public subscribe(observer: Observer) {
    this.observers.add(observer);
    return this;
  }

  public unsubscribe(observer: Observer) {
    this.observers.delete(observer);
    return this;
  }

  public notify(event: BezierEvent) {
    this.observers.forEach((observer) => observer.update(event));
    return this;
  }
}
