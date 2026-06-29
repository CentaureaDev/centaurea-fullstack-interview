import { useSyncExternalStore } from 'react';

export const useStore = (store) => {
  const subscribe = (callback) => store.subscribe(callback);
  const getSnapshot = () => store.getSnapshot();

  return useSyncExternalStore(subscribe, getSnapshot);
};
