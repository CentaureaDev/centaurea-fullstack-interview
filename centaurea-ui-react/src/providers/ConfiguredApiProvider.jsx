import { ApiProvider } from './ApiProvider';
import { useAuth } from './AuthProvider';

export const ConfiguredApiProvider = ({ children, apiUrl }) => {
  const auth = useAuth();

  return (
    <ApiProvider
      apiUrl={apiUrl}
      getToken={() => auth?.token || null}
      onUnauthorized={() => auth?.logout?.()}
      onForbidden={() => {}}
    >
      {children}
    </ApiProvider>
  );
};
