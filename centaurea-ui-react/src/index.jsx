import 'centaurea-ui-shared/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ApiProvider, AuthProvider } from './providers';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5034/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider apiUrl={apiUrl}>
        <ApiProvider apiUrl={apiUrl}>
          <App />
        </ApiProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
