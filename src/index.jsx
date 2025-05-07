import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CalendarProvider } from './contexts/CalendarContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <App />
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);