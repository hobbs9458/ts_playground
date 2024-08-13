export class ObservableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObservableError";
  }
}

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
    if (typeof callback !== "function") {
      throw new ObservableError("Callback must be a function");
    }
    const id = Symbol();
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribe(id: symbol): void {
    if (!this.subscribers.has(id)) {
      throw new ObservableError("Subscription not found");
    }
    this.subscribers.delete(id);
  }

  private notify(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.value);
      } catch (error) {
        console.error("Error in subscriber callback:", error);
      }
    });
  }
}

export interface DerivedObservable<U> extends Observable<U> {
  cleanup: () => void;
}

export function derive<T, U>(
  observables: Observable<T>[],
  computation: (...values: T[]) => U
): DerivedObservable<U> {
  if (!Array.isArray(observables) || observables.length === 0) {
    throw new ObservableError("At least one observable must be provided");
  }
  if (typeof computation !== "function") {
    throw new ObservableError("Computation must be a function");
  }

  const initialValues = observables.map((o) => o.get());
  const derived = new Observable<U>(
    computation(...initialValues)
  ) as DerivedObservable<U>;

  const subscriptionIds: symbol[] = [];

  const updateDerived = () => {
    try {
      const currentValues = observables.map((o) => o.get());
      derived.set(computation(...currentValues));
    } catch (error) {
      console.error("Error in derive computation:", error);
    }
  };

  observables.forEach((obs) => {
    const id = obs.subscribe(updateDerived);
    subscriptionIds.push(id);
  });

  derived.cleanup = () => {
    subscriptionIds.forEach((id, index) => {
      try {
        observables[index].unsubscribe(id);
      } catch (error) {
        console.error("Error during cleanup:", error);
      }
    });
    subscriptionIds.length = 0;
  };

  return derived;
}

function main() {
  try {
    const x = new Observable<number>(5);
    const y = new Observable<number>(10);

    const sum = derive<number, number>([x, y], (a, b) => a + b);

    const logId = sum.subscribe((value) => console.log(`Sum is now: ${value}`));

    x.set(7); // This will trigger a recalculation and log

    // Cleanup when done
    sum.unsubscribe(logId);
    sum.cleanup();
  } catch (error) {
    if (error instanceof ObservableError) {
      console.error("Observable system error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

main();
