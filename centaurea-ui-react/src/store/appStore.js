import { authService } from '../services/authService';

class AppStore {
  constructor() {
    this.listeners = new Set();

    // State
    this.state = {
      user: authService.getUser(),
      loading: false,
      error: null,
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

export const appStore = new AppStore();
