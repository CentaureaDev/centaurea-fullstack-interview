import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, ConfiguredApiProvider } from './providers';
import App from './App';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider apiUrl={apiUrl}>
      <ConfiguredApiProvider apiUrl={apiUrl}>
        <App />
      </ConfiguredApiProvider>
    </AuthProvider>
  </React.StrictMode>
);
