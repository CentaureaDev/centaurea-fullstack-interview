// @ts-check
/**
 * @template T
 * @callback ObserverCallback
 * @param {T} value - The updated value
 * @returns {void}
 */

/**
 * Observable
 * 
 * Generic observable pattern implementation that can be used with any data type.
 * Manages state and notifies observers of changes.
 * 
 * @template T
 */

export class Observable {
  /**
   * @param {T} [initialValue=null] - Initial value for the observable
   */
  constructor(initialValue = null) {
    this.value = initialValue;
    /** @type {Set<ObserverCallback<T>>} */
    this.observers = new Set();
  }

  /**
   * Subscribe to value changes
   * @param {ObserverCallback<T>} observer - Callback function that receives the updated value
   * @returns {() => void} Unsubscribe function
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
   * @returns {void}
   */
  notify() {
    this.observers.forEach((observer) => observer(this.value));
  }

  /**
   * Get the current value
   * @returns {T}
   */
  getValue() {
    return this.value;
  }

  /**
   * Set the value and notify observers
   * @param {T} value - New value to set
   * @returns {void}
   */
  setValue(value) {
    this.value = value;
    this.notify();
  }

  /**
   * Clear the value (set to null) and notify observers
   * @returns {void}
   */
  clear() {
    this.value = null;
    this.notify();
  }
}
