<script setup>
import StatusMessage from '@/components/StatusMessage.vue';

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['dismiss']);

const handleDismiss = (id) => {
  emit('dismiss', id);
};
</script>

<template>
  <div v-if="props.notifications.length" class="notification-stack" aria-live="assertive" aria-atomic="true">
    <StatusMessage
      v-for="notification in props.notifications"
      :key="notification.id"
      :variant="notification.variant"
      class-name="notification-stack__item"
    >
      <span class="notification-stack__message">{{ notification.message }}</span>
      <button
        type="button"
        class="notification-stack__close"
        aria-label="Close notification"
        @click="handleDismiss(notification.id)"
      >
        ×
      </button>
    </StatusMessage>
  </div>
</template>
