import { Observable, derive } from "./observable.js";

class CounterComponent extends HTMLElement {
  private count: Observable<number>;
  private doubleCount: Observable<number>;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.count = new Observable<number>(0);
    this.doubleCount = derive([this.count], (count) => count * 2);
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  private render() {
    this.shadow.innerHTML = `
      <div>
        <p>Count: <span id="count"></span></p>
        <p>Double Count: <span id="doubleCount"></span></p>
        <button id="increment">Increment</button>
        <button id="decrement">Decrement</button>
      </div>
    `;

    this.count.subscribe((value) => {
      this.shadow.getElementById("count")!.textContent = value.toString();
    });

    this.doubleCount.subscribe((value) => {
      this.shadow.getElementById("doubleCount")!.textContent = value.toString();
    });
  }

  private setupListeners() {
    this.shadow.getElementById("increment")!.addEventListener("click", () => {
      this.count.set(this.count.get() + 1);
    });

    this.shadow.getElementById("decrement")!.addEventListener("click", () => {
      this.count.set(this.count.get() - 1);
    });
  }

  disconnectedCallback() {
    // Cleanup if necessary
    (this.doubleCount as any).cleanup();
  }
}

customElements.define("counter-component", CounterComponent);
