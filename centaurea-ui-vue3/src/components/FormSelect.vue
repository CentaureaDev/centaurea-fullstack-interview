<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    default: undefined,
  },
  modelModifiers: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue']);

const attrs = useAttrs();

const selectedValue = computed(() => (props.modelValue !== undefined ? props.modelValue : attrs.value));

const toModelValue = (rawValue) => {
  if (!props.modelModifiers.number) {
    return rawValue;
  }

  const parsed = Number.parseFloat(rawValue);
  return Number.isNaN(parsed) ? rawValue : parsed;
};

const handleChange = (event) => {
  emit('update:modelValue', toModelValue(event?.target?.value ?? ''));
};
</script>

<template>
  <select v-bind="attrs" class="form__select" :value="selectedValue" @change="handleChange">
    <slot />
  </select>
</template>
