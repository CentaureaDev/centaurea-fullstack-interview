<script setup>
const props = defineProps({
  htmlFor: {
    type: String,
    default: '',
  },
});

defineEmits([]);
</script>

<template>
  <label class="form__label" :for="props.htmlFor || undefined">
    <slot />
  </label>
</template>
