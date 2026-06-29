<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  className: {
    type: String,
    default: '',
  },
});

const attrs = useAttrs();
const classes = computed(() => {
  const variantClass = props.variant ? ` button--${props.variant}` : '';
  return `button${variantClass}${props.className ? ` ${props.className}` : ''}`;
});
</script>

<template>
  <button v-bind="attrs" :class="classes">
    <slot />
  </button>
</template>
