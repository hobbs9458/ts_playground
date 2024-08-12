import { Observable } from "./observable";

class UserProfile {
  name: Observable<string>;
  age: Observable<number>;

  constructor(initialName: string, initialAge: number) {
    this.name = new Observable<string>(initialName);
    this.age = new Observable<number>(initialAge);

    // Keep DOM in sync with state
    this.name.subscribe(this.updateNameInDOM);
    this.age.subscribe(this.updateAgeInDOM);
  }

  updateNameInDOM(name: string) {
    document.getElementById("userName").textContent = name;
  }

  updateAgeInDOM(age: number) {
    document.getElementById("userAge").textContent = age.toString();
  }

  setName(newName: string) {
    this.name.set(newName);
  }

  setAge(newAge: number) {
    this.age.set(newAge);
  }
}

// Usage
const profile = new UserProfile("Alice", 30);

// Later, when updating:
profile.setName("Bob"); // This will automatically update the DOM
profile.setAge(31); // This will automatically update the DOM
