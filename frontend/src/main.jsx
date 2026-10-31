import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { RoleProvider } from './context/RoleContext';
import { ToastProvider } from './context/ToastContext';
import { RequestsProvider } from './context/RequestsContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <RoleProvider>
          <RequestsProvider>
            <App />
          </RequestsProvider>
        </RoleProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
