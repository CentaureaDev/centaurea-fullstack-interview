import { useStore } from '@/composables/useStore';
import { NotificationKey } from '@/providers/keys';
import { computed, inject } from 'vue';

export function useNotifications() {
  const queue = inject(NotificationKey);
  if (!queue) {
    throw new Error('useNotifications() requires provideNotifications() in main.js');
  }

  const state = useStore(queue);

  return {
    notifications: computed(() => state.value.notifications),
    notify: queue.notify,
    dismiss: queue.dismiss,
    destroy: queue.destroy,
    notifyInfo: (message, duration) => queue.notify('info', message, duration),
    notifyWarning: (message, duration) => queue.notify('warning', message, duration),
    notifyError: (message, duration) => queue.notify('error', message, duration),
  };
}
