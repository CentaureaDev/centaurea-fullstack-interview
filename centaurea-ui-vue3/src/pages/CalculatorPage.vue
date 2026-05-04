<script setup>
import { ref, computed, watch } from 'vue';
import { useCalculate } from '../composables/expressions/useCalculate.js';
import {
  BinaryOperations,
  OperationNames,
  OperationSymbols,
  OperationType,
  RegexpOperation,
  UnaryOperations,
} from '../composables/expressions/index.js';

const { mutate, isPending, error, data } = useCalculate();

const firstOperand = ref('');
const secondOperand = ref('');
const pattern = ref('');
const text = ref('');
const operation = ref(OperationType.Addition);
const regexpUsage = ref(null);
const showWarningToast = ref(false);
const localError = ref(null);

const isUnaryOp = computed(() => UnaryOperations.includes(operation.value));
const isRegexpOp = computed(() => operation.value === RegexpOperation);

const result = computed(() => data.value?.result ?? null);
const computedTimeText = computed(() => {
  const time = result.value?.computedTime;
  if (!time) return null;
  const date = new Date(time);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
});
const displayError = computed(() => error.value?.message || localError.value);

watch(data, (newData) => {
  if (newData?.regexpUsage) {
    regexpUsage.value = newData.regexpUsage;
    if (newData.regexpUsage.remaining === 1) {
      showWarningToast.value = true;
      setTimeout(() => {
        showWarningToast.value = false;
      }, 5000);
    }
  }
});

const resetState = () => {
  regexpUsage.value = null;
  showWarningToast.value = false;
};

const handleCalculate = () => {
  localError.value = null;
  regexpUsage.value = null;
  showWarningToast.value = false;

  try {
    if (isRegexpOp.value) {
      if (!pattern.value.trim() || !text.value.trim()) {
        throw new Error('Pattern and text are required for Regexp operation');
      }
      try {
        new RegExp(pattern.value);
      } catch (regexError) {
        throw new Error(`Invalid regex pattern: ${regexError.message}`);
      }
      mutate({ operation: operation.value, pattern: pattern.value, text: text.value });
    } else {
      const first = parseFloat(firstOperand.value);
      const second = isUnaryOp.value ? 0 : parseFloat(secondOperand.value);
      if (isNaN(first) || (!isUnaryOp.value && isNaN(second))) {
        throw new Error('Please enter valid numbers');
      }
      mutate({ operation: operation.value, firstOperand: first, secondOperand: second });
    }
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Calculation failed';
  }
};
</script>

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

      <button type="submit" class="button button--primary" :disabled="isPending">Calculate</button>
    </form>

    <div v-if="showWarningToast" class="message message--warning u-margin-top-md">
      ⚠️ Warning: You have 1 Regexp calculation remaining today!
    </div>

    <div v-if="regexpUsage" class="message message--info u-margin-top-md">
      Regexp Usage Today: {{ regexpUsage.used }} / {{ regexpUsage.total }} ({{ regexpUsage.remaining }} remaining)
    </div>

    <div v-if="displayError" class="message message--error">
      <div v-for="(line, idx) in displayError.split('\n')" :key="idx">{{ line }}</div>
    </div>
    <div v-if="isPending" class="message message--loading">Calculating...</div>

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
