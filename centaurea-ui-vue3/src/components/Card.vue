<script setup>
import { computed, useAttrs } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: '',
  },
  as: {
    type: String,
    default: 'div',
  },
  className: {
    type: String,
    default: '',
  },
});

defineEmits([]);

const attrs = useAttrs();
const classes = computed(() => {
  const variantClass = props.variant ? ` card--${props.variant}` : '';
  return `card${variantClass}${props.className ? ` ${props.className}` : ''}`;
});
</script>

<template>
  <component :is="props.as" v-bind="attrs" :class="classes">
    <slot />
  </component>
</template>
