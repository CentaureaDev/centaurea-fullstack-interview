import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import StatusMessage from '../components/StatusMessage';

const NotificationContext = createContext(null);

const DEFAULT_DURATION = 10000;

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const removeNotification = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNotification(null);
  }, []);

  const notify = useCallback((variant, message, duration = DEFAULT_DURATION) => {
    if (!message) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const id = crypto.randomUUID();
    setNotification({ id, variant, message });

    timeoutRef.current = window.setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, duration);
  }, []);

  const notifySuccess = useCallback((message, duration) => {
    notify('info', message, duration);
  }, [notify]);

  const notifyError = useCallback((message, duration) => {
    notify('error', message, duration);
  }, [notify]);

  const contextValue = useMemo(
    () => ({ notify, notifySuccess, notifyError, removeNotification }),
    [notify, notifySuccess, notifyError, removeNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && (
        <div className="notification-stack" aria-live="assertive" aria-atomic="true">
          <StatusMessage
            key={notification.id}
            variant={notification.variant}
            className="notification-stack__item"
          >
            <span className="notification-stack__message">{notification.message}</span>
            <button
              type="button"
              className="notification-stack__close"
              onClick={removeNotification}
              aria-label="Close notification"
            >
              ×
            </button>
          </StatusMessage>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
