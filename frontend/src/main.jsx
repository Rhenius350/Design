import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TransactionProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </TransactionProvider>
    </AuthProvider>
  </React.StrictMode>,
);
