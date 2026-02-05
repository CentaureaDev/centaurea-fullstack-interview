import { createAuthService } from './index.js';

class AppStore {
  constructor(apiUrl = 'http://localhost:5034/api') {
    this.listeners = new Set();
    this.authService = createAuthService(apiUrl);

    // State
    this.state = {
      user: this.authService.getUser(),
      loading: false,
      error: null,
      redirectMessage: null,
      samples: [],
      history: [],
      calculationResult: null
    };
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Getters
  getState() {
    return this.state;
  }

  getUser() {
    return this.state.user;
  }

  // Auth actions
  setUser(user) {
    this.state.user = user;
    if (!user) {
      // Clear data on logout
      this.state.samples = [];
      this.state.history = [];
      this.state.calculationResult = null;
    }
    this.notify();
  }

  // UI actions
  setLoading(loading) {
    this.state.loading = loading;
    this.notify();
  }

  setError(error) {
    this.state.error = error;
    this.notify();
  }

  clearError() {
    this.state.error = null;
    this.notify();
  }

  setRedirectMessage(message) {
    this.state.redirectMessage = message;
    this.notify();
  }

  clearRedirectMessage() {
    this.state.redirectMessage = null;
    this.notify();
  }

  // Data actions
  setSamples(samples) {
    this.state.samples = samples;
    this.notify();
  }

  setHistory(history) {
    this.state.history = history;
    this.notify();
  }

  setCalculationResult(result) {
    this.state.calculationResult = result;
    this.notify();
  }
}

export { AppStore };
