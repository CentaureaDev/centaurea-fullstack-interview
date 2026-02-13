// @ts-nocheck
import React from 'react';
import { ApiProvider } from './ApiProvider';
import { useAuth } from './AuthProvider';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.apiUrl
 */
export const ConfiguredApiProvider = ({ children, apiUrl }) => {
  const auth = useAuth();

  return (
    <ApiProvider
      apiUrl={apiUrl}
      getToken={() => auth?.token || null}
      onUnauthorized={() => {
        console.warn('Unauthorized - logging out');
        if (auth && auth.logout) {
          auth.logout();
        }
      }}
      onForbidden={() => {
        console.warn('Access forbidden');
      }}
    >
      {children}
    </ApiProvider>
  );
};
