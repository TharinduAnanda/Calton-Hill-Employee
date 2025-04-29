// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import ThemeProviderWrapper from './components/ThemeProvider/ThemeProviderWrapper'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProviderWrapper> {/* Wrap AuthProvider with ThemeProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProviderWrapper>
  </React.StrictMode>
);