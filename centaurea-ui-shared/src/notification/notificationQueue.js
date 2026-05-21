import { StatefulManager } from '../state/statefulManager.js';

const DEFAULT_DURATION = 10000;

class NotificationQueue extends StatefulManager {
  #defaultDuration;
  #timers = new Map();

  constructor(defaultDuration = DEFAULT_DURATION) {
    super({ notifications: [] });
    this.#defaultDuration = defaultDuration;

    this.notify = this.notify.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  notify(variant, message, duration = this.#defaultDuration) {
    if (!message) return null;

    const notification = {
      id: globalThis.crypto?.randomUUID?.() ?? `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      variant,
      message,
    };

    const { notifications } = this.getSnapshot();
    this.setState({ notifications: [...notifications, notification] });
    this.#scheduleDismiss(notification.id, duration);

    return notification;
  }

  dismiss(id) {
    const { notifications } = this.getSnapshot();
    if (!notifications.length) return;

    const targetId = id ?? notifications[0]?.id;
    if (!targetId) return;

    this.#clearDismissTimeout(targetId);

    this.setState({
      notifications: notifications.filter((notification) => notification.id !== targetId),
    });
  }

  destroy() {
    for (const timeoutId of this.#timers.values()) {
      globalThis.clearTimeout(timeoutId);
    }

    this.#timers.clear();
    this.setState({ notifications: [] });
  }

  #scheduleDismiss(id, duration) {
    if (!(duration > 0)) return;

    const timeoutId = globalThis.setTimeout(() => {
      this.#timers.delete(id);
      this.dismiss(id);
    }, duration);

    this.#timers.set(id, timeoutId);
  }

  #clearDismissTimeout(id) {
    const timeoutId = this.#timers.get(id);
    if (!timeoutId) return;

    globalThis.clearTimeout(timeoutId);
    this.#timers.delete(id);
  }
}

export { NotificationQueue };
export const configureNotificationQueue = (defaultDuration) => new NotificationQueue(defaultDuration);