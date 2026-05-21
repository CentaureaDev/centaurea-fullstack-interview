import StatusMessage from './StatusMessage';

function NotificationStack({ notifications = [], onDismiss }) {
  if (!notifications.length) return null;

  return (
    <div className="notification-stack" aria-live="assertive" aria-atomic="true">
      {notifications.map((notification) => (
        <StatusMessage
          key={notification.id}
          variant={notification.variant}
          className="notification-stack__item"
        >
          <span className="notification-stack__message">{notification.message}</span>
          <button
            type="button"
            className="notification-stack__close"
            onClick={() => onDismiss?.(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </StatusMessage>
      ))}
    </div>
  );
}

export default NotificationStack;