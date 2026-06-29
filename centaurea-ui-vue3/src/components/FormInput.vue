<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  as: {
    type: String,
    default: 'input',
  },
  className: {
    type: String,
    default: '',
  },
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
const classes = computed(() => {
  const isTextarea = props.as === 'textarea';
  return `form__input${isTextarea ? ' form__textarea' : ''}${props.className ? ` ${props.className}` : ''}`;
});

const inputValue = computed(() => (props.modelValue !== undefined ? props.modelValue : attrs.value));

const toModelValue = (rawValue) => {
  let nextValue = rawValue;

  if (props.modelModifiers.trim && typeof nextValue === 'string') {
    nextValue = nextValue.trim();
  }

  if (props.modelModifiers.number) {
    const parsed = Number.parseFloat(nextValue);
    nextValue = Number.isNaN(parsed) ? nextValue : parsed;
  }

  return nextValue;
};

const handleInput = (event) => {
  emit('update:modelValue', toModelValue(event?.target?.value ?? ''));
};

const handleChange = (event) => {
  emit('update:modelValue', toModelValue(event?.target?.value ?? ''));
};
</script>

<template>
  <component
    :is="props.as"
    v-bind="attrs"
    :class="classes"
    :value="inputValue"
    @input="handleInput"
    @change="handleChange"
  >
    <slot />
  </component>
</template>
