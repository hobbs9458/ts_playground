export class Observable<T> {
  private value: T;
  private subscribers: Map<symbol, (value: T) => void> = new Map();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    this.value = newValue;
    this.notify();
  }

  subscribe(callback: (value: T) => void): symbol {
    const id = Symbol();
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribe(id: symbol): void {
    this.subscribers.delete(id);
  }

  private notify(): void {
    this.subscribers.forEach((callback) => callback(this.value));
  }
}

export function derive<T, U>(
  observables: Observable<T>[],
  computation: (...values: T[]) => U
): Observable<U> {
  const derived = new Observable<U>(
    computation(...observables.map((o) => o.get()))
  );

  observables.forEach((obs) => {
    obs.subscribe(() => {
      derived.set(computation(...observables.map((o) => o.get())));
    });
  });

  return derived;
}
