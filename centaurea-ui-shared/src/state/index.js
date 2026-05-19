class StatefulManager {
  #subscribers = new Set();
  #state;

  constructor(initialState) {
    this.#state = initialState;
  }

  subscribe(callback) {
    this.#subscribers.add(callback);
    callback(this.#state);
    return () => this.#subscribers.delete(callback);
  }

  getSnapshot() {
    return this.#state;
  }

  setState(patch) {
    this.#state = { ...this.#state, ...patch };
    for (const callback of this.#subscribers) {
      callback(this.#state);
    }
  }
}

export { StatefulManager };