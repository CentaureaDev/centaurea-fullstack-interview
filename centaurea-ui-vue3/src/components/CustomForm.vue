<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
});

defineEmits([]);

const attrs = useAttrs();
const classes = computed(() => {
  const variantClass = props.variant ? ` form--${props.variant}` : '';
  return `form${variantClass}${props.className ? ` ${props.className}` : ''}`;
});
</script>

<template>
  <form v-bind="attrs" :class="classes">
    <slot />
  </form>
</template>
