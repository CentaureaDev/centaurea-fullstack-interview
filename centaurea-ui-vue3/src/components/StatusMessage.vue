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

const attrs = useAttrs();
const classes = computed(() => `message message--${props.variant}${props.className ? ` ${props.className}` : ''}`);
</script>

<template>
  <div v-bind="attrs" :class="classes">
    <slot />
  </div>
</template>
