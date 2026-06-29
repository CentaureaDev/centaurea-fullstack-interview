import { onScopeDispose, shallowRef } from 'vue';

export function useStore(manager) {
  const state = shallowRef(manager.getSnapshot());
  const unsubscribe = manager.subscribe((snapshot) => {
    state.value = snapshot;
  });

  onScopeDispose(unsubscribe);

  return state;
}
