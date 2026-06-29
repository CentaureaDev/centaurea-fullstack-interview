<script setup>
import AsyncContent from '@/components/AsyncContent.vue';
import Card from '@/components/Card.vue';
import CustomButton from '@/components/CustomButton.vue';
import CustomForm from '@/components/CustomForm.vue';
import FormGroup from '@/components/FormGroup.vue';
import FormInput from '@/components/FormInput.vue';
import FormLabel from '@/components/FormLabel.vue';
import FormSelect from '@/components/FormSelect.vue';
import PageSection from '@/components/PageSection.vue';
import PageSectionHeader from '@/components/PageSectionHeader.vue';
import { useCalculate } from '@/composables/useApi';
import { useNotifications } from '@/composables/useNotifications';
import {
  BinaryOperations,
  formatDate,
  isValidRegexp,
  OperationNames,
  OperationSymbols,
  OperationType,
  RegexpOperation,
  UnaryOperations,
} from 'centaurea-ui-shared';
import { computed, ref, watch } from 'vue';

const calculate = useCalculate();
const notification = useNotifications();

const firstOperand = ref('');
const secondOperand = ref('');
const pattern = ref('');
const text = ref('');
const operation = ref(OperationType.Addition);

const isUnaryOp = computed(() => UnaryOperations.includes(operation.value));
const isRegexpOp = computed(() => operation.value === RegexpOperation);
const result = computed(() => calculate.data.value?.result ?? null);
const computedTimeText = computed(() => formatDate(result.value?.computedTime) || null);
const hasAsyncState = computed(() => calculate.isPending.value || Boolean(result.value));

watch(
  () => calculate.data.value,
  (data) => {
    if (!data?.regexpUsage) {
      return;
    }

    const usage = data.regexpUsage;
    notification.notifyInfo(`Regexp Usage Today: ${usage.used} / ${usage.total} (${usage.remaining} remaining)`);
    if (usage.remaining === 1) {
      notification.notifyWarning('Warning: You have 1 Regexp calculation remaining today!');
    }
  },
);

const handleCalculate = (event) => {
  event.preventDefault();

  if (isRegexpOp.value) {
    if (!pattern.value.trim() || !text.value.trim()) {
      notification.notifyError('Pattern and text are required for Regexp operation');
      return;
    }

    if (!isValidRegexp(pattern.value)) {
      notification.notifyError('Invalid regex pattern');
      return;
    }

    calculate.mutate({ operation: operation.value, pattern: pattern.value, text: text.value });
    return;
  }

  const first = Number.parseFloat(firstOperand.value);
  const second = isUnaryOp.value ? 0 : Number.parseFloat(secondOperand.value);

  if (Number.isNaN(first) || (!isUnaryOp.value && Number.isNaN(second))) {
    notification.notifyError('Please enter valid numbers');
    return;
  }

  calculate.mutate({ operation: operation.value, firstOperand: first, secondOperand: second });
};

const handleOperationChange = () => {
  // Keep input state untouched so users can switch operations without losing values.
};
</script>

<template>
  <PageSection>
    <PageSectionHeader title="Calculator" />

    <CustomForm @submit="handleCalculate">
      <FormGroup>
        <FormLabel>Operation</FormLabel>
        <FormSelect v-model.number="operation" @change="handleOperationChange">
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
        </FormSelect>
      </FormGroup>

      <template v-if="isRegexpOp">
        <FormGroup>
          <FormLabel>Pattern (Regular Expression)</FormLabel>
          <FormInput
            v-model="pattern"
            type="text"
            placeholder="Enter regex pattern (e.g., \d+)"
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Text to Search</FormLabel>
          <FormInput
            v-model="text"
            as="textarea"
            placeholder="Enter text to search"
            rows="4"
            required
          />
        </FormGroup>
      </template>

      <template v-else>
        <FormGroup>
          <FormLabel>First Operand</FormLabel>
          <FormInput
            v-model="firstOperand"
            type="number"
            step="any"
            placeholder="Enter first number"
            required
          />
        </FormGroup>

        <FormGroup v-if="!isUnaryOp">
          <FormLabel>Second Operand</FormLabel>
          <FormInput
            v-model="secondOperand"
            type="number"
            step="any"
            placeholder="Enter second number"
            required
          />
        </FormGroup>
      </template>

      <CustomButton type="submit" :disabled="calculate.isPending.value">Calculate</CustomButton>
    </CustomForm>

    <AsyncContent v-if="hasAsyncState" :is-loading="calculate.isPending.value" loading-message="Calculating...">
      <Card variant="result">
        <h3 class="card__title">Result</h3>
        <div class="card__expression">{{ result?.expressionText }}</div>
        <div class="card__value">{{ result?.result }}</div>
        <div v-if="computedTimeText" class="card__meta">Computed at: {{ computedTimeText }}</div>
      </Card>
    </AsyncContent>
  </PageSection>
</template>
