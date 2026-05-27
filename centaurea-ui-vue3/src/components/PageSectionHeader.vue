<script setup>
import { computed, useSlots } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

defineEmits([]);

const slots = useSlots();
const hasActions = computed(() => Boolean(slots.default));
</script>

<template>
  <div class="section__header">
    <h2 class="section__title">{{ props.title }}</h2>
    <div v-if="hasActions" class="grid__buttons">
      <slot />
    </div>
  </div>
</template>
