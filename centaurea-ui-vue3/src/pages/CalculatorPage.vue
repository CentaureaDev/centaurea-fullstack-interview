<template>
  <div class="calculator-section">
    <form @submit.prevent="handleCalculate" class="calculator-form">
      <div class="form-group">
        <label>Operation</label>
        <select v-model.number="operation" @change="result = null">
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

      <div class="form-group">
        <label>First Operand</label>
        <input
          v-model.number="firstOperand"
          type="number"
          step="any"
          placeholder="Enter first number"
          required
        />
      </div>

      <div v-if="!isUnaryOp" class="form-group">
        <label>Second Operand</label>
        <input
          v-model.number="secondOperand"
          type="number"
          step="any"
          placeholder="Enter second number"
          required
        />
      </div>

      <button type="submit" class="calculate-btn" :disabled="loading">Calculate</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Calculating...</div>

    <div v-if="result" class="result">
      <h3>Result</h3>
      <div class="result-expression">{{ result.expressionText }}</div>
      <div class="result-value">{{ result.result }}</div>
      <div class="result-meta">
        Computed at: {{ new Date(result.computedTime).toLocaleString() }}
      </div>
    </div>
  </div>
</template>

<script>
import { expressionService, OperationType, OperationSymbols, OperationNames, UnaryOperations, BinaryOperations } from '../services/expressionService';
import { appStore } from '../store/appStore';

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
        appStore.setError(err.message || 'Calculation failed');
      } finally {
        appStore.setLoading(false);
      }
    }
  }
};
</script>
