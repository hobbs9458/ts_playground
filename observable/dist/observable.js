export class ObservableError extends Error {
    constructor(message) {
        super(message);
        this.name = "ObservableError";
    }
}
export class Observable {
    constructor(initialValue) {
        this.subscribers = new Map();
        this.value = initialValue;
    }
    get() {
        return this.value;
    }
    set(newValue) {
        this.value = newValue;
        this.notify();
    }
    subscribe(callback) {
        if (typeof callback !== "function") {
            throw new ObservableError("Callback must be a function");
        }
        const id = Symbol();
        this.subscribers.set(id, callback);
        return id;
    }
    unsubscribe(id) {
        if (!this.subscribers.has(id)) {
            throw new ObservableError("Subscription not found");
        }
        this.subscribers.delete(id);
    }
    notify() {
        this.subscribers.forEach((callback) => {
            try {
                callback(this.value);
            }
            catch (error) {
                console.error("Error in subscriber callback:", error);
            }
        });
    }
}
export function derive(observables, computation) {
    if (!Array.isArray(observables) || observables.length === 0) {
        throw new ObservableError("At least one observable must be provided");
    }
    if (typeof computation !== "function") {
        throw new ObservableError("Computation must be a function");
    }
    const initialValues = observables.map((o) => o.get());
    const derived = new Observable(computation(...initialValues));
    const subscriptionIds = [];
    const updateDerived = () => {
        try {
            const currentValues = observables.map((o) => o.get());
            derived.set(computation(...currentValues));
        }
        catch (error) {
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
            }
            catch (error) {
                console.error("Error during cleanup:", error);
            }
        });
        subscriptionIds.length = 0;
    };
    return derived;
}
// function main() {
//   try {
//     const x = new Observable<number>(5);
//     const y = new Observable<number>(10);
//     const sum = derive<number, number>([x, y], (a, b) => a + b);
//     const logId = sum.subscribe((value) => console.log(`Sum is now: ${value}`));
//     x.set(7); // This will trigger a recalculation and log
//     // Cleanup when done
//     sum.unsubscribe(logId);
//     sum.cleanup();
//   } catch (error) {
//     if (error instanceof ObservableError) {
//       console.error("Observable system error:", error.message);
//     } else {
//       console.error("Unexpected error:", error);
//     }
//   }
// }
// main();
