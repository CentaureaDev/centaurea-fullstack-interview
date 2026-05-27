<script setup>
import StatusMessage from '@/components/StatusMessage.vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  isFetching: {
    type: Boolean,
    default: undefined,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Object, String, null],
    default: null,
  },
  isEmpty: {
    type: Boolean,
    default: false,
  },
  loadingMessage: {
    type: String,
    default: 'Loading...',
  },
  emptyMessage: {
    type: String,
    default: 'No data available',
  },
});

defineEmits([]);
</script>

<template>
  <template v-if="props.isError" />
  <StatusMessage v-else-if="props.isFetching ?? props.isLoading" variant="loading">
    {{ props.loadingMessage }}
  </StatusMessage>
  <StatusMessage v-else-if="props.isEmpty" variant="empty">
    {{ props.emptyMessage }}
  </StatusMessage>
  <slot v-else />
</template>
