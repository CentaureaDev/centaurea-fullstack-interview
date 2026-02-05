<template>
  <div class="section">
    <div class="section__header">
      <h2 class="section__title">Calculator</h2>
    </div>
    <form @submit.prevent="handleCalculate" class="form">
      <div class="form__group">
        <label class="form__label">Operation</label>
        <select class="form__select" v-model.number="operation" @change="resetState">
          <optgroup label="Binary Operations">
            <option v-for="op in BinaryOperations" :key="op" :value="op">
              {{ OperationSymbols[op] }} {{ OperationNames[op] }}
            </option>
          </optgroup>
          <optgroup label="String Operations">
            <option :value="RegexpOperation">
              {{ OperationSymbols[RegexpOperation] }} {{ OperationNames[RegexpOperation] }}
            </option>
          </optgroup>
          <optgroup label="Unary Operations">
            <option v-for="op in UnaryOperations" :key="op" :value="op">
              {{ OperationSymbols[op] }} {{ OperationNames[op] }}
            </option>
          </optgroup>
        </select>
      </div>

      <template v-if="isRegexpOp">
        <div class="form__group">
          <label class="form__label">Pattern (Regular Expression)</label>
          <input
            v-model="pattern"
            class="form__input"
            type="text"
            placeholder="Enter regex pattern (e.g., \d+)"
            required
          />
        </div>
        <div class="form__group">
          <label class="form__label">Text to Search</label>
          <textarea
            v-model="text"
            class="form__input form__textarea"
            placeholder="Enter text to search"
            rows="4"
            required
          />
        </div>
      </template>
      <template v-else>
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
      </template>

      <button type="submit" class="button button--primary" :disabled="loading">Calculate</button>
    </form>

    <div v-if="showWarningToast" class="message message--warning u-margin-top-md">
      ⚠️ Warning: You have 1 Regexp calculation remaining today!
    </div>

    <div v-if="regexpUsage" class="message message--info u-margin-top-md">
      Regexp Usage Today: {{ regexpUsage.used }} / {{ regexpUsage.total }} ({{ regexpUsage.remaining }} remaining)
    </div>

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
import { expressionService, OperationType, OperationSymbols, OperationNames, UnaryOperations, BinaryOperations, RegexpOperation } from '../services/expressionService';
import { appStore } from '../store/appStore';
import { authService } from '../services/authService';

export default {
  data() {
    return {
      firstOperand: '',
      secondOperand: '',
      pattern: '',
      text: '',
      operation: OperationType.Addition,
      result: null,
      loading: false,
      error: null,
      regexpUsage: null,
      showWarningToast: false,
      OperationSymbols,
      OperationNames,
      UnaryOperations,
      BinaryOperations,
      RegexpOperation,
      unsubscribe: null
    };
  },
  computed: {
    isUnaryOp() {
      return UnaryOperations.includes(this.operation);
    },
    isRegexpOp() {
      return this.operation === RegexpOperation;
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
    resetState() {
      this.result = null;
      this.regexpUsage = null;
      this.showWarningToast = false;
    },
    handleSignOutAndRedirect() {
      authService.signOut();
      appStore.setUser(null);
      appStore.setRedirectMessage('Your session has expired. Please sign in again.');
      this.$router.push('/auth');
    },
    async handleCalculate() {
      appStore.setError(null);
      appStore.setLoading(true);
      this.regexpUsage = null;
      this.showWarningToast = false;

      try {
        let responseData;

        if (this.isRegexpOp) {
          if (!this.pattern.trim() || !this.text.trim()) {
            throw new Error('Pattern and text are required for Regexp operation');
          }
          
          // Validate regex pattern syntax
          try {
            new RegExp(this.pattern);
          } catch (regexError) {
            throw new Error(`Invalid regex pattern: ${regexError.message}`);
          }
          
          responseData = await expressionService.calculate(this.operation, 0, 0, this.pattern, this.text);
        } else {
          const first = parseFloat(this.firstOperand);
          const second = this.isUnaryOp ? 0 : parseFloat(this.secondOperand);

          if (isNaN(first) || (!this.isUnaryOp && isNaN(second))) {
            throw new Error('Please enter valid numbers');
          }
          responseData = await expressionService.calculate(this.operation, first, second);
        }

        // Handle response - it may be wrapped in a response object
        const resultData = responseData.result || responseData;
        appStore.setCalculationResult(resultData);

        // Handle regexp usage info
        if (responseData.regexpUsage) {
          this.regexpUsage = responseData.regexpUsage;
          // Show warning toast if user has 1 calculation remaining
          if (responseData.regexpUsage.remaining === 1) {
            this.showWarningToast = true;
            setTimeout(() => {
              this.showWarningToast = false;
            }, 5000);
          }
        }
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
