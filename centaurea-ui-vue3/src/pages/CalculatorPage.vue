<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">Calculator</h2>
    </div>
    <form @submit.prevent="handleCalculate" class="form">
      <div class="form__group">
        <label class="form__label">Operation</label>
        <select class="form__select" v-model.number="operation" @change="result = null">
          <optgroup label="Binary Operations">
            <option v-for="op in BinaryOperations" :key="op" :value="op">
              {{ OperationSymbols[op] }} {{ OperationNames[op] }}
            </option>
          </optgroup>
          <optgroup label="Unary Operations">
            <option v-for="op in UnaryOperations" :key="op" :value="op">
              {{ OperationSymbols[op] }} {{ OperationNames[op] }}
            </option>
          </optgroup>
        </select>
      </div>

      <div class="form__group">
        <label class="form__label">First Operand</label>
        <input
          v-model.number="firstOperand"
          class="form__input"
          type="number"
          step="any"
          placeholder="Enter first number"
          required
        />
      </div>

      <div v-if="!isUnaryOp" class="form__group">
        <label class="form__label">Second Operand</label>
        <input
          v-model.number="secondOperand"
          class="form__input"
          type="number"
          step="any"
          placeholder="Enter second number"
          required
        />
      </div>

      <button type="submit" class="button button--primary" :disabled="loading">Calculate</button>
    </form>

    <div v-if="error" class="message message--error">{{ error }}</div>
    <div v-if="loading" class="message message--loading">Calculating...</div>

    <div v-if="result" class="card card--result">
      <h3 class="card--result__title">Result</h3>
      <div class="card--result__expression">{{ result.expressionText }}</div>
      <div class="card--result__value">{{ result.result }}</div>
      <div v-if="computedTimeText" class="card--result__meta">
        Computed at: {{ computedTimeText }}
      </div>
    </div>
  </div>
</template>

<script>
import { expressionService, OperationType, OperationSymbols, OperationNames, UnaryOperations, BinaryOperations } from '../services/expressionService';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';

export default {
  data() {
    return {
      firstOperand: '',
      secondOperand: '',
      operation: OperationType.Addition,
      result: null,
      loading: false,
      error: null,
      OperationSymbols,
      OperationNames,
      UnaryOperations,
      BinaryOperations,
      unsubscribe: null
    };
  },
  computed: {
    isUnaryOp() {
      return UnaryOperations.includes(this.operation);
    },
    computedTimeText() {
      if (!this.result?.computedTime) return null;
      const date = new Date(this.result.computedTime);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleString();
    }
  },
  mounted() {
    this.unsubscribe = appStore.subscribe((state) => {
      this.result = state.calculationResult;
      this.loading = state.loading;
      this.error = state.error;
    });
  },
  unmounted() {
    this.unsubscribe?.();
  },
  methods: {
    handleSignOutAndRedirect() {
      authService.signOut();
      appStore.setUser(null);
      appStore.setRedirectMessage('Your session has expired. Please sign in again.');
      this.$router.push('/auth');
    },
    async handleCalculate() {
      appStore.setError(null);
      appStore.setLoading(true);

      try {
        const first = parseFloat(this.firstOperand);
        const second = this.isUnaryOp ? 0 : parseFloat(this.secondOperand);

        if (isNaN(first) || (!this.isUnaryOp && isNaN(second))) {
          throw new Error('Please enter valid numbers');
        }

        const result = await expressionService.calculate(this.operation, first, second);
        appStore.setCalculationResult(result);
      } catch (err) {
        if (err.status === 401) {
          this.handleSignOutAndRedirect();
        } else {
          appStore.setError(err.message || 'Calculation failed');
        }
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
