export type BezierEventType = 'start' | 'stop' | 'pause' | 'reset' | 'tick';

export type BezierEvent = {
  type: BezierEventType;
  progress: number;
};

export interface Observer {
  update(event: BezierEvent): void;
}

export class Publisher {
  private observers: Set<Observer> = new Set();

  public subscribe(observer: Observer): void {
    this.observers.add(observer);
  }

  public unsubscribe(observer: Observer): void {
    this.observers.delete(observer);
  }

  public notify(event: BezierEvent): void {
    this.observers.forEach((observer) => observer.update(event));
  }
}
