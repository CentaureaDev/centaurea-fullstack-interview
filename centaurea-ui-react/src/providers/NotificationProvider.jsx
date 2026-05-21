import { configureNotificationQueue } from 'centaurea-ui-shared';
import { createContext, useContext, useEffect, useMemo } from 'react';
import NotificationStack from '../components/NotificationStack';
import { useStore } from '../hooks/useStore';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export function NotificationProvider({ children }) {
  const manager = useMemo(() => configureNotificationQueue(), []);
  const state = useStore(manager);

  useEffect(() => () => manager.destroy(), [manager]);

  const contextValue = useMemo(() => ({
    notify: manager.notify,
    notifySuccess: (message, duration) => manager.notify('info', message, duration),
    notifyError: (message, duration) => manager.notify('error', message, duration),
  }), [manager]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationStack notifications={state.notifications} onDismiss={manager.dismiss} />
    </NotificationContext.Provider>
  );
}


