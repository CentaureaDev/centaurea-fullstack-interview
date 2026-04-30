import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider, ConfiguredApiProvider } from './providers';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5034/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider apiUrl={apiUrl}>
        <ConfiguredApiProvider apiUrl={apiUrl}>
          <App />
        </ConfiguredApiProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
