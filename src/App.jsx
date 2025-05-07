import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import TodoPage from './pages/TodoPage';
import CalendarPage from './pages/CalendarPage';
import Login from './components/auth/Login';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ChatBot from './components/common/ChatBot';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <div className="App min-h-screen flex flex-col">
      {isAuthenticated ? (
        <div className="flex flex-1 h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-6 bg-background">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/todo" element={
                  <ProtectedRoute>
                    <TodoPage />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ChatBot />
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;