import { NotificationKey } from '@/providers/keys';
import { configureNotificationQueue } from 'centaurea-ui-shared';

export function provideNotifications(app, { defaultDuration } = {}) {
  const queue = configureNotificationQueue(defaultDuration);
  app.provide(NotificationKey, queue);
  return queue;
}
