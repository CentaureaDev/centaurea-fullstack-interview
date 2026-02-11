/**
 * Observable
 * 
 * Generic observable pattern implementation that can be used with any data type.
 * Manages state and notifies observers of changes.
 */

export class Observable {
  /**
   * @param {*} initialValue - Initial value for the observable
   */
  constructor(initialValue = null) {
    this.value = initialValue;
    this.observers = new Set();
  }

  /**
   * Subscribe to value changes
   * @param {function(value): void} observer - Callback function that receives the updated value
   * @returns {function(): void} Unsubscribe function
   */
  subscribe(observer) {
    this.observers.add(observer);
    // Immediately call observer with current state
    observer(this.value);
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Notify all observers of state changes
   */
  notify() {
    this.observers.forEach((observer) => observer(this.value));
  }

  /**
   * Get the current value
   * @returns {*}
   */
  getValue() {
    return this.value;
  }

  /**
   * Set the value and notify observers
   * @param {*} value
   */
  setValue(value) {
    this.value = value;
    this.notify();
  }

  /**
   * Clear the value (set to null) and notify observers
   */
  clear() {
    this.value = null;
    this.notify();
  }
}
